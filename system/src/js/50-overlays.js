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
    var pop = popup(trigger, panel, { onOpen: function () { var f = panel.querySelector('input, select, textarea, button, a[href], [tabindex="0"]'); if (f) f.focus(); } });
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

  /* Tooltip: data-tray="tooltip" on an anchor around one control, with data-tip="text" (and optional data-side="bottom", data-keys="Ctrl K"). */
  UI.register('tooltip', function (root) {
    var target = root.querySelector('button, a, input, [tabindex]') || root, tip = document.createElement('span');
    tip.className = 'tray-tooltip' + (root.dataset.side === 'bottom' ? ' tray-tooltip--bottom' : '');
    tip.setAttribute('role', 'tooltip');
    tip.id = uid('tray-tooltip');
    tip.textContent = root.dataset.tip || '';
    (root.dataset.keys || '').split(' ').filter(Boolean).forEach(function (k) { var kbd = document.createElement('kbd'); kbd.className = 'tray-kbd'; kbd.textContent = k; tip.appendChild(kbd); });
    tip.hidden = !root.hasAttribute('data-open');
    root.appendChild(tip);
    target.setAttribute('aria-describedby', tip.id);
    function set(open) { if (!root.hasAttribute('data-open')) { if (open) show(tip); else hide(tip); } }
    root.addEventListener('pointerenter', function () { set(true); });
    root.addEventListener('pointerleave', function () { set(false); });
    root.addEventListener('focusin', function () { set(true); });
    root.addEventListener('focusout', function () { set(false); });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  });

  /* Toast: TrayUI.toast({ title, text, tone: 'success' | 'danger', action: { label, onClick }, duration }) */
  UI.toast = function (opts) {
    opts = opts || {};
    var region = document.querySelector('.tray-toasts');
    if (!region) {
      region = document.createElement('div');
      region.className = 'tray-toasts';
      region.setAttribute('role', 'region');
      region.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(region);
    }
    var t = document.createElement('div'), tone = opts.tone || '';
    t.className = 'tray-toast' + (tone ? ' tray-toast--' + tone : '');
    t.setAttribute('role', tone === 'danger' ? 'alert' : 'status');
    t.setAttribute('data-enter', '');
    t.innerHTML = (tone ? icon(tone === 'danger' ? 'circle-alert' : 'circle-check') : '') +
      '<div class="tray-toast__body"><p class="tray-toast__title">' + esc(opts.title || '') + '</p>' + (opts.text ? '<p class="tray-toast__text">' + esc(opts.text) + '</p>' : '') + '</div>' +
      '<div class="tray-toast__actions">' + (opts.action ? '<button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-action>' + esc(opts.action.label) + '</button>' : '') +
      '<button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-dismiss aria-label="Dismiss">' + icon('x') + '</button></div>';
    var timer = null, life = opts.duration != null ? opts.duration : (tone === 'danger' ? 0 : 5000);
    /* a toast leaves the way it came, then is taken out */
    function dismiss() {
      clearTimeout(timer);
      if (!t.parentNode || t.hasAttribute('data-leaving')) return;
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
    t.addEventListener('focusin', function () { clearTimeout(timer); });
    t.addEventListener('focusout', arm);
    region.appendChild(t);
    arm();
    return { dismiss: dismiss, element: t };
  };
