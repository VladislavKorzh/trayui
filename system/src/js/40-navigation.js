  /* ---------- Navigation ---------- */

  /* The pill of a segmented control of radios, and of a strip of tabs or links, slides to the chosen item. Every .tray-seg
     and .tray-tabs gets it, with no attribute of its own. A choice made from script slides it too: a radio set from script
     needs a change event, as it would for a form; tabs and links are followed through aria-selected and aria-current. */
  UI.upgrade('.tray-seg', function (strip) {
    if (!$('input[type="radio"]', strip)) return;
    var place = glide(strip, function () { var i = $('input:checked', strip); return i && i.nextElementSibling; });
    strip.addEventListener('change', function () { place(); });
  });
  UI.upgrade('.tray-tabs', function (strip) {
    var place = glide(strip, function () { return $('[aria-selected="true"], [aria-current]:not([aria-current="false"])', strip); });
    if (window.MutationObserver) new MutationObserver(function () { place(); }).observe(strip, { subtree: true, attributes: true, attributeFilter: ['aria-selected', 'aria-current'] });
  });

  /* Tabs: data-tray="tabs" on the wrapper of a [role=tablist] of [role=tab] buttons (each aria-controls a panel) and the panels. */
  UI.register('tabs', function (root) {
    var list = $('[role="tablist"]', root), tabs = $$('[role="tab"]', list);
    /* select(tab, focus, first): first is the tab set up at load, which is no change: it fires nothing and does not fade. */
    function select(tab, focus, first) {
      tabs.forEach(function (t) {
        var on = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', String(on));
        t.setAttribute('tabindex', on ? '0' : '-1');
        if (panel) panel.hidden = !on;
      });
      if (first) return;
      root.setAttribute('data-switched', '');  /* a panel shown by a choice fades in; the first one is simply there */
      if (focus) tab.focus();
      fire(root, 'change', { tab: tab.id || tab.getAttribute('aria-controls') });
    }
    list.addEventListener('click', function (e) { var t = e.target.closest('[role="tab"]'); if (t && !t.disabled) select(t); });
    list.addEventListener('keydown', function (e) {
      var live = tabs.filter(function (t) { return !t.disabled; }), i = live.indexOf(document.activeElement);
      var rtl = getComputedStyle(list).direction === 'rtl', step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key], to = null;
      if (step && i >= 0) to = live[(i + step + live.length) % live.length];
      else if (e.key === 'Home') to = live[0];
      else if (e.key === 'End') to = live[live.length - 1];
      if (to) { e.preventDefault(); select(to, true); }
    });
    select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0], false, true);
  });

  /* Strip: data-tray="strip" on a .tray-tabs that may overflow; marks it is-clipped while tabs run past the end edge. */
  UI.register('strip', function (strip) {
    function clip() { strip.classList.toggle('is-clipped', Math.abs(strip.scrollLeft) + strip.clientWidth < strip.scrollWidth - 8); }
    strip.addEventListener('scroll', clip, { passive: true });
    watch(strip, clip);
  });

  /* The items of one menu panel, not those of a submenu inside it. */
  var OWN_ITEMS = '[role^="menuitem"]:not(.tray-submenu > .tray-pop *)';
  /* What a menu item reports as its value: its data-value, or its words without its icon and its shortcut ("Duplicate",
     not "DuplicateCtrl D"), as an option of a list reports them. */
  function itemValue(it) { return it.dataset.value || optionWords(it); }

  /* A submenu: in a .tray-submenu, an item with aria-haspopup="menu" and the .tray-pop beside it, which becomes a menu of
     its own. The item opens it with the arrow towards it (ArrowRight, or ArrowLeft right to left), Enter or Space, and
     reports aria-expanded; the pointer resting on the item opens it too. Up and down stay inside it; the arrow back or
     Escape closes it and puts focus back on its item. It is shown by data-open, so focus that only passes by does not
     open it. */
  function submenu(box) {
    var item = $(':scope > [aria-haspopup]', box), sub = $(':scope > .tray-pop', box), timer = null;
    if (!item || !sub) return;
    item.id = item.id || uid('tray-menuitem');
    sub.setAttribute('role', 'menu');
    sub.setAttribute('aria-labelledby', item.id);
    $$('[role^="menuitem"]', sub).forEach(function (i) { i.setAttribute('tabindex', '-1'); });
    function arrows() { var rtl = getComputedStyle(box).direction === 'rtl'; return { into: rtl ? 'ArrowLeft' : 'ArrowRight', out: rtl ? 'ArrowRight' : 'ArrowLeft' }; }
    function set(open, focus) {
      clearTimeout(timer);
      if (open && item.getAttribute('aria-disabled') === 'true') return;
      if (!open) rescue(sub, item);
      sub.toggleAttribute('data-open', open);
      item.setAttribute('aria-expanded', String(open));
      var first = $('[role^="menuitem"]', sub);
      if (open && focus && first) first.focus();
    }
    item.setAttribute('aria-expanded', 'false');
    set(sub.hasAttribute('data-open'));
    rove(sub, '[role^="menuitem"]');
    item.addEventListener('click', function () { set(true, true); });
    item.addEventListener('keydown', function (e) { if (e.key === arrows().into) { e.preventDefault(); e.stopPropagation(); set(true, true); } });
    sub.addEventListener('keydown', function (e) {
      if (e.key === arrows().out || e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); set(false); }
      /* the menu around it would take these for its own items */
      else if (/^(ArrowUp|ArrowDown|Home|End)$/.test(e.key)) e.stopPropagation();
    });
    box.addEventListener('pointerenter', function () { set(true); });
    /* the pointer may cross the gap to the panel: it closes a moment after the pointer has left both, unless focus is in it */
    box.addEventListener('pointerleave', function () { clearTimeout(timer); timer = setTimeout(function () { if (!sub.contains(document.activeElement)) set(false); }, 300); });
    box.addEventListener('focusout', function (e) { if (!box.contains(e.relatedTarget)) set(false); });
  }

  /* Menu: data-tray="menu" on the anchor that holds a trigger button and a .tray-pop of menu items.
     Items are role=menuitem, menuitemcheckbox or menuitemradio (with data-group). An action fires tray:select with
     detail.value and closes the menu; a check or radio item fires tray:change with detail.value and detail.checked, and
     the menu stays open. */
  UI.register('menu', function (root) {
    var trigger = root.querySelector(':scope > button, :scope > a'), panel = root.querySelector(':scope > .tray-pop');
    if (!trigger || !panel) return;
    function items() { return $$(OWN_ITEMS, panel).filter(function (i) { return i.offsetParent !== null; }); }
    panel.setAttribute('role', 'menu');
    trigger.setAttribute('aria-haspopup', 'menu');
    $$('[role^="menuitem"]', panel).forEach(function (i) { i.setAttribute('tabindex', '-1'); });
    /* The head of a user menu (who is signed in) is not an item, so a screen reader inside the menu never reaches it: the
       name and the line under it name the menu instead, and are read as it opens. */
    var head = $(':scope > .tray-pop__head', panel);
    if (!panel.hasAttribute('aria-label') && !panel.hasAttribute('aria-labelledby')) {
      /* Any other menu is named by the button that opens it, as a menu must have a name. */
      var who = head ? $('.tray-person__text', head) || head : trigger;
      who.id = who.id || uid(head ? 'tray-menu-name' : 'tray-menu-button');
      panel.setAttribute('aria-labelledby', who.id);
    }
    var pop = popup(trigger, panel, { onOpen: function () { var first = items()[0]; if (first) first.focus(); } });
    rove(panel, OWN_ITEMS);
    /* Shift+Tab from an item would land on the trigger, which counts as inside, and leave the menu open: it closes the
       menu as Tab does, and focus goes to the trigger. */
    panel.addEventListener('keydown', function (e) { if (e.key === 'Tab' && e.shiftKey && pop.isOpen()) { e.preventDefault(); pop.close(true); } });
    $$('.tray-submenu', panel).forEach(submenu);
    panel.addEventListener('click', function (e) {
      var it = e.target.closest('[role^="menuitem"]');
      if (!it || it.getAttribute('aria-disabled') === 'true' || it.hasAttribute('aria-haspopup')) return;
      var role = it.getAttribute('role'), value = itemValue(it);
      if (role === 'menuitemcheckbox') {
        var on = it.getAttribute('aria-checked') !== 'true';
        it.setAttribute('aria-checked', String(on));
        fire(root, 'change', { value: value, checked: on });
        return;
      }
      if (role === 'menuitemradio') {
        $$('[role="menuitemradio"][data-group="' + it.dataset.group + '"]', panel).forEach(function (x) { x.setAttribute('aria-checked', String(x === it)); });
        fire(root, 'change', { value: value, checked: true });
        return;
      }
      fire(root, 'select', { value: value });
      pop.close(true);
    });
    trigger.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); pop.open(); } });
    root.__menu = pop;
  });

  /* Menubar: data-tray="menubar" on the strip of menus. Its triggers become the bar's menu items and one stop for Tab:
     the arrow keys move along the bar (mirrored right to left) and Home and End go to its ends. With one menu open,
     pointing at another opens it, and the arrows open the next one. */
  UI.register('menubar', function (bar) {
    function menus() { return $$(':scope > [data-tray~="menu"]', bar); }
    function triggerOf(m) { return m.querySelector(':scope > button, :scope > a'); }
    function openOnly(m) { menus().forEach(function (x) { if (x.__menu) { if (x === m) x.__menu.open(); else x.__menu.close(); } }); }
    function stop(t) { menus().forEach(function (m) { var x = triggerOf(m); if (x) x.setAttribute('tabindex', x === t ? '0' : '-1'); }); }
    bar.setAttribute('role', 'menubar');
    menus().forEach(function (m) { var t = triggerOf(m); if (t) t.setAttribute('role', 'menuitem'); });
    if (menus()[0]) stop(triggerOf(menus()[0]));
    /* the trigger last used keeps the bar's Tab stop */
    bar.addEventListener('focusin', function (e) { var m = e.target.closest('[data-tray~="menu"]'); if (m && m.parentNode === bar && triggerOf(m) === e.target) stop(e.target); });
    bar.addEventListener('pointerover', function (e) {
      var m = e.target.closest('[data-tray~="menu"]');
      if (m && m.parentNode === bar && menus().some(function (x) { return x.__menu && x.__menu.isOpen(); }) && !m.__menu.isOpen()) openOnly(m);
    });
    bar.addEventListener('keydown', function (e) {
      var rtl = getComputedStyle(bar).direction === 'rtl', step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
      var list = menus(), i = list.indexOf(e.target.closest('[data-tray~="menu"]')), to = -1;
      if (i < 0) return;
      if (step) to = (i + step + list.length) % list.length;
      else if (e.target === triggerOf(list[i]) && e.key === 'Home') to = 0;
      else if (e.target === triggerOf(list[i]) && e.key === 'End') to = list.length - 1;
      if (to < 0) return;
      var wasOpen = list[i].__menu.isOpen();
      e.preventDefault();
      triggerOf(list[to]).focus();
      if (wasOpen) openOnly(list[to]);
    });
  });

  /* Context menu: data-tray="contextmenu" on a region that holds a .tray-pop menu; it opens where the region is right-clicked. */
  UI.register('contextmenu', function (region) {
    var panel = $('.tray-pop', region);
    panel.setAttribute('role', 'menu');
    /* a name on a plain div is not read without a role: the region is a named group */
    if (!region.hasAttribute('role') && /^(DIV|SPAN)$/.test(region.tagName) && (region.hasAttribute('aria-label') || region.hasAttribute('aria-labelledby'))) region.setAttribute('role', 'group');
    $$('[role^="menuitem"]', panel).forEach(function (i) { i.setAttribute('tabindex', '-1'); });
    /* focus in the menu goes back to the region before the menu goes, not to the top of the page */
    function close() { rescue(panel, region); hide(panel); }
    function openAt(x, y) {
      var box = region.getBoundingClientRect();
      show(panel);
      panel.style.insetInlineStart = clamp(x - box.left, 8, Math.max(8, box.width - panel.offsetWidth - 8)) + 'px';
      panel.style.insetBlockStart = clamp(y - box.top, 8, Math.max(8, box.height - panel.offsetHeight - 8)) + 'px';
      fit(panel);
      var first = $(OWN_ITEMS, panel);
      if (first) first.focus();
    }
    if (!panel.hasAttribute('data-open')) close();
    region.addEventListener('contextmenu', function (e) { e.preventDefault(); openAt(e.clientX, e.clientY); });
    region.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); region.focus(); }
      if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); var b = region.getBoundingClientRect(); openAt(b.left + 24, b.top + 24); }
    });
    rove(panel, OWN_ITEMS);
    $$('.tray-submenu', panel).forEach(submenu);
    panel.addEventListener('click', function (e) { var it = e.target.closest('[role^="menuitem"]'); if (it && it.getAttribute('aria-disabled') !== 'true' && !it.hasAttribute('aria-haspopup')) { fire(region, 'select', { value: itemValue(it) }); close(); } });
    /* Tab out of the menu closes it, as it does a dropdown menu */
    panel.addEventListener('focusout', function (e) { var to = e.relatedTarget; if (!panel.hidden && to && !panel.contains(to)) hide(panel); });
    document.addEventListener('pointerdown', function (e) { if (!panel.hidden && !panel.contains(e.target) && e.button !== 2) close(); });
  });

  /* Sidebar: data-tray="sidebar-toggle" on a button whose aria-controls names the sidebar; it collapses it to icons. The
     button's name says what a press will do: data-label-collapse and data-label-expand (by default its aria-label and
     "Expand the sidebar"), while aria-expanded says how the sidebar is. */
  UI.register('sidebar-toggle', function (btn) {
    var side = document.getElementById(btn.getAttribute('aria-controls'));
    if (!side) return;
    var named = btn.getAttribute('aria-label'), rail = side.hasAttribute('data-collapsed');
    btn.dataset.labelCollapse = btn.dataset.labelCollapse || (!rail && named) || 'Collapse the sidebar';
    btn.dataset.labelExpand = btn.dataset.labelExpand || (rail && named) || 'Expand the sidebar';
    function paint() {
      var open = !side.hasAttribute('data-collapsed');
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? btn.dataset.labelCollapse : btn.dataset.labelExpand);
    }
    btn.addEventListener('click', function () { side.toggleAttribute('data-collapsed'); paint(); fire(side, 'change', { collapsed: side.hasAttribute('data-collapsed') }); });
    paint();
  });

  /* Sidebar on a small screen: data-tray="sidebar-sheet" on the tray-app__menu button whose aria-controls names the sidebar.
     It opens that same sidebar in a sheet and puts it back where it was when the sheet closes. The sheet comes from the start side,
     or from the end side when the sidebar stands after the content (tray-app--end, the second one of tray-app--both). */
  UI.register('sidebar-sheet', function (btn) {
    var side = document.getElementById(btn.getAttribute('aria-controls'));
    if (!side) return;
    var home = side.parentNode, next = side.nextSibling, sheet = null, wasCollapsed = false;
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      if (!sheet) {
        sheet = document.createElement('dialog');
        var before = home.previousElementSibling, atEnd = !!(before && before.classList.contains('tray-app__main'));
        sheet.className = 'tray-sheet tray-sheet--nav' + (atEnd ? '' : ' tray-sheet--start');
        sheet.setAttribute('data-tray', 'dialog');
        if (side.getAttribute('aria-labelledby')) sheet.setAttribute('aria-labelledby', side.getAttribute('aria-labelledby'));
        else sheet.setAttribute('aria-label', side.getAttribute('aria-label') || 'Navigation');
        sheet.innerHTML = '<button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon tray-sheet__close" type="button" data-close aria-label="Close">' + icon('x') + '</button>';
        document.body.appendChild(sheet);
        UI.init(sheet);
        sheet.addEventListener('close', function () {
          if (wasCollapsed) side.setAttribute('data-collapsed', '');
          home.insertBefore(side, next && next.parentNode === home ? next : null);
          btn.setAttribute('aria-expanded', 'false');
          fire(btn, 'close');
        });
        sheet.addEventListener('click', function (e) { if (e.target.closest('a[href]')) shut(sheet); });
        if (window.matchMedia) window.matchMedia('(min-width: 56rem)').addEventListener('change', function (e) { if (e.matches && sheet.open) sheet.close(); });
      }
      wasCollapsed = side.hasAttribute('data-collapsed');
      side.removeAttribute('data-collapsed');
      sheet.appendChild(side);
      sheet.showModal();
      btn.setAttribute('aria-expanded', 'true');
      fire(btn, 'open');
    });
  });

  /* Command: data-tray="command" on .tray-command. Typing filters the options; groups ([data-group]) with nothing left are hidden.
     Fires tray:select with detail.value. */
  UI.register('command', function (root) {
    var input = $('input', root), list = $('.tray-command__list', root), empty = $('.tray-list__empty', root), active = null;
    function options() { return $$('[role="option"]', list); }
    function visible() { return options().filter(function (o) { return !o.hidden; }); }
    list.setAttribute('role', 'listbox');
    list.id = list.id || uid('tray-listbox');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('autocomplete', 'off');
    options().forEach(function (o) { o.id = o.id || uid('tray-option'); o.setAttribute('tabindex', '-1'); });
    /* A listbox holds options and groups only: the no-match sentence inside it is for the eye, and the status line below
       says the same words to a screen reader. */
    if (empty) empty.setAttribute('aria-hidden', 'true');
    /* a group of options is a group of the listbox, named by its label, so the name is read on the way into it */
    $$('[data-group]', list).forEach(function (g) {
      var label = $(':scope > .tray-list__label', g);
      if (!g.hasAttribute('role')) g.setAttribute('role', 'group');
      if (label && !g.hasAttribute('aria-labelledby') && !g.hasAttribute('aria-label')) { label.id = label.id || uid('tray-group'); g.setAttribute('aria-labelledby', label.id); }
    });
    function setActive(o) {
      if (active) active.removeAttribute('data-active');
      active = o || null;
      if (active) { active.setAttribute('data-active', ''); input.setAttribute('aria-activedescendant', active.id); if (active.scrollIntoView) active.scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    /* Focus stays in the field, where nothing reads the list as it narrows: a status line says how many options are left,
       or the no-match sentence, when those words change. data-found words the count, "{n} found"; by default "1 match",
       "3 matches". */
    var tell = quietStatus(root);
    function found(n) { return root.dataset.found ? root.dataset.found.replace('{n}', n) : n + (n === 1 ? ' match' : ' matches'); }
    /* The filter and the value look at the option's name: the keys of its shortcut (G O) are not words to find it by. */
    function filter() {
      var q = input.value.trim().toLowerCase();
      options().forEach(function (o) { o.hidden = !!q && optionWords(o).toLowerCase().indexOf(q) < 0; });
      $$('[data-group]', list).forEach(function (g) { g.hidden = !$$('[role="option"]', g).some(function (o) { return !o.hidden; }); });
      var n = visible().length;
      if (empty) empty.hidden = n > 0;
      tell(!q ? '' : n ? found(n) : (empty ? empty.textContent.trim() : found(0)));
      setActive(visible()[0]);
    }
    function run(o) { fire(root, 'select', { value: o.dataset.value || optionWords(o) }); }
    input.addEventListener('input', filter);
    input.addEventListener('keydown', function (e) {
      var vis = visible(), i = vis.indexOf(active);
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(vis[(i + 1) % vis.length]); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(vis[(i - 1 + vis.length) % vis.length]); }
      else if (e.key === 'Enter' && active) { e.preventDefault(); run(active); }
    });
    list.addEventListener('pointerdown', function (e) { e.preventDefault(); });
    list.addEventListener('pointermove', function (e) { var o = e.target.closest('[role="option"]'); if (o && o !== active) setActive(o); });
    list.addEventListener('click', function (e) { var o = e.target.closest('[role="option"]'); if (o) run(o); });
    filter();
  });
