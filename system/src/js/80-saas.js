  /* ---------- Application set: banners, metrics, billing, account, onboarding ---------- */

  /* beyond(el): where focus goes when el is taken away from the page: the first control after it, as Tab would go,
     or else the main content, or else the last control before it. */
  var CONTROLS = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
  function beyond(el) {
    var all = $$(CONTROLS).filter(function (n) { return !el.contains(n) && n.getClientRects().length > 0; });
    var after = all.filter(function (n) { return el.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING; })[0];
    return after || $('main, [role="main"]') || all.filter(function (n) { return el.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING; }).pop();
  }
  /* The control to focus in el: el itself, or the first one inside it. */
  function controlIn(el) { return el && (el.matches(CONTROLS) ? el : $(CONTROLS, el)); }

  /* A pip repeats the count that the aria-label of its button already says ("Notifications, 2 unread"): it is hidden from
     screen readers, so the number is not read twice. */
  UI.upgrade('.tray-pip', function (pip) { pip.setAttribute('aria-hidden', 'true'); });

  /* dismiss: a button that takes away the block it sits in. Put data-dismissable on that block, or name it with data-target.
     Focus moves on to the next control in the page, so it is not dropped to the top. */
  UI.register('dismiss', function (btn) {
    btn.addEventListener('click', function () {
      var root = btn.getAttribute('data-target') ? $(btn.getAttribute('data-target')) : btn.closest('[data-dismissable]');
      if (!root) return;
      rescue(root, function () { return beyond(root); });
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

  /* pricing: a billing-period switch. Inside the wrapper, an element with data-monthly and data-yearly shows the text of the chosen period.
     Focus stays on the switch while the prices change, so a hidden status reads the new ones. */
  UI.register('pricing', function (root) {
    var status = null;
    function words(el) { return [].slice.call(el.childNodes).map(function (n) { return n.textContent.trim(); }).filter(Boolean).join(' '); }
    function spoken(on, period) {
      var label = on && on.closest('label') ? on.closest('label').textContent.trim() : period;
      var plans = $$('.tray-plan', root).filter(function (p) { return $('[data-' + period + ']', p); }).map(function (p) {
        var h = $('.tray-plan__name', p), price = $('.tray-plan__price', p);
        /* the plan's name is the first words of its heading, before a badge such as "Most chosen" */
        var name = h ? (h.firstChild && h.firstChild.nodeType === 3 ? h.firstChild.textContent : h.textContent).trim() : '';
        return (name ? name + ', ' : '') + (price ? words(price) : '');
      });
      /* a plan comparison has no cards: each plan is the head of a column, its name and then its price */
      if (!plans.length) plans = $$('th[scope="col"]', root).filter(function (th) { return $('[data-' + period + ']', th); }).map(function (th) {
        var name = th.firstChild && th.firstChild.nodeType === 3 ? th.firstChild.textContent.trim() : '';
        return (name ? name + ', ' : '') + words($('[data-' + period + ']', th));
      });
      return label + ' prices' + (plans.length ? ': ' + plans.join('; ') : '');
    }
    function apply(tell) {
      var on = $('input[type="radio"][name="' + (root.getAttribute('data-name') || 'period') + '"]:checked', root);
      var period = on ? on.value : 'monthly';
      root.setAttribute('data-period', period);
      $$('[data-' + period + ']', root).forEach(function (n) { n.textContent = n.getAttribute('data-' + period); });
      if (!tell) return;
      if (!status) { status = document.createElement('span'); status.className = 'tray-vh'; status.setAttribute('role', 'status'); root.appendChild(status); }
      say(status, spoken(on, period));
      fire(root, 'change', { period: period });
    }
    root.addEventListener('change', function (e) { if (e.target.type === 'radio') apply(true); });
    apply(false);
  });

  /* mask: while it is typed, groups a card number in fours (data-mask="card") or writes an expiry date as MM/YY (data-mask="expiry"). */
  UI.register('mask', function (input) {
    var kind = input.getAttribute('data-mask');
    input.addEventListener('input', function () {
      var at = input.selectionStart, v = input.value, d = v.replace(/\D/g, '');
      var before = at == null ? d.length : v.slice(0, at).replace(/\D/g, '').length;
      if (kind === 'card') input.value = d.slice(0, 19).replace(/(.{4})(?=.)/g, '$1 ');
      else if (kind === 'expiry') { d = d.slice(0, 4); input.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; }
      else return;
      /* Writing the value puts the caret at the end: put it back after the digit it followed, so a number edited in the middle keeps its place. */
      if (at == null || document.activeElement !== input) return;
      var out = input.value, pos = 0, seen = 0;
      while (pos < out.length && seen < before) { if (/\d/.test(out.charAt(pos))) seen += 1; pos += 1; }
      input.setSelectionRange(pos, pos);
    });
  });

  /* secret: shows and hides a key and copies the real value either way. data-value holds the key; the code element holds its masked form. */
  UI.register('secret', function (root) {
    var code = $('code', root), value = root.getAttribute('data-value') || '', masked = code ? code.textContent : '', shown = false;
    var show = $('[data-secret="show"]', root), copy = $('[data-secret="copy"]', root);
    var labels = [show && show.getAttribute('aria-label') || 'Show the key', show && show.getAttribute('data-label-on') || 'Hide the key'];
    if (show) {
      /* The name says what a press will do, "Show the key" or "Hide the key". aria-pressed would say it a second time
         ("Hide the key, pressed"), so the button carries none. */
      show.removeAttribute('aria-pressed');
      show.addEventListener('click', function () {
        shown = !shown;
        code.textContent = shown ? value : masked;
        show.setAttribute('aria-label', labels[shown ? 1 : 0]);
        show.innerHTML = icon(shown ? 'eye-off' : 'eye');
      });
    }
    if (copy) {
      /* What happened is shown on the button for a moment and said through a hidden status beside it: a copy the
         browser refuses says so, and never shows the check. */
      var status = statusAfter(copy), timer = null;
      var report = function (ok) {
        clearTimeout(timer);
        copy.innerHTML = icon(ok ? 'check' : 'circle-alert');
        copy.toggleAttribute('data-failed', !ok);
        say(status, ok ? 'Copied' : 'Copy failed');
        timer = setTimeout(function () { copy.innerHTML = icon('copy'); copy.removeAttribute('data-failed'); status.textContent = ''; }, 1800);
        fire(root, 'change', { copied: ok });
      };
      copy.addEventListener('click', function () {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(function () { report(true); }, function () { report(false); });
        else report(false);
      });
    }
  });

  /* A chip with a remove button, as the tag input and the filter bar make them. A wrong one (wrong: what is wrong, in words)
     carries data-invalid and says so in a hidden span, since its danger edge is seen and not read. */
  function chipOf(value, label, wrong) {
    var chip = document.createElement('span');
    chip.className = 'tray-chip';
    chip.setAttribute('data-value', value);
    if (wrong) chip.setAttribute('data-invalid', '');
    chip.innerHTML = esc(label || value) + (wrong ? wrongText(wrong) : '') + '<button type="button" class="tray-chip__x" aria-label="Remove ' + esc(label || value) + '">' + icon('x', 'tray-icon--sm') + '</button>';
    return chip;
  }
  function wrongText(words) { return '<span class="tray-vh" data-invalid-text>, ' + esc(words) + '</span>'; }

  /* taginput: several values in one field. Enter or a comma adds one, Backspace on an empty field takes the last away, a pasted list is split.
     A wrong value (data-pattern="email") keeps its chip, marked data-invalid, and makes the text field aria-invalid; at data-max
     what was typed stays in the field and the limit is said. */
  UI.register('taginput', function (root) {
    var input = $('input:not([type="hidden"])', root), store = $('input[type="hidden"]', root);
    if (!input) return;
    var kind = root.getAttribute('data-pattern'), max = parseInt(root.getAttribute('data-max'), 10) || Infinity;
    var wrong = root.getAttribute('data-invalid-text') || (kind === 'email' ? 'not an email address' : 'not valid');
    var live = document.createElement('span'), mine = false;
    live.className = 'tray-vh';
    live.setAttribute('aria-live', 'polite');
    root.appendChild(live);
    function ok(v) { return kind !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    function chips() { return $$('.tray-chip', root); }
    function values() { return chips().map(function (c) { return c.getAttribute('data-value'); }); }
    /* aria-invalid belongs on the text field, which a screen reader reaches, not on the tray around it. The behaviour takes
       away only the mark it set itself: an error put on the field from elsewhere (a Field's, the server's) stays. */
    function mark() {
      var bad = !!$('.tray-chip[data-invalid]', root);
      root.removeAttribute('aria-invalid');
      if (bad && input.getAttribute('aria-invalid') !== 'true') { input.setAttribute('aria-invalid', 'true'); mine = true; }
      else if (!bad && mine) { input.removeAttribute('aria-invalid'); mine = false; }
    }
    function sync(said) {
      if (store) store.value = values().join(',');
      mark();
      if (said) say(live, said);
      fire(root, 'change', { values: values(), valid: !$('.tray-chip[data-invalid]', root) });
    }
    /* add(raw): false when there is no room for it, so the caller keeps what was typed. */
    function add(raw) {
      var v = String(raw).trim().replace(/[,;]+$/, '');
      if (!v) return true;
      if (values().indexOf(v) >= 0) { say(live, v + ' is already in the list'); return true; }
      if (values().length >= max) { say(live, v + ' not added: the limit is ' + max); return false; }
      var bad = !ok(v);
      root.insertBefore(chipOf(v, null, bad ? wrong : null), input);
      sync(v + ' added' + (bad ? ', ' + wrong : ''));
      return true;
    }
    function drop(chip) { var v = chip.getAttribute('data-value'); chip.remove(); sync(v + ' removed'); }
    root.addEventListener('click', function (e) {
      var x = e.target.closest('.tray-chip__x');
      if (x) { drop(x.closest('.tray-chip')); input.focus(); } else if (e.target === root) input.focus();
    });
    input.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) { e.preventDefault(); if (add(input.value)) input.value = ''; }
      else if (e.key === 'Backspace' && !input.value) { var all = chips(); if (all.length) drop(all[all.length - 1]); }
    });
    input.addEventListener('paste', function (e) {
      var text = (e.clipboardData || window.clipboardData).getData('text');
      if (!/[,;\s]/.test(text.trim())) return;
      e.preventDefault();
      /* what does not fit stays in the field, so nothing pasted is lost */
      var left = text.split(/[,;\s]+/).filter(function (v) { return !add(v); });
      if (left.length) input.value = left.join(', ');
    });
    input.addEventListener('blur', function () { if (input.value.trim() && add(input.value)) input.value = ''; });
    chips().forEach(function (c) {
      if (!c.hasAttribute('data-value')) c.setAttribute('data-value', c.textContent.trim());
      var x = $('.tray-chip__x', c);
      if (c.hasAttribute('data-invalid') && !$('[data-invalid-text]', c)) { if (x) x.insertAdjacentHTML('beforebegin', wrongText(wrong)); else c.insertAdjacentHTML('beforeend', wrongText(wrong)); }
    });
    if (store) store.value = values().join(',');
    mark();
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
        $('button', row).addEventListener('click', function () {
          /* focus goes to the next file's remove button, or the one before, or back to the field once the list is empty */
          rescue(row, function () { var sib = row.nextElementSibling || row.previousElementSibling; return (sib && $('button', sib)) || input || root; });
          row.remove();
          fire(root, 'change', { removed: f.name });
        });
        list.appendChild(row);
      });
      fire(root, 'change', { files: files });
    }
    ['dragenter', 'dragover'].forEach(function (n) { root.addEventListener(n, function (e) { e.preventDefault(); root.setAttribute('data-over', ''); }); });
    ['dragleave', 'drop'].forEach(function (n) { root.addEventListener(n, function (e) { e.preventDefault(); root.removeAttribute('data-over'); }); });
    root.addEventListener('drop', function (e) { take(e.dataTransfer && e.dataTransfer.files); });
    if (input) input.addEventListener('change', function () { take(input.files); input.value = ''; });
  });

  /* checklist: a button with data-task-done finishes its task; the next open task becomes the current one and the progress follows.
     A done task says so in words too: a hidden ", done" after its title, which 80-saas.css lets a screen reader hear only while
     the task carries data-done. Markup that holds its own [data-task-state] span keeps its words. */
  UI.register('checklist', function (root) {
    var tasks = $$('.tray-task', root);
    tasks.forEach(function (t) {
      var b = $('.tray-task__body > b', t);
      if (b && !$('[data-task-state]', t)) b.insertAdjacentHTML('beforeend', '<span class="tray-vh" data-task-state>, done</span>');
    });
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
      var done = paint(), next = $('.tray-task[aria-current] .tray-btn', root), end = $('[data-checklist-done]', root);
      /* Focus follows to the next task's button. After the last one, whose button goes, it moves to the closing line, so that line is read. */
      if (next) next.focus();
      else rescue(btn, end && !end.hidden ? end : root);
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
    /* The tour ends: focus in the step goes to the part the step pointed at, the last thing it spoke of, or else to the area. */
    function end(finished) {
      var s = steps[at], t = target(s);
      if (s) rescue(s, function () { return controlIn(t) || t || root; });
      show(-1);
      fire(root, 'complete', { finished: finished });
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tour]');
      if (!b) return;
      var act = b.getAttribute('data-tour');
      if (act === 'back' && at > 0) show(at - 1);
      else if (act === 'next' && at < steps.length - 1) show(at + 1);
      else { end(act !== 'skip'); return; }
      var go = $('[data-tour="next"]', steps[at]);
      if (go) go.focus();
      fire(root, 'change', { step: at + 1 });
    });
    /* Escape in a step closes the tour, as Skip does. */
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || at < 0 || !steps[at] || !steps[at].contains(e.target)) return;
      e.preventDefault();
      end(false);
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
      /* the answer closes the panel under the reader's finger: focus moves on to the next control in the page */
      rescue(root, function () { return beyond(root); });
      root.hidden = true;
      fire(root, 'complete', { choice: choice });
    });
  });

  /* notices: opening a notification marks it read, "mark all as read" clears the rest, and the count on the trigger follows:
     in the pip, which is aria-hidden, and in the trigger's aria-label ("Notifications, 2 unread"). */
  UI.register('notices', function (root) {
    var scope = root.closest('.tray-anchor') || root;
    var bell = scope !== root ? $(':scope > button, :scope > a', scope) : null;
    var named = bell && bell.getAttribute('aria-label') ? bell.getAttribute('aria-label').replace(/,\s*\d+\s+unread$/i, '') : '';
    function read(n) { n.removeAttribute('data-unread'); var v = $('.tray-vh', n); if (v) v.remove(); }
    function paint() {
      var n = $$('.tray-notice[data-unread]', root).length, only = $('input[name="notices-view"][value="unread"]', root);
      only = !!(only && only.checked);
      $$('[data-notices-count]', scope).forEach(function (p) { p.textContent = n ? String(n) : ''; p.setAttribute('aria-hidden', 'true'); });
      if (named) bell.setAttribute('aria-label', n ? named + ', ' + n + ' unread' : named);
      var all = $('[data-notices="read-all"]', root), empty = $('[data-notices="empty"]', root);
      /* With nothing to mark, "Mark all as read" is aria-disabled, not disabled: it keeps focus when it is the one pressed,
         and it stays the first stop in the panel, where the Popover puts focus as it opens. */
      if (all) { all.disabled = false; all.setAttribute('aria-disabled', String(!n)); }
      if (empty) empty.hidden = !(only && !n);
      var items = $$('.tray-notice', root), keep = function (item) { return !only || item.hasAttribute('data-unread'); };
      items.forEach(function (item, k) {
        var row = item.closest('li') || item;
        /* a notification read in the Unread view goes from it: focus on it moves to the next one left, or to what is shown instead */
        if (!keep(item)) rescue(row, function () { var to = items.slice(k + 1).filter(keep)[0] || items.slice(0, k).filter(keep).pop(); return to || (empty && !empty.hidden ? empty : all); });
        row.hidden = !keep(item);
      });
      return n;
    }
    root.addEventListener('click', function (e) {
      var all = e.target.closest('[data-notices="read-all"]'), item = e.target.closest('.tray-notice');
      if (all && all.getAttribute('aria-disabled') === 'true') return;
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
    /* The button of the menu a filter came from, or else the first control of the bar: where focus goes once no chip is left. */
    function home(v) { var o = v && option(v), a = o && o.closest('.tray-anchor'); return (a && $(':scope > button', a)) || $('input, button', root); }
    function drop(chip) {
      var v = chip.getAttribute('data-value'), o = option(v);
      /* focus on the chip goes to the next chip, or the one before, or back to the menu it came from */
      rescue(chip, function () { var rest = all().filter(function (c) { return c !== chip; }), k = all().indexOf(chip), to = rest[k] || rest[k - 1]; return to ? $('.tray-chip__x', to) : home(v); });
      if (o) o.setAttribute('aria-checked', 'false');
      chip.remove();
    }
    root.addEventListener('click', function (e) {
      var x = e.target.closest('.tray-chip__x'), clear = e.target.closest('[data-filter="clear"]'), opt = e.target.closest('[role="menuitemcheckbox"][data-value]');
      if (x && chips.contains(x)) { drop(x.closest('.tray-chip')); tell(); }
      /* "Clear all" goes with the last chip: focus on it moves back to the menu of the first filter */
      else if (clear) { var first = all()[0]; rescue(clear, function () { return home(first && first.getAttribute('data-value')); }); all().forEach(drop); tell(); }
      else if (opt) setTimeout(function () {
        var v = opt.getAttribute('data-value'), on = opt.getAttribute('aria-checked') === 'true', have = find(v);
        if (on && !have) chips.insertBefore(chipOf(v, opt.getAttribute('data-label') || v), $('[data-filter="clear"]', chips));
        if (!on && have) have.remove();
        tell();
      }, 0);
    });
  });
