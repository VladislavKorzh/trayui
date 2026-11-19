  /* ---------- Actions and forms ---------- */

  /* A busy button (aria-busy="true" while its work runs) ignores presses: a second click, Enter or Space, or Enter in a
     field of its form, does not send it again, and a busy link does not go. It keeps focus and its place in the Tab order,
     which `disabled` would take away. Every .tray-btn gets this; presses come through again once aria-busy goes. */
  UI.upgrade('.tray-btn', function (btn) {
    btn.addEventListener('click', function (e) {
      if (btn.getAttribute('aria-busy') !== 'true') return;
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);
  });

  /* Toggle: data-tray="toggle" on a button with aria-pressed. */
  UI.register('toggle', function (btn) {
    if (!btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      fire(btn, 'change', { pressed: on });
    });
  });

  /* A checkbox written as mixed: data-indeterminate on the <input>. The mixed state is a property of the element, with no
     attribute of its own, so markup alone cannot set it; this sets it once, as the page loads. A click clears it, as the
     browser does, and the attribute goes with it, so the markup no longer claims it. */
  UI.upgrade('input[type="checkbox"][data-indeterminate]', function (input) {
    input.indeterminate = true;
    input.addEventListener('change', function () { input.removeAttribute('data-indeterminate'); }, { once: true });
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
      $$('[data-step]', root).forEach(function (b) {
        var off = (+b.dataset.step < 0 && value <= min) || (+b.dataset.step > 0 && value >= max);
        /* the button that reaches the limit has focus: the group takes it, or disabling the button would drop focus to the page */
        if (off) rescue(b, root);
        b.disabled = off;
      });
      fire(root, 'change', { value: value });
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-step]'); if (b) set(value + (+b.dataset.step)); });
    set(value);
  });

  /* Input OTP: data-tray="otp" on the row of one-character inputs. */
  UI.register('otp', function (root) {
    var cells = $$('input', root);
    function done() {
      var code = cells.map(function (c) { return c.value; }).join('');
      if (code.length === cells.length) fire(root, 'complete', { value: code });
    }
    /* What a cell keeps: digits while it is numeric (the default), else letters and digits. A code written "123-456" or
       "AB 12" loses its hyphens and spaces, so no cell holds a separator and no character of the code is pushed out. */
    function clean(cell, text) {
      return String(text || '').replace(cell.getAttribute('inputmode') === 'numeric' ? /\D/g : /[\s!-\/:-@\[-`{-~·‐-―−]/g, '');
    }
    /* A code that comes in one go fills the cells from cell i on, and focus goes to the cell after its last character. */
    function spread(i, text) {
      text.split('').slice(0, cells.length - i).forEach(function (ch, k) { cells[i + k].value = ch; });
      cells[Math.min(cells.length - 1, i + text.length)].focus();
      done();
    }
    /* aria-invalid is not announced on a group, so the group's aria-invalid and aria-describedby are copied to every cell,
       now and whenever they change: each cell is then read as invalid, with the error. */
    function mirror() {
      cells.forEach(function (c) {
        ['aria-invalid', 'aria-describedby'].forEach(function (a) { var v = root.getAttribute(a); if (v === null) c.removeAttribute(a); else c.setAttribute(a, v); });
      });
    }
    mirror();
    if (window.MutationObserver) new MutationObserver(mirror).observe(root, { attributes: true, attributeFilter: ['aria-invalid', 'aria-describedby'] });
    cells.forEach(function (cell, i) {
      cell.setAttribute('inputmode', cell.getAttribute('inputmode') || 'numeric');
      /* No maxlength: a phone that fills in the code from the message (autocomplete="one-time-code") puts the whole code
         in the first cell, and maxlength would cut it to one character. The input handler keeps one per cell. */
      cell.removeAttribute('maxlength');
      cell.setAttribute('aria-label', 'Character ' + (i + 1) + ' of ' + cells.length);
      /* a key the cell does not take (a hyphen, a letter in a numeric cell) changes nothing */
      cell.addEventListener('beforeinput', function (e) { if (e.inputType === 'insertText' && e.data && !clean(cell, e.data)) e.preventDefault(); });
      cell.addEventListener('input', function (e) {
        var text = clean(cell, cell.value), key = e.data && e.data.length === 1 ? clean(cell, e.data) : null;
        /* where the browser let a refused key in, the cell keeps what it held and focus stays */
        if (key === '') { cell.value = text.slice(0, 1); return; }
        /* one key pressed in a cell that already held a character: the new one replaces it */
        if (text.length > 1 && key) text = key;
        if (text.length > 1) { spread(i, text); return; }
        cell.value = text;
        if (text && cells[i + 1]) cells[i + 1].focus();
        done();
      });
      cell.addEventListener('keydown', function (e) {
        /* the cells always run left to right (the code keeps its order in a right-to-left page): the arrows go by the
           side of the screen, back and forth along that row */
        var rtl = getComputedStyle(root).direction === 'rtl', back = rtl ? 'ArrowRight' : 'ArrowLeft', forth = rtl ? 'ArrowLeft' : 'ArrowRight';
        if (e.key === 'Backspace' && !cell.value && cells[i - 1]) { cells[i - 1].focus(); cells[i - 1].value = ''; e.preventDefault(); }
        if (e.key === back && cells[i - 1]) { e.preventDefault(); cells[i - 1].focus(); }
        if (e.key === forth && cells[i + 1]) { e.preventDefault(); cells[i + 1].focus(); }
      });
      cell.addEventListener('focus', function () { cell.select(); });
      cell.addEventListener('paste', function (e) {
        var text = clean(cell, e.clipboardData.getData('text'));
        if (!text) return;
        e.preventDefault();
        spread(i, text);
      });
    });
  });

  /* Slider: data-tray="slider" on <input type="range">. Fills the track and writes the value to the field's <output>.
     The value is read once, from the slider itself as it moves (with its unit, in aria-valuetext). An <output> is a
     status region and would read it a second time, so the one beside the label is for the eye alone: aria-hidden. */
  UI.register('slider', function (input) {
    var field = input.closest('.tray-slider-field'), out = field && $('output', field), unit = input.dataset.unit || '';
    if (out) out.setAttribute('aria-hidden', 'true');
    function paint() {
      var min = +(input.min || 0), max = +(input.max || 100);
      input.style.setProperty('--tray-v', ((+input.value - min) / (max - min) * 100) + '%');
      if (out) out.textContent = input.value + unit;
      /* a screen reader reads the bare number of a range input: aria-valuetext gives it the unit as well, "30 km" */
      if (unit) input.setAttribute('aria-valuetext', (input.value + unit).trim());
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
    /* The name stays "Show password" and aria-pressed carries the state: a name that changed as well would be read as
       "Hide password, pressed". */
    if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', 'Show password');
    btn.setAttribute('aria-pressed', 'false');
    function set(show) {
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.innerHTML = icon(show ? 'eye-off' : 'eye');
    }
    btn.addEventListener('click', function () { set(input.type === 'password'); });
    /* A password shown stays a password field where it matters: as the form is sent (so the browser treats it as one,
       to save it and not to keep it as text), and on a page brought back by Back from the browser's cache. */
    function conceal() { if (input.type !== 'password') set(false); }
    if (input.form) input.form.addEventListener('submit', conceal);
    window.addEventListener('pageshow', function (e) { if (e.persisted) conceal(); });
  });

  /* What names a control, as ids for aria-labelledby: its own aria-labelledby; else the control itself, when an
     aria-label names it; else its <label>s, given ids for it. Empty when only its content names it. */
  function labelIds(el) {
    var ids = (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
    if (ids.length) return ids;
    if (el.getAttribute('aria-label')) { el.id = el.id || uid('tray-named'); return [el.id]; }
    return [].slice.call(el.labels || []).map(function (l) { l.id = l.id || uid('tray-label'); return l.id; });
  }
  /* A list or a panel that opens from a control is named as the control is ("City"), so a screen reader says which one it
     has entered. Call it before nameWithValue, so the name is the label alone. */
  function nameLike(panel, control) {
    if (panel.hasAttribute('aria-label') || panel.hasAttribute('aria-labelledby')) return;
    var ids = labelIds(control);
    if (ids.length) panel.setAttribute('aria-labelledby', ids.join(' '));
  }
  /* A trigger that shows its value is named by its label and by that value, "Jar size 50 g": a label names a button in
     place of its content, so the value would go unheard. With no label, the content names it, value and all. */
  function nameWithValue(trigger, valueEl) {
    var ids = labelIds(trigger);
    if (!ids.length || !valueEl) return;
    valueEl.id = valueEl.id || uid('tray-value');
    if (ids.indexOf(valueEl.id) < 0) ids.push(valueEl.id);
    trigger.setAttribute('aria-labelledby', ids.join(' '));
  }

  /* The words of an option, what a filter looks in: its text, its two lines apart ("Anna Melnyk Packing", not "Anna
     MelnykPacking"), and not the keys of a shortcut beside it (tray-option__meta). */
  function optionWords(o) {
    var box = $('.tray-option__text', o) || o, text = '';
    [].forEach.call(box.childNodes, function (n) {
      if (n.nodeType === 3) text += n.textContent;
      else if (n.nodeType === 1 && !n.matches('.tray-option__meta, .tray-keys, kbd, svg')) text += /^(B|STRONG|SMALL|DIV|P)$/.test(n.tagName) ? ' ' + n.textContent + ' ' : n.textContent;
    });
    return text.replace(/\s+/g, ' ').trim();
  }
  /* A status line read politely, written only when its words change: the same words again are not read again. */
  function quietStatus(parent) {
    var line = document.createElement('span');
    line.className = 'tray-vh';
    line.setAttribute('role', 'status');
    parent.appendChild(line);
    return function (words) { if (line.textContent !== words) line.textContent = words; };
  }

  /* Select: data-tray="select" on the anchor that holds a .tray-select-trigger and a .tray-pop of [role=option]. A group of
     options is a role="group" named by its .tray-list__label. */
  UI.register('select', function (root) {
    var trigger = $('.tray-select-trigger', root), panel = $('.tray-pop', root);
    var valueEl = $('.tray-select-trigger__value', trigger), hidden = $('input[type="hidden"]', root);
    function options() { return $$('[role="option"]', panel); }
    panel.setAttribute('role', 'listbox');
    panel.id = panel.id || uid('tray-listbox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-controls', panel.id);
    nameLike(panel, trigger);
    nameWithValue(trigger, valueEl);
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
    /* Shift+Tab from an option would land on the trigger, which counts as inside, and leave the list open: it closes the
       list as Tab does, and focus goes to the trigger, as in a menu. */
    panel.addEventListener('keydown', function (e) { if (e.key === 'Tab' && e.shiftKey && pop.isOpen()) { e.preventDefault(); pop.close(true); } });
    /* A letter goes to the next option that starts with it, after the one in focus, and round to the first again: the
       same letter pressed again walks through them. An option that is off is passed over. */
    panel.addEventListener('keydown', function (e) {
      if (e.key.length !== 1 || e.key === ' ' || e.ctrlKey || e.metaKey || e.altKey) return;
      var live = options().filter(function (o) { return !o.disabled && o.getAttribute('aria-disabled') !== 'true'; });
      var hits = live.filter(function (o) { return o.textContent.trim().toLowerCase().indexOf(e.key.toLowerCase()) === 0; });
      var from = live.indexOf(document.activeElement);
      var hit = hits.filter(function (o) { return live.indexOf(o) > from; })[0] || hits[0];
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
    nameLike(panel, input);
    options().forEach(function (o) { o.id = o.id || uid('tray-option'); o.setAttribute('tabindex', '-1'); });
    /* The no-match sentence sits in the list, where nothing reads it while focus is in the input: a status line beside
       the list says it as it appears, once, and not again at every key while nothing still matches. */
    var tell = quietStatus(root);
    var pop = popup(input, panel, { manual: true, onClose: function () { tell(''); } });
    function setActive(o) {
      if (active) active.removeAttribute('data-active');
      active = o || null;
      if (active) { active.setAttribute('data-active', ''); input.setAttribute('aria-activedescendant', active.id); if (active.scrollIntoView) active.scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    function filter() {
      var q = input.value.trim().toLowerCase(), shown = 0;
      options().forEach(function (o) { var hit = !q || optionWords(o).toLowerCase().indexOf(q) >= 0; o.hidden = !hit; if (hit) shown += 1; });
      if (empty) { empty.hidden = shown > 0; tell(shown ? '' : empty.textContent.trim()); }
      /* With nothing to match the panel holds only the sentence, which is no listbox (a listbox holds options): it is
         hidden from screen readers, which hear the sentence through the status line, and the input is not expanded. */
      if (shown) panel.removeAttribute('aria-hidden'); else panel.setAttribute('aria-hidden', 'true');
      if (pop.isOpen()) input.setAttribute('aria-expanded', String(shown > 0));
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
     data-min, data-max, data-month, data-today, data-week-start, data-locale, data-prev-label and data-next-label (the
     names of the month buttons, in the page's language). Dates are YYYY-MM-DD; a range is start/end. */
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
    var prevLabel = opt('prevLabel', null, 'Previous month'), nextLabel = opt('nextLabel', null, 'Next month');
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
    /* The month shown is said when a month button turns the page, since focus stays on the button: a polite line beside
       the grid, kept while the grid is drawn again. (A key that turns the page moves focus to a day, whose name holds
       its month.) */
    var said = document.createElement('span');
    said.className = 'tray-vh';
    said.setAttribute('aria-live', 'polite');

    function value() { return !start ? '' : (mode === 'range' ? iso(start) + '/' + (end ? iso(end) : '') : iso(start)); }
    function render(keepFocus) {
      var html = '';
      var tab = focusIso || (start && iso(start)) || iso(today);
      for (var m = 0; m < months; m += 1) {
        var first = new Date(view.getFullYear(), view.getMonth() + m, 1);
        html += '<div class="tray-cal__month"><div class="tray-cal__head">' +
          '<button type="button" class="tray-cal__nav" data-nav="-1" aria-label="' + esc(prevLabel) + '"' + (m > 0 ? ' data-ghost' : '') + '>' + icon('chevron-left', 'tray-icon--flip') + '</button>' +
          '<div class="tray-cal__title">' + esc(monthFmt.format(first)) + '</div>' +
          '<button type="button" class="tray-cal__nav" data-nav="1" aria-label="' + esc(nextLabel) + '"' + (m < months - 1 ? ' data-ghost' : '') + '>' + icon('chevron-right', 'tray-icon--flip') + '</button></div>' +
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
      var box = $(':scope > .tray-cal__months', el);
      if (!box) { el.textContent = ''; box = document.createElement('div'); box.className = 'tray-cal__months'; el.appendChild(box); el.appendChild(said); }
      box.innerHTML = html;
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
      if (nav) {
        view = new Date(view.getFullYear(), view.getMonth() + (+nav.dataset.nav), 1); focusIso = null; render();
        var again = $('[data-nav="' + nav.dataset.nav + '"]:not([data-ghost])', el); if (again) again.focus();
        said.textContent = $$('.tray-cal__title', el).map(function (t) { return t.textContent; }).join(', ');
      }
      else if (day && !day.disabled) pick(parseDate(day.dataset.date));
    });
    /* The same day n months on, or the last day of that month when it is shorter (31 January, then 28 February). */
    function monthsOn(d, n) { var last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate(); return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last)); }
    /* The keys of a date picker's grid, as the ARIA practices set them: the arrows by a day and a week, Home and End to
       the start and the end of the week, Page Up and Page Down by a month, with Shift by a year. Past min or max an
       arrow stays put, and the other keys stop at the limit. */
    el.addEventListener('keydown', function (e) {
      var day = e.target.closest && e.target.closest('.tray-cal__day');
      if (!day) return;
      /* in a right-to-left page the week runs from right to left, so the left arrow goes on to the next day */
      var back = getComputedStyle(el).direction === 'rtl' ? 1 : -1;
      var step = { ArrowLeft: back, ArrowRight: -back, ArrowUp: -7, ArrowDown: 7 }[e.key];
      var from = parseDate(day.dataset.date), to = null, dow = (from.getDay() - weekStart + 7) % 7;
      if (step) to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + step);
      else if (e.key === 'Home' || e.key === 'End') to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + (e.key === 'Home' ? -dow : 6 - dow));
      else if (e.key === 'PageUp' || e.key === 'PageDown') to = monthsOn(from, (e.key === 'PageUp' ? -1 : 1) * (e.shiftKey ? 12 : 1));
      if (!to) return;
      e.preventDefault();
      if ((min && to < min) || (max && to > max)) { if (step) return; to = min && to < min ? min : max; }
      focusIso = iso(to);
      var lastShown = new Date(view.getFullYear(), view.getMonth() + months, 0);
      if (to < view) view = new Date(to.getFullYear(), to.getMonth(), 1);
      else if (to > lastShown) view = new Date(to.getFullYear(), to.getMonth() - months + 1, 1);
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
    /* the panel is the dialog that aria-haspopup promises, named as the field is */
    panel.setAttribute('role', 'dialog');
    panel.id = panel.id || uid('tray-dialog');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', panel.id);
    nameLike(panel, trigger);
    /* a trigger with no label is named by its own words, and its dialog by the trigger */
    if (!panel.hasAttribute('aria-label') && !panel.hasAttribute('aria-labelledby')) { trigger.id = trigger.id || uid('tray-named'); panel.setAttribute('aria-labelledby', trigger.id); }
    nameWithValue(trigger, valueEl);
    function toDay() { var t = $('.tray-cal__day[tabindex="0"]', calEl); if (t) t.focus(); }
    var pop = popup(trigger, panel, { onOpen: toDay });
    /* the down arrow opens the panel too, as on a Select, or goes into it when it is open */
    trigger.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); if (pop.isOpen()) toDay(); else pop.open(); } });
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
