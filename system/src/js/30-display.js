  /* ---------- Display: resizable split, carousel, lightbox, video player ---------- */

  /* Resizable: data-tray="split" on .tray-split holding pane, handle, pane. data-min and data-max limit the first pane (percent). */
  UI.register('split', function (root) {
    var handle = $('.tray-split__handle', root), first = root.firstElementChild, vertical = root.classList.contains('tray-split--v');
    var min = +(root.dataset.min || 20), max = +(root.dataset.max || 80), size = +(root.dataset.size || 50);
    function set(v) {
      size = clamp(v, min, max);
      first.setAttribute('data-size', '');
      first.style.flexBasis = size + '%';
      handle.setAttribute('aria-valuenow', String(Math.round(size)));
      fire(root, 'change', { size: size });
    }
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-orientation', vertical ? 'horizontal' : 'vertical');
    handle.setAttribute('aria-valuemin', String(min));
    handle.setAttribute('aria-valuemax', String(max));
    if (!handle.hasAttribute('aria-label')) handle.setAttribute('aria-label', 'Resize the panes');
    handle.addEventListener('pointerdown', function (e) {
      handle.setPointerCapture(e.pointerId);
      var box = root.getBoundingClientRect();
      /* the direction the split is laid out in, as the keys read it: a dir="ltr" part of a right-to-left page is ltr */
      var rtl = !vertical && getComputedStyle(root).direction === 'rtl';
      function move(ev) {
        if (vertical) set((ev.clientY - box.top) / box.height * 100);
        else set((rtl ? box.right - ev.clientX : ev.clientX - box.left) / box.width * 100);
      }
      function up() { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); }
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
    handle.addEventListener('keydown', function (e) {
      /* right to left the first pane is on the right: the arrows follow the handle, not the numbers */
      var rtl = !vertical && getComputedStyle(root).direction === 'rtl';
      var back = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft', forth = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
      if (e.key === back) { e.preventDefault(); set(size - 2); }
      else if (e.key === forth) { e.preventDefault(); set(size + 2); }
      else if (e.key === 'Home') { e.preventDefault(); set(min); }
      else if (e.key === 'End') { e.preventDefault(); set(max); }
    });
    set(size);
  });

  /* Carousel: data-tray="carousel" on .tray-carousel holding a track of slides, [data-prev], [data-next] and a count. */
  UI.register('carousel', function (root) {
    var track = $('.tray-carousel__track', root), prev = $('[data-prev]', root), next = $('[data-next]', root), count = $('.tray-carousel__count', root);
    function slides() { return $$('.tray-carousel__slide', track); }
    function index() {
      var list = slides(), at = Math.abs(track.scrollLeft), best = 0;
      function gap(i) { return Math.abs(Math.abs(list[i].offsetLeft - list[0].offsetLeft) - at); }
      list.forEach(function (s, i) { if (gap(i) < gap(best)) best = i; });
      return best;
    }
    function paint() {
      var i = index(), n = slides().length, end = Math.abs(track.scrollLeft) + track.clientWidth >= track.scrollWidth - 2;
      /* The count is the first slide in view, until the track can go no further: with several slides in view the last
         ones are then in view too, and the count says the last, "5 / 5", as Next turns off. */
      if (count) count.textContent = (end && i > 0 ? n : i + 1) + ' / ' + n;
      /* a button that turns off at an end while it has focus hands it to the other one, or to the track */
      if (prev && i === 0) rescue(prev, next && !end ? next : track);
      if (next && end) rescue(next, prev && i > 0 ? prev : track);
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = end;
    }
    function go(step) {
      var list = slides(), to = list[clamp(index() + step, 0, list.length - 1)];
      var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.scrollTo({ left: to.offsetLeft - list[0].offsetLeft, behavior: calm ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', paint, { passive: true });
    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', function (e) {
      /* right to left the next slide is on the left */
      var rtl = getComputedStyle(track).direction === 'rtl', step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
      if (step) { e.preventDefault(); go(step); }
    });
    watch(track, paint);
  });

  /* Lightbox: data-tray="lightbox" on a gallery of links to the full pictures, data-target="#id" naming its <dialog
     class="tray-lightbox">. The dialog's row of pictures is made from the links the first time one is opened: each picture
     is the link's href, its text the thumbnail's alt, its caption the link's data-caption. Without the script a link opens
     its picture. The row is the browser's own scroll with snapping, so swipe, trackpad and arrow keys move through it; the
     buttons step one picture, the count follows the scroll, and a status line says where you are once the scroll settles. */
  UI.register('lightbox', function (gallery) {
    var dialog = document.querySelector(gallery.dataset.target);
    if (!dialog) return;
    var track = $('.tray-lightbox__track', dialog), prev = $('[data-prev]', dialog), next = $('[data-next]', dialog);
    var count = $('.tray-lightbox__count', dialog), status = $('[role="status"]', dialog), of = dialog.dataset.of || 'of';
    var links = $$('a[href]', gallery), made = false, settled = -1, pending = -1, frame = 0, timer = 0;
    function make() {
      if (made) return;
      made = true;
      /* the track is a list, so each picture stays a list item; the slide inside it is the group, named "2 of 6" */
      track.innerHTML = links.map(function (a, i) {
        var img = $('img', a), cap = a.dataset.caption || '';
        return '<li class="tray-lightbox__slide">' +
          '<figure role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' ' + esc(of) + ' ' + links.length + '"><img src="' + esc(a.href) + '" alt="' + esc(img ? img.alt : '') + '" decoding="async"' + (i ? ' loading="lazy"' : '') + '>' +
          (cap ? '<figcaption>' + esc(cap) + '</figcaption>' : '') + '</figure></li>';
      }).join('');
      track.setAttribute('tabindex', '0');
    }
    function rtl() { return getComputedStyle(track).direction === 'rtl'; }
    function index() { return clamp(Math.round(Math.abs(track.scrollLeft) / (track.clientWidth || 1)), 0, links.length - 1); }
    function go(i, now) {
      pending = clamp(i, 0, links.length - 1);
      paint();
      track.scrollTo({ left: (rtl() ? -1 : 1) * pending * track.clientWidth, behavior: now ? 'instant' : undefined });
    }
    function paint() {
      var i = pending >= 0 ? pending : index(), had = document.activeElement;
      count.textContent = (i + 1) + ' / ' + links.length;
      prev.disabled = i === 0;
      next.disabled = i === links.length - 1;
      /* a button that has just turned off hands the focus to the other one */
      if (had === prev && prev.disabled) next.focus();
      if (had === next && next.disabled) prev.focus();
    }
    function settle() {
      var i = index();
      pending = -1;
      paint();
      if (dialog.open && i !== settled && settled >= 0) {
        var cap = links[i].dataset.caption;
        status.textContent = (i + 1) + ' ' + of + ' ' + links.length + (cap ? ': ' + cap : '');
      }
      settled = i;
    }
    track.addEventListener('scroll', function () {
      if (!frame && pending < 0) frame = requestAnimationFrame(function () { frame = 0; paint(); });
      if (!('onscrollend' in window)) { clearTimeout(timer); timer = setTimeout(settle, 120); }
    }, { passive: true });
    track.addEventListener('scrollend', settle);
    prev.addEventListener('click', function () { go((pending >= 0 ? pending : index()) - 1); });
    next.addEventListener('click', function () { go((pending >= 0 ? pending : index()) + 1); });
    dialog.addEventListener('keydown', function (e) {
      if (e.target.closest('input, textarea, select')) return;
      var back = rtl() ? 'ArrowRight' : 'ArrowLeft', on = rtl() ? 'ArrowLeft' : 'ArrowRight', at = pending >= 0 ? pending : index();
      var to = e.key === back ? at - 1 : e.key === on ? at + 1 : e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : -2;
      if (to === -2) return;
      e.preventDefault();
      go(to);
    });
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;  // a new tab or window gets the picture itself
        e.preventDefault();
        make();
        status.textContent = '';
        dialog.showModal();
        settled = i;
        go(i, true);
        pending = -1;
      });
    });
    dialog.addEventListener('close', function () { settled = -1; });
    /* the window changes size: stay on the same picture */
    if (window.ResizeObserver) new ResizeObserver(function () { if (dialog.open && settled >= 0) track.scrollTo({ left: (rtl() ? -1 : 1) * settled * track.clientWidth, behavior: 'instant' }); }).observe(track);
  });

  /* Video player: data-tray="player" on .tray-player holding a <video controls> and a bar of controls: [data-play] (the
     bar's button and the large one), [data-seek] (a range), [data-now] and [data-total], [data-captions], [data-mute] and
     [data-full]. The behaviour takes the browser's controls off and runs the bar; a button whose name changes with the state
     reads its names from data-label-*. A control the video cannot use (captions without a track, full screen where the
     browser has none) is hidden. */
  UI.register('player', function (root) {
    var v = $('video', root);
    if (!v) return;
    var plays = $$('[data-play]', root), seek = $('[data-seek]', root), now = $('[data-now]', root), total = $('[data-total]', root);
    var mute = $('[data-mute]', root), cc = $('[data-captions]', root), full = $('[data-full]', root), of = root.dataset.of || 'of', dragging = false;
    var big = $('.tray-player__big', root), barPlay = plays.filter(function (b) { return b !== big; })[0];
    function time(s) { s = Math.max(0, Math.floor(s || 0)); var h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(r).padStart(2, '0'); }
    function label(b, on, offName, onName, offIcon, onIcon) {
      if (!b) return;
      b.setAttribute('aria-label', on ? (b.dataset[onName] || '') : (b.dataset[offName] || ''));
      var use = $('use', b);
      if (use) use.setAttribute('href', '#tray-i-' + (on ? onIcon : offIcon));
    }
    function state() {
      var playing = !v.paused && !v.ended;
      root.toggleAttribute('data-playing', playing);
      plays.forEach(function (b) {
        b.dataset.labelPlay = b.dataset.labelPlay || b.getAttribute('aria-label') || 'Play';
        b.dataset.labelPause = b.dataset.labelPause || 'Pause';
        label(b, playing, 'labelPlay', 'labelPause', 'play', 'pause');
      });
      if (mute) {
        mute.dataset.labelMute = mute.dataset.labelMute || mute.getAttribute('aria-label') || 'Mute';
        mute.dataset.labelUnmute = mute.dataset.labelUnmute || 'Unmute';
        label(mute, v.muted, 'labelMute', 'labelUnmute', 'volume-2', 'volume-x');
      }
    }
    function clock() {
      var d = isFinite(v.duration) ? v.duration : 0;
      if (now) now.textContent = time(v.currentTime);
      if (total) total.textContent = time(d);
      if (seek && !dragging) {
        seek.max = String(d || 0);
        seek.value = String(v.currentTime);
        seek.style.setProperty('--tray-v', (d ? v.currentTime / d * 100 : 0) + '%');
      }
      if (seek) seek.setAttribute('aria-valuetext', time(v.currentTime) + ' ' + of + ' ' + time(d));
    }
    function toggle() { if (v.paused || v.ended) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }
    v.controls = false;
    root.setAttribute('data-ready', '');
    plays.forEach(function (b) { b.addEventListener('click', toggle); });
    v.addEventListener('click', toggle);
    /* the large button goes once the film starts: focus on it moves to the bar's play button first */
    v.addEventListener('play', function () { rescue(big, barPlay || seek); root.setAttribute('data-started', ''); state(); });
    v.addEventListener('ended', function () { root.removeAttribute('data-started'); state(); });
    ['pause', 'playing', 'volumechange'].forEach(function (n) { v.addEventListener(n, state); });
    ['timeupdate', 'loadedmetadata', 'durationchange', 'seeked'].forEach(function (n) { v.addEventListener(n, clock); });
    if (seek) {
      seek.addEventListener('input', function () {
        dragging = true;
        v.currentTime = +seek.value;
        seek.style.setProperty('--tray-v', (+seek.max ? +seek.value / +seek.max * 100 : 0) + '%');
        clock();
      });
      seek.addEventListener('change', function () { dragging = false; clock(); });
      /* The range's step is fine for dragging, too fine for a key: an arrow moves five seconds (mirrored right to left),
         Page Up and Page Down a tenth of the film. Home and End are the range's own. */
      seek.addEventListener('keydown', function (e) {
        var d = isFinite(v.duration) ? v.duration : 0, rtl = getComputedStyle(seek).direction === 'rtl';
        var by = { ArrowRight: rtl ? -5 : 5, ArrowLeft: rtl ? 5 : -5, ArrowUp: 5, ArrowDown: -5, PageUp: d / 10, PageDown: -d / 10 }[e.key];
        if (!by || !d) return;
        e.preventDefault();
        v.currentTime = clamp(v.currentTime + by, 0, d);
        clock();
      });
    }
    if (mute) mute.addEventListener('click', function () { v.muted = !v.muted; });
    /* captions: one toggle with a constant name, pressed while they show */
    var track = v.textTracks && v.textTracks.length ? v.textTracks[0] : null;
    if (cc && !track) cc.hidden = true;
    if (cc && track) {
      var shown = $('track[default]', v) !== null;
      track.mode = shown ? 'showing' : 'hidden';
      cc.setAttribute('aria-pressed', String(shown));
      cc.addEventListener('click', function () {
        var on = track.mode !== 'showing';
        track.mode = on ? 'showing' : 'hidden';
        cc.setAttribute('aria-pressed', String(on));
      });
    }
    /* full screen: the whole player, bar and all; on a phone that only lets the video itself go full screen, the video */
    if (full) {
      var can = root.requestFullscreen || v.webkitEnterFullscreen;
      if (!can) full.hidden = true;
      full.dataset.labelFull = full.dataset.labelFull || full.getAttribute('aria-label') || 'Full screen';
      full.dataset.labelExit = full.dataset.labelExit || 'Leave full screen';
      full.addEventListener('click', function () {
        if (document.fullscreenElement === root) document.exitFullscreen();
        else if (root.requestFullscreen) root.requestFullscreen().catch(function () {});
        else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
      });
      document.addEventListener('fullscreenchange', function () { label(full, document.fullscreenElement === root, 'labelFull', 'labelExit', 'maximize', 'minimize'); });
    }
    state();
    clock();
  });
