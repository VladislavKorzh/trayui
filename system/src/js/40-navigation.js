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
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', String(on));
        t.setAttribute('tabindex', on ? '0' : '-1');
        if (panel) panel.hidden = !on;
      });
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
    select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
  });

  /* Strip: data-tray="strip" on a .tray-tabs that may overflow; marks it is-clipped while tabs run past the end edge. */
  UI.register('strip', function (strip) {
    function clip() { strip.classList.toggle('is-clipped', Math.abs(strip.scrollLeft) + strip.clientWidth < strip.scrollWidth - 8); }
    strip.addEventListener('scroll', clip, { passive: true });
    watch(strip, clip);
  });

  /* Menu: data-tray="menu" on the anchor that holds a trigger button and a .tray-pop of menu items.
     Items are role=menuitem, menuitemcheckbox or menuitemradio (with data-group). Fires tray:select with detail.value. */
  UI.register('menu', function (root) {
    var trigger = root.querySelector(':scope > button, :scope > a'), panel = root.querySelector(':scope > .tray-pop');
    if (!trigger || !panel) return;
    function items() { return $$('[role^="menuitem"]', panel).filter(function (i) { return i.offsetParent !== null; }); }
    panel.setAttribute('role', 'menu');
    trigger.setAttribute('aria-haspopup', 'menu');
    $$('[role^="menuitem"]', panel).forEach(function (i) { i.setAttribute('tabindex', '-1'); });
    var pop = popup(trigger, panel, { onOpen: function () { var first = items()[0]; if (first) first.focus(); } });
    rove(panel, '[role^="menuitem"]');
    panel.addEventListener('click', function (e) {
      var it = e.target.closest('[role^="menuitem"]');
      if (!it || it.getAttribute('aria-disabled') === 'true' || it.hasAttribute('aria-haspopup')) return;
      var role = it.getAttribute('role');
      if (role === 'menuitemcheckbox') { it.setAttribute('aria-checked', String(it.getAttribute('aria-checked') !== 'true')); return; }
      if (role === 'menuitemradio') { $$('[role="menuitemradio"][data-group="' + it.dataset.group + '"]', panel).forEach(function (x) { x.setAttribute('aria-checked', String(x === it)); }); return; }
      fire(root, 'select', { value: it.dataset.value || it.textContent.trim() });
      pop.close(true);
    });
    panel.addEventListener('keydown', function (e) {
      var it = document.activeElement;
      if (e.key === 'ArrowRight' && it.hasAttribute('aria-haspopup')) { var sub = $('.tray-option', it.parentNode.querySelector('.tray-pop')); if (sub) { e.preventDefault(); e.stopPropagation(); sub.focus(); } }
      if (e.key === 'ArrowLeft' && it.closest('.tray-submenu')) { var back = it.closest('.tray-submenu').querySelector('[aria-haspopup]'); if (back && back !== it) { e.preventDefault(); e.stopPropagation(); back.focus(); } }
    });
    trigger.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); pop.open(); } });
    root.__menu = pop;
  });

  /* Menubar: data-tray="menubar" on the strip of menus. With one menu open, pointing at another opens it; left and right move between menus. */
  UI.register('menubar', function (bar) {
    function menus() { return $$(':scope > [data-tray~="menu"]', bar); }
    function openOnly(m) { menus().forEach(function (x) { if (x.__menu) { if (x === m) x.__menu.open(); else x.__menu.close(); } }); }
    bar.setAttribute('role', 'menubar');
    bar.addEventListener('pointerover', function (e) {
      var m = e.target.closest('[data-tray~="menu"]');
      if (m && m.parentNode === bar && menus().some(function (x) { return x.__menu && x.__menu.isOpen(); }) && !m.__menu.isOpen()) openOnly(m);
    });
    bar.addEventListener('keydown', function (e) {
      var step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      var list = menus(), i = list.indexOf(e.target.closest('[data-tray~="menu"]'));
      if (i < 0) return;
      var next = list[(i + step + list.length) % list.length], wasOpen = list[i].__menu.isOpen();
      e.preventDefault();
      next.querySelector(':scope > button').focus();
      if (wasOpen) openOnly(next);
    });
  });

  /* Context menu: data-tray="contextmenu" on a region that holds a .tray-pop menu; it opens where the region is right-clicked. */
  UI.register('contextmenu', function (region) {
    var panel = $('.tray-pop', region);
    panel.setAttribute('role', 'menu');
    $$('[role^="menuitem"]', panel).forEach(function (i) { i.setAttribute('tabindex', '-1'); });
    function close() { hide(panel); }
    function openAt(x, y) {
      var box = region.getBoundingClientRect();
      show(panel);
      panel.style.insetInlineStart = clamp(x - box.left, 8, Math.max(8, box.width - panel.offsetWidth - 8)) + 'px';
      panel.style.insetBlockStart = clamp(y - box.top, 8, Math.max(8, box.height - panel.offsetHeight - 8)) + 'px';
      var first = $('[role^="menuitem"]', panel);
      if (first) first.focus();
    }
    if (!panel.hasAttribute('data-open')) close();
    region.addEventListener('contextmenu', function (e) { e.preventDefault(); openAt(e.clientX, e.clientY); });
    region.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); region.focus(); }
      if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); var b = region.getBoundingClientRect(); openAt(b.left + 24, b.top + 24); }
    });
    rove(panel, '[role^="menuitem"]');
    panel.addEventListener('click', function (e) { var it = e.target.closest('[role^="menuitem"]'); if (it && it.getAttribute('aria-disabled') !== 'true') { fire(region, 'select', { value: it.dataset.value || it.textContent.trim() }); close(); } });
    document.addEventListener('pointerdown', function (e) { if (!panel.hidden && !panel.contains(e.target) && e.button !== 2) close(); });
  });

  /* Sidebar: data-tray="sidebar-toggle" on a button whose aria-controls names the sidebar; it collapses it to icons. */
  UI.register('sidebar-toggle', function (btn) {
    var side = document.getElementById(btn.getAttribute('aria-controls'));
    if (!side) return;
    function paint() { btn.setAttribute('aria-expanded', String(!side.hasAttribute('data-collapsed'))); }
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
        if (window.matchMedia) window.matchMedia('(min-width: 56.0625rem)').addEventListener('change', function (e) { if (e.matches && sheet.open) sheet.close(); });
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
    function setActive(o) {
      if (active) active.removeAttribute('data-active');
      active = o || null;
      if (active) { active.setAttribute('data-active', ''); input.setAttribute('aria-activedescendant', active.id); if (active.scrollIntoView) active.scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    function filter() {
      var q = input.value.trim().toLowerCase();
      options().forEach(function (o) { o.hidden = !!q && o.textContent.toLowerCase().indexOf(q) < 0; });
      $$('[data-group]', list).forEach(function (g) { g.hidden = !$$('[role="option"]', g).some(function (o) { return !o.hidden; }); });
      if (empty) empty.hidden = visible().length > 0;
      setActive(visible()[0]);
    }
    function run(o) { fire(root, 'select', { value: o.dataset.value || o.textContent.trim() }); }
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
