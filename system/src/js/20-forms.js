  /* ---------- Actions and forms ---------- */

  /* Toggle: data-tray="toggle" on a button with aria-pressed. */
  UI.register('toggle', function (btn) {
    if (!btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      fire(btn, 'change', { pressed: on });
    });
  });

  /* Stepper: data-tray="stepper" on a button group holding [data-step] buttons and an <output>. */
  UI.register('stepper', function (root) {
    var out = $('output', root), min = +(root.dataset.min || 0), max = +(root.dataset.max || 99), value = +(out.textContent || min);
    function set(v) {
      var was = value;
      value = clamp(v, min, max);
      out.textContent = String(value);
      /* the number bumps when it changes: two names for one animation, so each change starts it again */
      if (value !== was) out.setAttribute('data-bump', out.getAttribute('data-bump') === 'a' ? 'b' : 'a');
      $$('[data-step]', root).forEach(function (b) { b.disabled = (+b.dataset.step < 0 && value <= min) || (+b.dataset.step > 0 && value >= max); });
      fire(root, 'change', { value: value });
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-step]'); if (b) set(value + (+b.dataset.step)); });
    set(value);
  });

  /* Input OTP: data-tray="otp" on the row of one-character inputs. */
  UI.register('otp', function (root) {
    var cells = $$('input', root);
    cells.forEach(function (cell, i) {
      cell.setAttribute('inputmode', cell.getAttribute('inputmode') || 'numeric');
      cell.setAttribute('maxlength', '1');
      cell.setAttribute('aria-label', 'Character ' + (i + 1) + ' of ' + cells.length);
      cell.addEventListener('input', function () {
        cell.value = cell.value.slice(-1);
        if (cell.value && cells[i + 1]) cells[i + 1].focus();
        var code = cells.map(function (c) { return c.value; }).join('');
        if (code.length === cells.length) fire(root, 'complete', { value: code });
      });
      cell.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !cell.value && cells[i - 1]) { cells[i - 1].focus(); cells[i - 1].value = ''; e.preventDefault(); }
        if (e.key === 'ArrowLeft' && cells[i - 1]) cells[i - 1].focus();
        if (e.key === 'ArrowRight' && cells[i + 1]) cells[i + 1].focus();
      });
      cell.addEventListener('focus', function () { cell.select(); });
      cell.addEventListener('paste', function (e) {
        var text = (e.clipboardData.getData('text') || '').replace(/\s/g, '');
        if (!text) return;
        e.preventDefault();
        text.split('').slice(0, cells.length - i).forEach(function (ch, k) { cells[i + k].value = ch; });
        cells[Math.min(cells.length - 1, i + text.length)].focus();
        cell.dispatchEvent(new Event('input'));
      });
    });
  });

  /* Slider: data-tray="slider" on <input type="range">. Fills the track and writes the value to the field's <output>. */
  UI.register('slider', function (input) {
    var field = input.closest('.tray-slider-field'), out = field && $('output', field), unit = input.dataset.unit || '';
    function paint() {
      var min = +(input.min || 0), max = +(input.max || 100);
      input.style.setProperty('--tray-v', ((+input.value - min) / (max - min) * 100) + '%');
      if (out) out.textContent = input.value + unit;
    }
    input.addEventListener('input', paint);
    paint();
  });

  /* Character count: data-tray="count" on a textarea with maxlength; updates .tray-field__count in its field. */
  UI.register('count', function (area) {
    var out = $('.tray-field__count', area.closest('.tray-field')), max = area.getAttribute('maxlength');
    function paint() { if (out) out.textContent = area.value.length + (max ? ' / ' + max : ''); }
    area.addEventListener('input', paint);
    paint();
  });

  /* Reveal: data-tray="reveal" on a button inside an input group shows and hides a password. */
  UI.register('reveal', function (btn) {
    var input = $('input', btn.closest('.tray-input-group'));
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      btn.innerHTML = icon(show ? 'eye-off' : 'eye');
    });
  });

  /* Select: data-tray="select" on the anchor that holds a .tray-select-trigger and a .tray-pop of [role=option]. */
  UI.register('select', function (root) {
    var trigger = $('.tray-select-trigger', root), panel = $('.tray-pop', root);
    var valueEl = $('.tray-select-trigger__value', trigger), hidden = $('input[type="hidden"]', root);
    function options() { return $$('[role="option"]', panel); }
    panel.setAttribute('role', 'listbox');
    panel.id = panel.id || uid('tray-listbox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-controls', panel.id);
    options().forEach(function (o) { o.setAttribute('tabindex', '-1'); if (!o.hasAttribute('aria-selected')) o.setAttribute('aria-selected', 'false'); });
    var pop = popup(trigger, panel, { onOpen: function () { var cur = $('[aria-selected="true"]', panel) || options()[0]; if (cur) cur.focus(); } });
    function choose(opt) {
      options().forEach(function (o) { o.setAttribute('aria-selected', String(o === opt)); });
      var text = $('.tray-option__text', opt);
      valueEl.textContent = opt.dataset.label || (text ? text.textContent : opt.textContent).trim();
      trigger.removeAttribute('data-placeholder');
      if (hidden) hidden.value = opt.dataset.value || '';
      fire(root, 'change', { value: opt.dataset.value });
      pop.close(true);
    }
    panel.addEventListener('click', function (e) { var o = e.target.closest('[role="option"]'); if (o && o.getAttribute('aria-disabled') !== 'true') choose(o); });
    rove(panel, '[role="option"]');
    trigger.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); pop.open(); } });
    panel.addEventListener('keydown', function (e) {
      if (e.key.length !== 1 || e.key === ' ') return;
      var hit = options().filter(function (o) { return o.textContent.trim().toLowerCase().indexOf(e.key.toLowerCase()) === 0; })[0];
      if (hit) hit.focus();
    });
  });

  /* Combobox: data-tray="combobox" on the anchor that holds an input and a .tray-pop of [role=option]. */
  UI.register('combobox', function (root) {
    var input = $('input', root), panel = $('.tray-pop', root), empty = $('.tray-list__empty', panel), active = null;
    function options() { return $$('[role="option"]', panel); }
    function visible() { return options().filter(function (o) { return !o.hidden; }); }
    panel.setAttribute('role', 'listbox');
    panel.id = panel.id || uid('tray-listbox');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', panel.id);
    input.setAttribute('autocomplete', 'off');
    options().forEach(function (o) { o.id = o.id || uid('tray-option'); o.setAttribute('tabindex', '-1'); });
    var pop = popup(input, panel, { manual: true });
    function setActive(o) {
      if (active) active.removeAttribute('data-active');
      active = o || null;
      if (active) { active.setAttribute('data-active', ''); input.setAttribute('aria-activedescendant', active.id); if (active.scrollIntoView) active.scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    function filter() {
      var q = input.value.trim().toLowerCase(), shown = 0;
      options().forEach(function (o) { var hit = !q || o.textContent.toLowerCase().indexOf(q) >= 0; o.hidden = !hit; if (hit) shown += 1; });
      if (empty) empty.hidden = shown > 0;
      setActive(visible()[0]);
    }
    function choose(o) {
      options().forEach(function (x) { x.setAttribute('aria-selected', String(x === o)); });
      var text = $('.tray-option__text', o);
      input.value = o.dataset.label || (text ? text.textContent : o.textContent).trim();
      fire(root, 'change', { value: o.dataset.value });
      pop.close();
    }
    input.addEventListener('click', function () { pop.open(); filter(); });
    input.addEventListener('input', function () { pop.open(); filter(); });
    input.addEventListener('keydown', function (e) {
      var vis = visible(), i = vis.indexOf(active);
      if (e.key === 'ArrowDown') { e.preventDefault(); if (!pop.isOpen()) { pop.open(); filter(); } else setActive(vis[(i + 1) % vis.length]); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (pop.isOpen()) setActive(vis[(i - 1 + vis.length) % vis.length]); }
      else if (e.key === 'Enter' && active && pop.isOpen()) { e.preventDefault(); choose(active); }
    });
    panel.addEventListener('pointerdown', function (e) { e.preventDefault(); });
    panel.addEventListener('click', function (e) { var o = e.target.closest('[role="option"]'); if (o) choose(o); });
    if (empty) empty.hidden = true;
    if (panel.hasAttribute('data-open')) filter();
  });

  /* Calendar: TrayUI.calendar(el, options) or data-tray="calendar" with data-mode, data-months, data-value,
     data-min, data-max, data-month, data-today, data-week-start, data-locale. Dates are YYYY-MM-DD; a range is start/end. */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseDate(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +(p[2] || 1)); }
  UI.formatDate = function (value, locale) {
    var fmt = new Intl.DateTimeFormat(locale || 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    var parts = String(value).split('/');
    if (parts.length === 2 && parts[1] && fmt.formatRange) return fmt.formatRange(parseDate(parts[0]), parseDate(parts[1]));
    return fmt.format(parseDate(parts[0]));
  };
  UI.calendar = function (el, opts) {
    opts = opts || {};
    var d = el.dataset;
    function opt(key, attr, fallback) { return opts[key] != null ? opts[key] : (d[attr || key] != null ? d[attr || key] : fallback); }
    var mode = opt('mode', null, 'single'), months = +opt('months', null, 1), weekStart = +opt('weekStart', null, 1), locale = opt('locale', null, 'en-GB');
    var today = parseDate(opt('today', null, iso(new Date())));
    var min = opt('min') ? parseDate(opt('min')) : null, max = opt('max') ? parseDate(opt('max')) : null;
    var start = null, end = null;
    var initial = String(opt('value', null, '')).split('/');
    if (initial[0]) start = parseDate(initial[0]);
    if (initial[1]) end = parseDate(initial[1]);
    var seed = opt('month') ? parseDate(opt('month') + '-01') : (start || today);
    var view = new Date(seed.getFullYear(), seed.getMonth(), 1);
    var monthFmt = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
    var dowFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    var dayFmt = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var focusIso = null;

    function value() { return !start ? '' : (mode === 'range' ? iso(start) + '/' + (end ? iso(end) : '') : iso(start)); }
    function render(keepFocus) {
      var html = '<div class="tray-cal__months">';
      var tab = focusIso || (start && iso(start)) || iso(today);
      for (var m = 0; m < months; m += 1) {
        var first = new Date(view.getFullYear(), view.getMonth() + m, 1);
        html += '<div class="tray-cal__month"><div class="tray-cal__head">' +
          '<button type="button" class="tray-cal__nav" data-nav="-1" aria-label="Previous month"' + (m > 0 ? ' data-ghost' : '') + '>' + icon('chevron-left', 'tray-icon--flip') + '</button>' +
          '<div class="tray-cal__title">' + esc(monthFmt.format(first)) + '</div>' +
          '<button type="button" class="tray-cal__nav" data-nav="1" aria-label="Next month"' + (m < months - 1 ? ' data-ghost' : '') + '>' + icon('chevron-right', 'tray-icon--flip') + '</button></div>' +
          '<div class="tray-cal__grid">';
        for (var w = 0; w < 7; w += 1) html += '<span class="tray-cal__dow" aria-hidden="true">' + esc(dowFmt.format(new Date(2024, 0, 1 + ((weekStart + w + 6) % 7))).slice(0, 2)) + '</span>';
        var offset = (first.getDay() - weekStart + 7) % 7;
        for (var c = 0; c < 42; c += 1) {
          var day = new Date(first.getFullYear(), first.getMonth(), 1 - offset + c), key = iso(day);
          var outside = day.getMonth() !== first.getMonth();
          if (outside && months > 1) { html += '<span></span>'; continue; }
          var isStart = start && key === iso(start), isEnd = end && key === iso(end);
          var attrs = ' data-date="' + key + '" aria-label="' + esc(dayFmt.format(day)) + '" tabindex="' + (key === tab && !outside ? '0' : '-1') + '"';
          if (outside) attrs += ' data-outside';
          if (key === iso(today)) attrs += ' data-today';
          if (isStart || isEnd) attrs += ' aria-pressed="true"'; else attrs += ' aria-pressed="false"';
          if (start && end && iso(start) !== iso(end)) {
            if (isStart) attrs += ' data-start';
            if (isEnd) attrs += ' data-end';
            if (day > start && day < end) attrs += ' data-in-range';
          }
          if ((min && day < min) || (max && day > max)) attrs += ' disabled';
          html += '<button type="button" class="tray-cal__day"' + attrs + '><span class="tray-cal__num">' + day.getDate() + '</span></button>';
        }
        html += '</div></div>';
      }
      el.innerHTML = html + '</div>';
      if (!$('[tabindex="0"]', el)) { var firstDay = $('.tray-cal__day:not([data-outside]):not(:disabled)', el); if (firstDay) firstDay.setAttribute('tabindex', '0'); }
      if (keepFocus && focusIso) { var target = $('[data-date="' + focusIso + '"]:not([data-outside])', el); if (target) target.focus(); }
    }
    function pick(day) {
      if (mode !== 'range') { start = day; end = null; }
      else if (!start || end) { start = day; end = null; }
      else if (day < start) { start = day; }
      else { end = day; }
      focusIso = iso(day);
      if (day.getMonth() !== view.getMonth() && months === 1) view = new Date(day.getFullYear(), day.getMonth(), 1);
      render(true);
      fire(el, 'change', { value: value(), complete: mode !== 'range' || !!end });
    }
    el.classList.add('tray-cal');
    el.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-nav]'), day = e.target.closest('.tray-cal__day');
      if (nav) { view = new Date(view.getFullYear(), view.getMonth() + (+nav.dataset.nav), 1); focusIso = null; render(); var again = $('[data-nav="' + nav.dataset.nav + '"]:not([data-ghost])', el); if (again) again.focus(); }
      else if (day && !day.disabled) pick(parseDate(day.dataset.date));
    });
    el.addEventListener('keydown', function (e) {
      var day = e.target.closest && e.target.closest('.tray-cal__day');
      var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (!day || !step) return;
      e.preventDefault();
      var from = parseDate(day.dataset.date), to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + step);
      if ((min && to < min) || (max && to > max)) return;
      focusIso = iso(to);
      var lastShown = new Date(view.getFullYear(), view.getMonth() + months, 0);
      if (to < view) view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
      else if (to > lastShown) view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
      render(true);
    });
    el.addEventListener('pointerover', function (e) {
      var day = e.target.closest && e.target.closest('.tray-cal__day');
      if (mode !== 'range' || !start || end || !day) return;
      $$('.tray-cal__day', el).forEach(function (b) { var k = b.dataset.date; b.toggleAttribute('data-in-range', k > iso(start) && k <= day.dataset.date); });
    });
    render();
    el.__calendar = {
      value: value,
      set: function (v) { var p = String(v || '').split('/'); start = p[0] ? parseDate(p[0]) : null; end = p[1] ? parseDate(p[1]) : null; if (start) view = new Date(start.getFullYear(), start.getMonth(), 1); focusIso = null; render(); }
    };
    return el.__calendar;
  };
  UI.register('calendar', function (el) { UI.calendar(el); });

  /* Date picker: data-tray="datepicker" on the anchor that holds a .tray-select-trigger and a .tray-pop with a calendar.
     Optional inside the panel: [data-preset="7"] (the last N days), [data-clear], [data-apply]. */
  UI.register('datepicker', function (root) {
    var trigger = $('.tray-select-trigger', root), panel = $('.tray-pop', root), calEl = $('[data-tray~="calendar"]', panel);
    var valueEl = $('.tray-select-trigger__value', trigger), hidden = $('input[type="hidden"]', root), apply = $('[data-apply]', panel);
    var placeholder = valueEl.textContent, locale = calEl.dataset.locale || 'en-GB';
    UI.init(panel);
    var cal = calEl.__calendar;
    trigger.setAttribute('aria-haspopup', 'dialog');
    var pop = popup(trigger, panel, { onOpen: function () { var t = $('.tray-cal__day[tabindex="0"]', calEl); if (t) t.focus(); } });
    function show(v) {
      var complete = v && (v.indexOf('/') < 0 || v.split('/')[1]);
      valueEl.textContent = complete ? UI.formatDate(v, locale) : (v ? UI.formatDate(v.split('/')[0], locale) + ' – …' : placeholder);
      trigger.toggleAttribute('data-placeholder', !v);
      if (hidden) hidden.value = v || '';
    }
    calEl.addEventListener('tray:change', function (e) {
      show(e.detail.value);
      if (e.detail.complete && !apply) pop.close(true);
    });
    panel.addEventListener('click', function (e) {
      var preset = e.target.closest('[data-preset]');
      if (preset) {
        var end = parseDate(calEl.dataset.today || iso(new Date())), start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (+preset.dataset.preset - 1));
        cal.set(iso(start) + '/' + iso(end)); show(cal.value());
      }
      if (e.target.closest('[data-clear]')) { cal.set(''); show(''); }
      if (e.target.closest('[data-apply]')) pop.close(true);
    });
    show(cal.value());
  });
