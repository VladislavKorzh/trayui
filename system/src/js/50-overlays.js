  /* ---------- Overlays ---------- */

  /* Dialog, alert dialog, sheet, drawer: native <dialog> elements with data-tray="dialog".
     A [data-close] control inside closes it; a click on the veil closes it unless it has data-static or role=alertdialog. */
  UI.register('dialog', function (d) {
    /* the veil closes the dialog only when the press and the release are both on it: a text selection dragged out of the
       dialog ends on the veil too, and must not close it */
    var pressedOutside = false;
    function outside(e) { var b = d.getBoundingClientRect(); return e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom; }
    d.addEventListener('pointerdown', function (e) { pressedOutside = e.target === d && outside(e); });
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { shut(d, e.target.closest('[data-close]').value || ''); return; }
      var veil = e.target === d && d.matches(':modal') && !d.hasAttribute('data-static') && d.getAttribute('role') !== 'alertdialog';
      if (veil && pressedOutside && outside(e)) shut(d, '');
      pressedOutside = false;
    });
    d.addEventListener('cancel', function (e) {
      if (d.getAttribute('role') === 'alertdialog' && d.hasAttribute('data-static')) { e.preventDefault(); return; }
      /* Escape: where the browser cannot keep the dialog in the top layer while it leaves, it leaves first, then closes */
      if (!calm() && !topLayerExit()) { e.preventDefault(); shut(d, ''); }
    });
  });
  /* Open: data-tray="open" on a button with data-target="#id". data-modal="false" shows the dialog in place instead of over the page. */
  UI.register('open', function (btn) {
    btn.addEventListener('click', function () {
      var d = document.querySelector(btn.dataset.target);
      if (!d) return;
      if (d.hasAttribute('data-closing')) { d.removeAttribute('data-closing'); d.close(); }
      if (d.open) return;
      if (btn.dataset.modal === 'false') d.show(); else d.showModal();
      /* an alert dialog starts on the safe choice: autofocus on it in the markup does that; this covers markup without it */
      if (d.getAttribute('role') === 'alertdialog' && !d.querySelector('[autofocus]')) {
        var safe = d.querySelector('button[data-close]:not(.tray-btn--danger)');
        if (safe) safe.focus();
      }
    });
  });

  /* Popover: data-tray="popover" on the anchor that holds a trigger button and a .tray-pop. */
  UI.register('popover', function (root) {
    var trigger = root.querySelector(':scope > button, :scope > a'), panel = root.querySelector(':scope > .tray-pop');
    if (!trigger || !panel) return;
    panel.id = panel.id || uid('tray-popover');
    trigger.setAttribute('aria-controls', panel.id);
    /* Focus moves to the first control inside. A panel of text alone has none, so focus would stay on the trigger and
       nothing would be read: it becomes a dialog named by its title (or by its trigger), described by its text, and
       takes focus itself. */
    function opened() {
      var f = panel.querySelector('input, select, textarea, button, a[href], [tabindex="0"]');
      if (f) { f.focus(); return; }
      if (!panel.hasAttribute('role')) panel.setAttribute('role', 'dialog');
      if (!panel.hasAttribute('aria-label') && !panel.hasAttribute('aria-labelledby')) {
        var title = $('.tray-pop__title', panel) || trigger;
        title.id = title.id || uid('tray-popover-title');
        panel.setAttribute('aria-labelledby', title.id);
      }
      var text = $$('.tray-pop__text', panel);
      if (text.length && !panel.hasAttribute('aria-describedby')) panel.setAttribute('aria-describedby', text.map(function (p) { p.id = p.id || uid('tray-popover-text'); return p.id; }).join(' '));
      panel.setAttribute('tabindex', '-1');
      panel.focus();
    }
    var pop = popup(trigger, panel, { onOpen: opened });
    panel.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) pop.close(true); });
    root.__popover = pop;
  });

  /* Hover card: data-tray="hovercard" on the anchor that holds a link and a .tray-pop; opens on hover or focus after a short wait. */
  UI.register('hovercard', function (root) {
    var trigger = root.querySelector(':scope > a, :scope > button'), panel = root.querySelector(':scope > .tray-pop'), timer = null;
    if (!trigger || !panel) return;
    if (!panel.hasAttribute('data-open')) panel.hidden = true;
    function set(open) { clearTimeout(timer); timer = setTimeout(function () { if (open) show(panel); else hide(panel); }, open ? 250 : 150); }
    root.addEventListener('pointerenter', function () { set(true); });
    root.addEventListener('pointerleave', function () { set(false); });
    root.addEventListener('focusin', function () { set(true); });
    root.addEventListener('focusout', function () { set(false); });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') { clearTimeout(timer); hide(panel); } });
  });

  /* Tooltip: data-tray="tooltip" on an anchor around one control, with data-tip="text" (and optional data-side="bottom",
     data-keys="Ctrl K"). The bubble follows data-tip, data-keys and data-side when they change ("Copy the link", then
     "Copied"). */
  UI.register('tooltip', function (root) {
    var target = root.querySelector('button, a, input, [tabindex]') || root, tip = document.createElement('span'), timer = null;
    tip.setAttribute('role', 'tooltip');
    tip.id = uid('tray-tooltip');
    function paint() {
      var words = root.dataset.tip || '', name = (target.getAttribute('aria-label') || target.textContent || '').trim();
      tip.className = 'tray-tooltip' + (root.dataset.side === 'bottom' ? ' tray-tooltip--bottom' : '');
      tip.textContent = words;
      /* Words that only say the control's name again are for the eye alone: CSS draws them with no text for a screen
         reader, so the name is not read a second time as the description, which keeps the keys. (aria-hidden would not
         do: a description is read from a hidden bubble whole.) */
      if (words.trim().toLowerCase() === name.toLowerCase()) {
        var said = document.createElement('span');
        said.className = 'tray-tooltip__said';
        said.setAttribute('data-said', words);
        tip.replaceChildren(said);
      }
      (root.dataset.keys || '').split(' ').filter(Boolean).forEach(function (k) { var kbd = document.createElement('kbd'); kbd.className = 'tray-kbd'; kbd.textContent = k; tip.appendChild(kbd); });
    }
    paint();
    tip.hidden = !root.hasAttribute('data-open');
    root.appendChild(tip);
    target.setAttribute('aria-describedby', tip.id);
    if (window.MutationObserver) {
      new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ['data-tip', 'data-keys', 'data-side'] });
      if (target !== root) new MutationObserver(paint).observe(target, { attributes: true, attributeFilter: ['aria-label'] });
    }
    function set(open, wait) {
      clearTimeout(timer);
      if (root.hasAttribute('data-open')) return;
      if (open) show(tip);
      else if (wait) timer = setTimeout(function () { hide(tip); }, 150);
      else hide(tip);
    }
    /* The pointer can move onto the bubble and rest there (WCAG 1.4.13): it goes a moment after the pointer has left the
       control and the bubble both, and stays while the control has focus. */
    root.addEventListener('pointerenter', function () { set(true); });
    root.addEventListener('pointerleave', function () { if (!root.contains(document.activeElement)) set(false, true); });
    root.addEventListener('focusin', function () { set(true); });
    root.addEventListener('focusout', function () { if (!root.matches(':hover')) set(false); });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  });

  /* Toast: TrayUI.toast({ title, text, tone: 'success' | 'danger', action: { label, onClick }, duration })
     The region is the live one: a toast added to it is read out politely, and a danger toast is an alert, read at once.
     A toast with an action stays until it is dismissed, so there is time to reach its button. */
  UI.toast = function (opts) {
    opts = opts || {};
    var region = document.querySelector('.tray-toasts'), fresh = false;
    if (!region) {
      region = document.createElement('div');
      region.className = 'tray-toasts';
      region.setAttribute('role', 'region');
      region.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(region);
    }
    if (region.getAttribute('aria-live') !== 'polite') { region.setAttribute('aria-live', 'polite'); fresh = true; }
    var t = document.createElement('div'), tone = opts.tone || '', came = null;
    t.className = 'tray-toast' + (tone ? ' tray-toast--' + tone : '');
    if (tone === 'danger') t.setAttribute('role', 'alert');
    t.setAttribute('data-enter', '');
    t.innerHTML = (tone ? icon(tone === 'danger' ? 'circle-alert' : 'circle-check') : '') +
      '<div class="tray-toast__body"><p class="tray-toast__title">' + esc(opts.title || '') + '</p>' + (opts.text ? '<p class="tray-toast__text">' + esc(opts.text) + '</p>' : '') + '</div>' +
      '<div class="tray-toast__actions">' + (opts.action ? '<button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-action>' + esc(opts.action.label) + '</button>' : '') +
      '<button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-dismiss aria-label="Dismiss">' + icon('x') + '</button></div>';
    var timer = null, life = opts.duration != null ? opts.duration : (tone === 'danger' || opts.action ? 0 : 5000);
    /* focus in a toast that goes moves to the next toast, or back to where it came from */
    function after() {
      var rest = $$('.tray-toast:not([data-leaving])', region).filter(function (x) { return x !== t; });
      var next = rest.filter(function (x) { return t.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING; })[0] || rest[rest.length - 1];
      return next ? $('button', next) : came;
    }
    /* a toast leaves the way it came, then is taken out */
    function dismiss() {
      clearTimeout(timer);
      if (!t.parentNode || t.hasAttribute('data-leaving')) return;
      rescue(t, after);
      if (calm()) { t.remove(); return; }
      t.removeAttribute('data-enter');
      t.setAttribute('data-leaving', '');
      settle(t, function () { t.remove(); });
    }
    function arm() { clearTimeout(timer); if (life) timer = setTimeout(dismiss, life); }
    t.addEventListener('click', function (e) {
      if (e.target.closest('[data-action]')) { if (opts.action.onClick) opts.action.onClick(); dismiss(); }
      if (e.target.closest('[data-dismiss]')) dismiss();
    });
    t.addEventListener('pointerenter', function () { clearTimeout(timer); });
    t.addEventListener('pointerleave', arm);
    /* where focus came from, outside the region; focus passed on from another toast keeps that toast's */
    t.addEventListener('focusin', function (e) {
      clearTimeout(timer);
      var from = e.relatedTarget, toast = from && from.closest && from.closest('.tray-toast');
      if (from && !region.contains(from)) came = from;
      else if (toast && toast !== t && toast.__came) came = toast.__came;
      t.__came = came;
    });
    t.addEventListener('focusout', arm);
    region.appendChild(t);
    /* A screen reader hears a live region only once it knows it: in a region that has only just become live, the words
       of the first toast are put in again a moment later, so that they are read. An alert is read as it comes. */
    if (fresh && tone !== 'danger') setTimeout(function () { var body = $('.tray-toast__body', t); if (body && t.isConnected) t.insertBefore(body, body.nextSibling); }, 150);
    arm();
    return { dismiss: dismiss, element: t };
  };
