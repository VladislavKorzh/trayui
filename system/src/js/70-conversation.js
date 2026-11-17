  /* ---------- Conversation ---------- */

  /* Message scroller: data-tray="scroller" on .tray-scroller holding .tray-scroller__viewport and an optional .tray-scroller__jump button.
     It stays at the newest message while the reader is there, and offers a jump when they have scrolled up. */
  UI.register('scroller', function (root) {
    var view = $('.tray-scroller__viewport', root), jump = $('.tray-scroller__jump', root), count = jump && $('[data-count]', jump), fresh = 0;
    function atEnd() { return view.scrollHeight - view.scrollTop - view.clientHeight < 24; }
    function toEnd(smooth) {
      var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      view.scrollTo({ top: view.scrollHeight, behavior: smooth && !calm ? 'smooth' : 'auto' });
    }
    function paint() {
      if (atEnd()) fresh = 0;
      /* "Latest" goes once the newest message is in view: focus on it moves to the conversation it scrolled. */
      if (jump && atEnd()) rescue(jump, view);
      if (jump) jump.hidden = atEnd();
      if (count) { count.textContent = fresh ? String(fresh) : ''; count.hidden = !fresh; }
    }
    view.setAttribute('tabindex', '0');
    view.setAttribute('role', 'log');
    view.addEventListener('scroll', paint, { passive: true });
    if (jump) jump.addEventListener('click', function () { toEnd(true); });
    new MutationObserver(function (records) {
      var added = records.reduce(function (n, r) { return n + r.addedNodes.length; }, 0);
      if (!added) return;
      if (root.__pinned) { toEnd(false); } else { fresh += added; }
      paint();
    }).observe(view, { childList: true, subtree: true });
    view.addEventListener('scroll', function () { root.__pinned = atEnd(); }, { passive: true });
    root.__pinned = root.dataset.start !== 'top';
    watch(view, function () { if (root.__pinned) toEnd(false); paint(); });
    root.__scroller = { toEnd: toEnd, atEnd: atEnd };
  });

  /* Reaction: data-tray="reaction" on a button with aria-pressed and a [data-count] inside. */
  UI.register('reaction', function (btn) {
    var out = $('[data-count]', btn);
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      if (out) out.textContent = String(Math.max(0, (+out.textContent || 0) + (on ? 1 : -1)));
    });
  });

  /* Show more: data-tray="more" on a button whose aria-controls names a clamped .tray-bubble. */
  UI.register('more', function (btn) {
    var target = document.getElementById(btn.getAttribute('aria-controls'));
    if (!target) return;
    function paint() { var open = !target.hasAttribute('data-clamp'); btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Show less' : 'Show more'; }
    btn.addEventListener('click', function () { target.toggleAttribute('data-clamp'); paint(); });
    paint();
  });

  /* Questionnaire: data-tray="questionnaire" on the form. Each .tray-questionnaire__step is one question; [data-back] and [data-next]
     move between them; [data-progress] and .tray-steps follow; a [data-done] block shows the answers and takes focus, so it is read.
     Fires tray:complete with detail.answers. */
  UI.register('questionnaire', function (root) {
    var steps = $$('.tray-questionnaire__step', root), done = $('[data-done]', root), back = $('[data-back]', root), next = $('[data-next]', root);
    var progress = $('[data-progress]', root), pills = $$('.tray-steps span', root), foot = $('.tray-questionnaire__foot', root), i = 0;
    /* Where focus goes in a question: the answer already chosen, or its first field. */
    function field(step) { return step && ($('input[type="radio"]:checked', step) || $('input:not([hidden]), textarea:not([hidden])', step)); }
    function answer(step) {
      var picked = $$('input:checked', step).map(function (inp) {
        var other = inp.hasAttribute('data-other') && $('[data-other-text]', step);
        return other && other.value.trim() ? other.value.trim() : (inp.dataset.label || inp.value);
      });
      var text = $('textarea, input[type="text"]:not([data-other-text])', step);
      if (!picked.length && text && text.value.trim()) picked = [text.value.trim()];
      return picked;
    }
    function paint() {
      var end = i >= steps.length;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      /* What comes in is shown before what goes is hidden, so focus in the part that goes can move to it:
         from Finish to the answers, from "Change the answers" to the first question. */
      if (done && end) { done.hidden = false; done.setAttribute('tabindex', '-1'); rescue(foot, done); }
      if (foot && !end) { foot.hidden = false; rescue(done, function () { return field(steps[i]); }); }
      if (done && !end) done.hidden = true;
      if (foot && end) foot.hidden = true;
      if (end) return;
      if (progress) progress.textContent = 'Question ' + (i + 1) + ' of ' + steps.length;
      pills.forEach(function (p, k) { p.toggleAttribute('data-done', k <= i); });
      /* Back turns off on the first question and Next until a question is answered: focus on either goes to the question. */
      if (back) { if (i === 0) rescue(back, function () { return field(steps[0]) || next; }); back.disabled = i === 0; }
      if (next) {
        var wait = !steps[i].hasAttribute('data-optional') && !answer(steps[i]).length;
        if (wait) rescue(next, function () { return field(steps[i]); });
        next.disabled = wait;
        next.firstChild.textContent = i === steps.length - 1 ? 'Finish' : 'Next';
      }
      $$('[data-other-text]', steps[i]).forEach(function (t) { var o = $('[data-other]', steps[i]); t.hidden = !(o && o.checked); });
    }
    function finish() {
      var answers = steps.map(function (s) { return { question: ($('legend', s) || s).textContent.trim(), answer: answer(s) }; });
      var list = done && $('.tray-questionnaire__answers', done);
      if (list) list.innerHTML = answers.map(function (a) { return '<div><dt>' + esc(a.question) + '</dt><dd>' + esc(a.answer.join(', ') || 'Skipped') + '</dd></div>'; }).join('');
      fire(root, 'complete', { answers: answers });
    }
    root.addEventListener('change', paint);
    root.addEventListener('input', paint);
    root.addEventListener('submit', function (e) { e.preventDefault(); });
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-back]')) { i = Math.max(0, i - 1); paint(); }
      else if (e.target.closest('[data-next]')) { i += 1; if (i >= steps.length) finish(); paint(); var f = field(steps[i]); if (f) f.focus(); }
      else if (e.target.closest('[data-restart]')) { i = 0; paint(); }
    });
    paint();
  });

  /* Copy: data-tray="copy" on a button with data-target="#id"; copies that element's text (a field's value) and says what
     happened for two seconds: on the button, and aloud through a status beside it, since a button's own content is not
     announced as it changes. A copy the browser refuses says so; it never claims "Copied". */
  var lastSaid = '';
  /* statusAfter(el): a hidden role="status" region placed after el. say(region, words) has it read the words aloud. */
  function statusAfter(el) {
    var status = document.createElement('span');
    status.className = 'tray-vh';
    status.setAttribute('role', 'status');
    el.insertAdjacentElement('afterend', status);
    return status;
  }
  function say(status, words) {
    status.textContent = '';
    /* the same words twice are read only if they differ: a no-break space makes them differ, and is not read */
    var said = words === lastSaid ? words + '\u00a0' : words;
    lastSaid = said;
    requestAnimationFrame(function () { status.textContent = said; });
  }
  UI.register('copy', function (btn) {
    var label = $('[data-label]', btn), was = label ? label.textContent : '', timer = null;
    var status = statusAfter(btn);
    function report(ok) {
      var words = ok ? 'Copied' : 'Copy failed';
      clearTimeout(timer);
      if (label) label.textContent = words;
      btn.toggleAttribute('data-copied', ok);
      btn.toggleAttribute('data-failed', !ok);
      say(status, words);
      timer = setTimeout(function () {
        if (label) label.textContent = was;
        btn.removeAttribute('data-copied'); btn.removeAttribute('data-failed');
        status.textContent = '';
      }, 2000);
    }
    btn.addEventListener('click', function () {
      var source = document.querySelector(btn.dataset.target);
      if (!source) return;
      var text = source.matches('input, textarea') ? source.value : source.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { report(true); }, function () { report(false); });
      else report(false);
    });
  });
