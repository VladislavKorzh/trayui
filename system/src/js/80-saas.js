  /* ---------- Application set: banners, metrics, billing, account, onboarding ---------- */

  /* dismiss: a button that takes away the block it sits in. Put data-dismissable on that block, or name it with data-target. */
  UI.register('dismiss', function (btn) {
    btn.addEventListener('click', function () {
      var root = btn.getAttribute('data-target') ? $(btn.getAttribute('data-target')) : btn.closest('[data-dismissable]');
      if (!root) return;
      hide(root);
      fire(root, 'close');
    });
  });

  /* spark: a small trend line from data-points="3,5,4,8". It is decoration: the figure beside it carries the value. */
  UI.register('spark', function (el) {
    var pts = (el.getAttribute('data-points') || '').split(',').map(Number).filter(function (n) { return !isNaN(n); });
    if (pts.length < 2) return;
    var lo = Math.min.apply(null, pts), hi = Math.max.apply(null, pts), span = hi - lo || 1, w = 100, h = 32, pad = 3;
    var d = pts.map(function (v, i) {
      return (i ? 'L' : 'M') + ((i / (pts.length - 1)) * w).toFixed(1) + ' ' + (pad + (1 - (v - lo) / span) * (h - 2 * pad)).toFixed(1);
    }).join('');
    el.innerHTML = '<svg class="tray-spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
  });

  /* uptime: a bar per day, oldest first. data-days="90"; data-incidents='{"12":"degraded","47":"down"}' counts days back from today. */
  UI.register('uptime', function (el) {
    var days = parseInt(el.getAttribute('data-days'), 10) || 90, inc = {}, html = '';
    try { inc = JSON.parse(el.getAttribute('data-incidents') || '{}'); } catch (e) { inc = {}; }
    for (var i = days - 1; i >= 0; i -= 1) html += '<span' + (inc[i] ? ' data-s="' + esc(inc[i]) + '"' : '') + '></span>';
    el.innerHTML = html;
    el.setAttribute('aria-hidden', 'true');
  });

  /* pricing: a billing-period switch. Inside the wrapper, an element with data-monthly and data-yearly shows the text of the chosen period. */
  UI.register('pricing', function (root) {
    function apply(tell) {
      var on = $('input[type="radio"][name="' + (root.getAttribute('data-name') || 'period') + '"]:checked', root);
      var period = on ? on.value : 'monthly';
      root.setAttribute('data-period', period);
      $$('[data-' + period + ']', root).forEach(function (n) { n.textContent = n.getAttribute('data-' + period); });
      if (tell) fire(root, 'change', { period: period });
    }
    root.addEventListener('change', function (e) { if (e.target.type === 'radio') apply(true); });
    apply(false);
  });

  /* mask: while it is typed, groups a card number in fours (data-mask="card") or writes an expiry date as MM/YY (data-mask="expiry"). */
  UI.register('mask', function (input) {
    var kind = input.getAttribute('data-mask');
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '');
      if (kind === 'card') input.value = d.slice(0, 19).replace(/(.{4})(?=.)/g, '$1 ');
      else if (kind === 'expiry') { d = d.slice(0, 4); input.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; }
    });
  });

  /* secret: shows and hides a key and copies the real value either way. data-value holds the key; the code element holds its masked form. */
  UI.register('secret', function (root) {
    var code = $('code', root), value = root.getAttribute('data-value') || '', masked = code ? code.textContent : '', shown = false;
    var show = $('[data-secret="show"]', root), copy = $('[data-secret="copy"]', root);
    var labels = [show && show.getAttribute('aria-label') || 'Show the key', show && show.getAttribute('data-label-on') || 'Hide the key'];
    if (show) {
      show.setAttribute('aria-pressed', 'false');
      show.addEventListener('click', function () {
        shown = !shown;
        code.textContent = shown ? value : masked;
        show.setAttribute('aria-pressed', String(shown));
        show.setAttribute('aria-label', labels[shown ? 1 : 0]);
        show.innerHTML = icon(shown ? 'eye-off' : 'eye');
      });
    }
    if (copy) copy.addEventListener('click', function () {
      function said() {
        copy.innerHTML = icon('check');
        copy.setAttribute('aria-live', 'polite');
        setTimeout(function () { copy.innerHTML = icon('copy'); }, 1800);
        fire(root, 'change', { copied: true });
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(said, said); else said();
    });
  });

  /* A chip with a remove button, as the tag input and the filter bar make them. */
  function chipOf(value, label) {
    var chip = document.createElement('span');
    chip.className = 'tray-chip';
    chip.setAttribute('data-value', value);
    chip.innerHTML = esc(label || value) + '<button type="button" class="tray-chip__x" aria-label="Remove ' + esc(label || value) + '">' + icon('x', 'tray-icon--sm') + '</button>';
    return chip;
  }

  /* taginput: several values in one field. Enter or a comma adds one, Backspace on an empty field takes the last away, a pasted list is split. */
  UI.register('taginput', function (root) {
    var input = $('input:not([type="hidden"])', root), store = $('input[type="hidden"]', root);
    if (!input) return;
    var kind = root.getAttribute('data-pattern'), max = parseInt(root.getAttribute('data-max'), 10) || Infinity;
    var live = document.createElement('span');
    live.className = 'tray-vh';
    live.setAttribute('aria-live', 'polite');
    root.appendChild(live);
    function ok(v) { return kind !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    function chips() { return $$('.tray-chip', root); }
    function values() { return chips().map(function (c) { return c.getAttribute('data-value'); }); }
    function sync(said) {
      if (store) store.value = values().join(',');
      if ($('.tray-chip[data-invalid]', root)) root.setAttribute('aria-invalid', 'true'); else root.removeAttribute('aria-invalid');
      if (said) live.textContent = said;
      fire(root, 'change', { values: values(), valid: !$('.tray-chip[data-invalid]', root) });
    }
    function add(raw) {
      var v = String(raw).trim().replace(/[,;]+$/, '');
      if (!v || values().indexOf(v) >= 0 || values().length >= max) return;
      var chip = chipOf(v);
      if (!ok(v)) chip.setAttribute('data-invalid', '');
      root.insertBefore(chip, input);
      sync(v + ' added');
    }
    function drop(chip) { var v = chip.getAttribute('data-value'); chip.remove(); sync(v + ' removed'); }
    root.addEventListener('click', function (e) {
      var x = e.target.closest('.tray-chip__x');
      if (x) { drop(x.closest('.tray-chip')); input.focus(); } else if (e.target === root) input.focus();
    });
    input.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) { e.preventDefault(); add(input.value); input.value = ''; }
      else if (e.key === 'Backspace' && !input.value) { var all = chips(); if (all.length) drop(all[all.length - 1]); }
    });
    input.addEventListener('paste', function (e) {
      var text = (e.clipboardData || window.clipboardData).getData('text');
      if (!/[,;\s]/.test(text.trim())) return;
      e.preventDefault();
      text.split(/[,;\s]+/).forEach(add);
    });
    input.addEventListener('blur', function () { if (input.value.trim()) { add(input.value); input.value = ''; } });
    chips().forEach(function (c) { if (!c.hasAttribute('data-value')) c.setAttribute('data-value', c.textContent.trim()); });
    if (store) store.value = values().join(',');
  });

  /* dropzone: takes files that are dropped or chosen and lists them in the element named by data-list. data-max-mb marks a file as too large. It uploads nothing. */
  UI.register('dropzone', function (root) {
    var input = $('input[type="file"]', root), list = root.getAttribute('data-list') ? $(root.getAttribute('data-list')) : null;
    var max = parseFloat(root.getAttribute('data-max-mb')) || 0;
    function size(b) { return b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
    function take(files) {
      files = [].slice.call(files || []);
      if (!files.length) return;
      if (list) files.forEach(function (f) {
        var big = max && f.size > max * 1048576, row = document.createElement('div');
        row.className = 'tray-attachment';
        if (big) row.setAttribute('data-state', 'error');
        row.innerHTML = '<span class="tray-attachment__media">' + icon(/^image\//.test(f.type) ? 'image' : 'file') + '</span>' +
          '<span class="tray-attachment__body"><span class="tray-attachment__name">' + esc(f.name) + '</span><span class="tray-attachment__meta">' +
          (big ? esc((root.getAttribute('data-too-large') || 'Too large. The limit is {max} MB.').replace('{max}', max)) : size(f.size)) + '</span></span>' +
          '<button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" aria-label="Remove ' + esc(f.name) + '">' + icon('x') + '</button>';
        $('button', row).addEventListener('click', function () { row.remove(); fire(root, 'change', { removed: f.name }); });
        list.appendChild(row);
      });
      fire(root, 'change', { files: files });
    }
    ['dragenter', 'dragover'].forEach(function (n) { root.addEventListener(n, function (e) { e.preventDefault(); root.setAttribute('data-over', ''); }); });
    ['dragleave', 'drop'].forEach(function (n) { root.addEventListener(n, function (e) { e.preventDefault(); root.removeAttribute('data-over'); }); });
    root.addEventListener('drop', function (e) { take(e.dataTransfer && e.dataTransfer.files); });
    if (input) input.addEventListener('change', function () { take(input.files); input.value = ''; });
  });

  /* checklist: a button with data-task-done finishes its task; the next open task becomes the current one and the progress follows. */
  UI.register('checklist', function (root) {
    var tasks = $$('.tray-task', root);
    function paint() {
      var done = tasks.filter(function (t) { return t.hasAttribute('data-done'); }).length;
      var next = tasks.filter(function (t) { return !t.hasAttribute('data-done'); })[0];
      tasks.forEach(function (t) { if (t === next) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current'); });
      var bar = $('.tray-progress__bar', root), val = $('.tray-progress__value', root), end = $('[data-checklist-done]', root);
      if (bar) {
        bar.style.setProperty('--tray-v', Math.round(done / tasks.length * 100));
        bar.setAttribute('aria-valuemax', tasks.length);
        bar.setAttribute('aria-valuenow', done);
        bar.setAttribute('aria-valuetext', done + ' of ' + tasks.length);
      }
      if (val) val.textContent = done + ' of ' + tasks.length;
      if (end) end.hidden = done < tasks.length;
      return done;
    }
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-task-done]');
      if (!btn) return;
      btn.closest('.tray-task').setAttribute('data-done', '');
      var done = paint(), next = $('.tray-task[aria-current] .tray-btn', root);
      if (next) next.focus();
      fire(root, done === tasks.length ? 'complete' : 'change', { done: done, total: tasks.length });
    });
    paint();
  });

  /* tour: steps that point at parts of the page, one at a time. Each .tray-tour names its target with data-for; buttons carry data-tour="next", "back" or "skip". */
  UI.register('tour', function (root) {
    var steps = $$('.tray-tour', root), at = 0;
    steps.forEach(function (s, i) { if (!s.hidden) at = i; });
    function target(s) { return s && s.getAttribute('data-for') ? $(s.getAttribute('data-for'), root) : null; }
    function place(s, t) {
      var r = root.getBoundingClientRect(), b = t.getBoundingClientRect();
      var top = b.bottom - r.top + 14, above = b.top - r.top - s.offsetHeight - 14;
      if (top + s.offsetHeight > r.height && above >= 0) top = above;
      s.style.top = top + 'px';
      s.style.left = clamp(b.left - r.left, 8, Math.max(8, r.width - s.offsetWidth - 8)) + 'px';
    }
    function show(i) {
      steps.forEach(function (s, n) {
        s.hidden = n !== i;
        var t = target(s);
        if (t) { if (n === i) t.setAttribute('data-tour-on', ''); else t.removeAttribute('data-tour-on'); }
      });
      at = i;
      var s = steps[i], count = s && $('.tray-tour__count', s);
      if (!s) return;
      if (count) count.textContent = (i + 1) + ' of ' + steps.length;
      if (target(s)) place(s, target(s));
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tour]');
      if (!b) return;
      var act = b.getAttribute('data-tour');
      if (act === 'back' && at > 0) show(at - 1);
      else if (act === 'next' && at < steps.length - 1) show(at + 1);
      else { show(-1); fire(root, 'complete', { finished: act !== 'skip' }); return; }
      var go = $('[data-tour="next"]', steps[at]);
      if (go) go.focus();
      fire(root, 'change', { step: at + 1 });
    });
    watch(root, function () { if (at >= 0 && steps[at]) show(at); });
  });

  /* feedback: choosing a rating opens the follow-up; sending it shows the thanks and reports both. */
  UI.register('feedback', function (root) {
    var more = $('[data-feedback="more"]', root), thanks = $('[data-feedback="thanks"]', root);
    root.addEventListener('change', function (e) { if (e.target.name === 'rating' && more) more.hidden = false; });
    root.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = $('input[name="rating"]:checked', root), t = $('textarea', root);
      $$('[data-feedback="ask"], [data-feedback="more"]', root).forEach(function (n) { n.hidden = true; });
      if (thanks) { thanks.hidden = false; thanks.setAttribute('tabindex', '-1'); thanks.focus(); }
      fire(root, 'complete', { rating: r ? r.value : null, comment: t ? t.value : '' });
    });
  });

  /* consent: buttons with data-consent="all", "necessary" or "save" close the panel and report the choice of each checkbox by name. */
  UI.register('consent', function (root) {
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (!b) return;
      var kind = b.getAttribute('data-consent'), choice = {};
      $$('input[type="checkbox"]', root).forEach(function (c) {
        if (kind === 'all') c.checked = true;
        if (kind === 'necessary' && !c.disabled) c.checked = false;
        choice[c.name || c.id] = c.checked;
      });
      root.hidden = true;
      fire(root, 'complete', { choice: choice });
    });
  });

  /* notices: opening a notification marks it read, "mark all as read" clears the rest, and the count on the trigger follows. */
  UI.register('notices', function (root) {
    var scope = root.closest('.tray-anchor') || root;
    function read(n) { n.removeAttribute('data-unread'); var v = $('.tray-vh', n); if (v) v.remove(); }
    function paint() {
      var n = $$('.tray-notice[data-unread]', root).length, only = $('input[name="notices-view"][value="unread"]', root);
      only = !!(only && only.checked);
      $$('[data-notices-count]', scope).forEach(function (p) { p.textContent = n ? String(n) : ''; });
      var all = $('[data-notices="read-all"]', root), empty = $('[data-notices="empty"]', root);
      if (all) all.disabled = !n;
      $$('.tray-notice', root).forEach(function (item) { (item.closest('li') || item).hidden = only && !item.hasAttribute('data-unread'); });
      if (empty) empty.hidden = !(only && !n);
      return n;
    }
    root.addEventListener('click', function (e) {
      var all = e.target.closest('[data-notices="read-all"]'), item = e.target.closest('.tray-notice');
      if (all) $$('.tray-notice[data-unread]', root).forEach(read);
      else if (item && item.hasAttribute('data-unread')) read(item);
      else return;
      fire(root, 'change', { unread: paint() });
    });
    root.addEventListener('change', function (e) { if (e.target.name === 'notices-view') paint(); });
    paint();
  });

  /* filterbar: a checked menu item with data-value becomes a chip; removing the chip unchecks it; "clear" removes them all. */
  UI.register('filterbar', function (root) {
    var chips = $('.tray-filterbar__chips', root);
    if (!chips) return;
    function all() { return $$('.tray-chip', chips); }
    function option(v) { return $$('[role="menuitemcheckbox"][data-value]', root).filter(function (o) { return o.getAttribute('data-value') === v; })[0]; }
    function find(v) { return all().filter(function (c) { return c.getAttribute('data-value') === v; })[0]; }
    function tell() { fire(root, 'change', { filters: all().map(function (c) { return c.getAttribute('data-value'); }) }); }
    function drop(chip) { var o = option(chip.getAttribute('data-value')); if (o) o.setAttribute('aria-checked', 'false'); chip.remove(); }
    root.addEventListener('click', function (e) {
      var x = e.target.closest('.tray-chip__x'), clear = e.target.closest('[data-filter="clear"]'), opt = e.target.closest('[role="menuitemcheckbox"][data-value]');
      if (x && chips.contains(x)) { drop(x.closest('.tray-chip')); tell(); }
      else if (clear) { all().forEach(drop); tell(); }
      else if (opt) setTimeout(function () {
        var v = opt.getAttribute('data-value'), on = opt.getAttribute('aria-checked') === 'true', have = find(v);
        if (on && !have) chips.insertBefore(chipOf(v, opt.getAttribute('data-label') || v), $('[data-filter="clear"]', chips));
        if (!on && have) have.remove();
        tell();
      }, 0);
    });
  });
