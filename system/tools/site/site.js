/* The site of the design system: every page has an address of its own (/components/lightbox), and comes drawn in a file
   of its own; moving between pages draws the next one here, without loading the site again.
   data.js holds the map of the site and the names of its files; each page comes in a file of its own, loaded when it is
   opened from another page. A block is shown in a frame of its own, so it lays out at the width
   chosen, not at the width of this page. A chart is a React example: charts.js draws it, and arrives when the first one
   comes near the window. */
(function () {
  'use strict';
  var S = window.TRAY_SITE, UI = window.TrayUI;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  var site = $('#site'), view = $('#site-view'), sheet = $('#site-sheet'), themeList = $('#site-theme-list');
  var navs = [$('#site-nav'), $('#site-nav-sheet')], switches = [$('#site-sections'), $('#site-sections-sheet')];
  var full = $('#site-full'), fullStage = $('#site-full-stage'), fullTitle = $('#site-full-title');
  var search = $('#site-search'), command = $('#site-command'), commandList = $('#site-command-list');
  var section, shown = null;

  /* ---------- Addresses ----------
     On the web a page is at its address, /components/lightbox, and the host serves the file it is drawn in. Inside another
     page (a viewer that frames the site and passes nothing but a #name to it) and from the file system there is
     one file, index.html, and a page is at its hash, #c-lightbox, as it always was. The build writes every link from the
     root (/components/lightbox, /assets/…); with hashes, links become #c-lightbox and files are linked from where the page
     stands. */
  var framed = true;
  try { framed = window.self !== window.top; } catch (e) { /* a frame of another origin */ }
  var PATHS = /^https?:$/.test(location.protocol) && !framed;
  var ROOT = PATHS ? '/' : '';
  var byPath = {};
  Object.keys(S.index).forEach(function (id) { byPath[S.index[id].path] = id; });
  /* href(id): what a link to the page says. urlOf(id): the whole address, to keep or to send. */
  function href(id) { return PATHS ? '/' + S.index[id].path : '#' + id; }
  function urlOf(id) { return PATHS ? location.origin + '/' + S.index[id].path : location.href.split('#')[0] + '#' + id; }
  /* idOf(path): the page at an address from the root (/components/lightbox, /docs.html, /), or null: a file, a part of a page. */
  function idOf(path) {
    if (!path || path.charAt(0) !== '/' || path.charAt(1) === '/') return null;
    var p = path.slice(1).split(/[?#]/)[0].replace(/(^|\/)index(\.html)?$/, '').replace(/\.html$/, '').replace(/\/$/, '');
    try { p = decodeURIComponent(p); } catch (e) { return null; }
    return has(byPath, p) ? byPath[p] : null;
  }
  /* The page shown is named by the address, or by the hash; anything else shows the home page. */
  function current() {
    if (PATHS) { var id = idOf(location.pathname); return id === null ? 'home' : id; }
    var h = location.hash.slice(1).split('?')[0];
    return has(S.index, h) ? h : 'home';
  }
  /* What follows the page in its address, for the page itself (the Themes page reads a shared theme from it). */
  function query() {
    if (PATHS) return location.search.slice(1);
    var h = location.hash, at = h.indexOf('?');
    return at < 0 ? '' : h.slice(at + 1);
  }
  /* A link of the old kind names its page after a # (/#c-button, #d-themes?theme=…): it becomes the page's address. */
  function fromHash() {
    var h = location.hash.slice(1), at = h.indexOf('?'), id = at < 0 ? h : h.slice(0, at);
    if (!PATHS || !has(S.index, id)) return false;
    try { history.replaceState(null, '', href(id) + (at < 0 ? '' : '?' + h.slice(at + 1))); } catch (e) { location.replace(href(id)); }
    return true;
  }
  /* With hashes, links to pages say #id, and the site's files are linked from where this page stands. */
  function local(root) {
    if (PATHS) return;
    $$('[href], [src], [poster]', root).forEach(function (n) {
      ['href', 'src', 'poster'].forEach(function (k) {
        var v = n.getAttribute(k), id;
        if (!v || v.charAt(0) !== '/' || v.charAt(1) === '/') return;
        id = k === 'href' && n.tagName === 'A' ? idOf(v) : null;
        n.setAttribute(k, id === null ? v.slice(1) : '#' + id);
      });
    });
  }
  /* put(el, html): a page into the view; with hashes its links and files are made local before anything loads. */
  function put(el, html) {
    if (PATHS) { el.innerHTML = html; return; }
    var t = document.createElement('template');
    t.innerHTML = html;
    local(t.content);
    el.textContent = '';
    el.appendChild(t.content);
  }
  /* go(id): open a page. Its address joins the history; the place on the page left is kept, for the way back. */
  function go(id, more) {
    if (!has(S.index, id)) return;
    if (!PATHS) { location.hash = id + (more ? '?' + more : ''); return; }
    var to = href(id) + (more ? '?' + more : '');
    if (to === location.pathname + location.search && !location.hash) return;
    try {
      history.replaceState({ y: window.scrollY }, '');
      history.pushState({ y: 0 }, '', to);
    } catch (e) { location.assign(to); return; }
    render();
  }
  local(document);

  /* ---------- The pages: each arrives alone, in a file of its own, when it is opened from another page or its frame is
     shown. A page drawn in the file the visit started with needs its own file only when it has more to do than to be
     read (a preview's script, a playground, the source of a block): S.index[id].bare says it has not. ---------- */
  var loaded = { core: true }, loading = {};
  S.add = function (name, chunk, run) {
    Object.keys(chunk.pages).forEach(function (id) { S.pages[id] = chunk.pages[id]; });
    Object.keys(run || {}).forEach(function (id) { S.run[id] = run[id]; });
    loaded[name] = true;
  };
  /* Code the page writes itself (a playground, a theme, the source of a block) shows at once as plain text, and is coloured
     by code.js (highlight.js, HTML and CSS only). That file is loaded when such code first comes near the window, so a page
     whose code sits below the fold, or in a closed tab, opens without it. The build has already coloured every other code block. */
  var codeLib = null, codeWatch = null;
  function colour(el) {
    if (!codeLib) codeLib = script(S.files['code.js']);
    codeLib.then(function () {
      var w = el.trayCode;
      if (w && el.textContent === w[0]) el.innerHTML = window.TrayCode.html(w[0], w[1]);
    }, function () { codeLib = null; });
  }
  S.paint = function (el, text, lang) {
    el.textContent = text;
    if (window.TrayCode) { el.innerHTML = window.TrayCode.html(text, lang); return; }
    el.trayCode = [text, lang];
    if (!window.IntersectionObserver) { colour(el); return; }
    if (!codeWatch) codeWatch = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { codeWatch.unobserve(e.target); colour(e.target); } });
    }, { rootMargin: '200px 0px' });
    codeWatch.observe(el);
  };
  /* need(id): the file of that page, which data.js names (its name holds a hash of what is in it). */
  function need(id) {
    var name = S.index[id].chunk;
    if (loaded[name]) return Promise.resolve();
    if (!loading[name]) {
      loading[name] = new Promise(function (ok, fail) {
        var s = document.createElement('script');
        s.src = ROOT + S.index[id].file;
        s.onload = function () { ok(); };
        s.onerror = function () { delete loading[name]; fail(new Error('The ' + name + ' pages did not load.')); };
        document.head.appendChild(s);
      });
    }
    return loading[name];
  }

  /* ---------- The sidebar: every page of the section, group by group ---------- */
  function navHtml(sec) {
    var h = '';
    sec.nav.forEach(function (g) {
      h += '<div class="tray-sidebar__group">' + (g.group ? '<p class="tray-sidebar__label">' + esc(g.group) + '</p>' : '');
      g.items.forEach(function (it) { h += '<a class="tray-sidebar__item" href="' + href(it.id) + '"><span>' + esc(it.title) + '</span></a>'; });
      h += '</div>';
    });
    return h;
  }

  /* The section a page belongs to decides which sidebar is shown and which link in the header is current. The home page has
     neither, and a section marked side: false (the Articles) has no sidebar. A page that came drawn in its file came with
     them: they are kept. */
  function showSection(sec) {
    if (sec === section) return;
    section = sec;
    var key = sec ? sec.id : '', side = !!sec && sec.side !== false;
    navs.forEach(function (nav) {
      if (nav.getAttribute('data-section') === key) return;
      nav.innerHTML = side ? navHtml(sec) : '';
      nav.setAttribute('data-section', key);
    });
    if (sec && !side) document.documentElement.setAttribute('data-noside', ''); else document.documentElement.removeAttribute('data-noside');
    switches.forEach(function (n) {
      if (n.getAttribute('data-section') === key) return;
      n.innerHTML = S.sections.map(function (s) { return '<a class="tray-tab" href="' + href(s.home) + '"' + (s === sec ? ' aria-current="page"' : '') + '>' + esc(s.title) + '</a>'; }).join('');
      n.setAttribute('data-section', key);
    });
    if (sec) document.documentElement.removeAttribute('data-home'); else document.documentElement.setAttribute('data-home', '');
  }

  /* ---------- Search: every page of the site in one list ---------- */
  (function () {
    var h = '';
    S.sections.forEach(function (sec) {
      h += '<div data-group><div class="tray-list__label">' + esc(sec.title) + '</div>';
      sec.nav.forEach(function (g) {
        g.items.forEach(function (it) {
          h += '<button type="button" class="tray-option" role="option" data-value="' + it.id + '"><span class="tray-option__text">' + esc(it.title) + '</span>' +
            (g.group ? '<span class="tray-option__meta">' + esc(g.group) + '</span>' : '') + '</button>';
        });
      });
      h += '</div>';
    });
    commandList.insertAdjacentHTML('afterbegin', h);
  })();
  function openSearch() {
    if (search.open) return;
    if (sheet.open) sheet.close();
    var input = $('input', command);
    search.showModal();
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  }
  command.addEventListener('tray:select', function (e) {
    search.close();
    go(e.detail.value);
  });
  $('#site-find').addEventListener('click', openSearch);

  /* ---------- Frames: a block or a template, live, in a document of its own ---------- */
  var SIZES = { desktop: [1280, 800], tablet: [768, 900], phone: [390, 780] };
  var frames = [], lazy = null;
  /* Inside a frame nothing leaves the page: forms do not post, links do not go anywhere; a link to a part of the page scrolls to it. */
  var GUARD = '<script>document.addEventListener("submit",function(e){e.preventDefault();});document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;e.preventDefault();var h=a.getAttribute("href");if(h.length>1&&h.charAt(0)==="#"){var t=document.getElementById(h.slice(1));if(t)t.scrollIntoView();}});<\/script>';
  function asset(path) { return new URL(ROOT + path, location.href).href; }

  /* ---------- Themes: the ones of the system, and one a visitor may have made here ---------- */
  var THEMES = S.themes.list;
  /* The visitor's own theme lives in this browser: { id, name, css, ... }, the css being one rule for [data-theme="id"]. */
  function ownTheme() {
    try {
      var own = JSON.parse(localStorage.getItem('tray-site-own-theme') || 'null');
      return own && typeof own.css === 'string' && /^[a-z0-9-]+$/.test(own.id || '') ? own : null;
    } catch (e) { return null; }
  }
  function known(id) {
    var own = ownTheme();
    return THEMES.some(function (t) { return t.id === id; }) || !!(own && own.id === id);
  }
  function pageTheme() {
    var id = document.documentElement.getAttribute('data-theme');
    return known(id) ? id : 'light';
  }

  function frameDoc(id, themeName) {
    var m = /<body([^>]*)>([\s\S]*)<\/body>/.exec(S.pages[id].source) || ['', '', ''];
    return '<!doctype html><html lang="en" data-theme="' + (themeName || pageTheme()) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + esc(S.index[id].title) + '</title><link rel="stylesheet" href="' + asset(S.files['tokens.css']) + '"><link rel="stylesheet" href="' + asset(S.files['components/bundle.css']) + '">' +
      (ownTheme() ? '<style>' + ownTheme().css.replace(/<\//g, '<\\/') + '</style>' : '') + '</head><body' + m[1] + '>' +
      m[2].replace('../components/bundle.js', asset(S.files['components/bundle.js'])) + GUARD + '</body></html>';
  }

  /* The frame is laid out at the width of the device it stands for and scaled down when the page has less room than that. */
  function layout(fr) {
    var cs = getComputedStyle(fr.host);
    var room = fr.host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (room <= 0) return;
    var w = SIZES[fr.size][0], h = SIZES[fr.size][1];
    if (fr.size === 'desktop' && !fr.thumb) w = fr.fill ? room : Math.max(w, room);
    var k = Math.min(1, room / w);
    if (fr.fill) h = Math.max(320, fr.host.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / k;
    fr.iframe.style.width = w + 'px';
    fr.iframe.style.height = Math.round(h) + 'px';
    fr.iframe.style.transform = k < 1 ? 'scale(' + k + ')' : '';
    fr.box.style.width = Math.floor(w * k) + 'px';
    fr.box.style.height = Math.floor(h * k) + 'px';
  }

  /* mount(host, id, opts): the frame appears once the pages of its section have arrived. */
  function mount(host, id, opts) {
    var box = document.createElement('div'), f = document.createElement('iframe');
    box.className = 'site-frame__box';
    f.title = 'Preview: ' + S.index[id].title;
    if (opts.thumb) { f.setAttribute('inert', ''); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; }
    box.appendChild(f);
    host.textContent = '';
    host.appendChild(box);
    var fr = { host: host, box: box, iframe: f, id: id, size: opts.size || 'desktop', thumb: !!opts.thumb, fill: !!opts.fill, page: !opts.fill, theme: opts.theme || null };
    frames.push(fr);
    layout(fr);
    if (window.ResizeObserver) { fr.watch = new ResizeObserver(function () { layout(fr); }); fr.watch.observe(host); }
    show(fr, id);
    return fr;
  }
  function show(fr, id) {
    fr.id = id;
    fr.iframe.title = 'Preview: ' + S.index[id].title;
    need(id).then(function () { if (fr.id === id && frames.indexOf(fr) >= 0) fr.iframe.srcdoc = frameDoc(id, fr.theme); }, function () { /* the page says what is missing */ });
  }
  function unmount(test) {
    frames = frames.filter(function (fr) {
      if (!test(fr)) return true;
      if (fr.watch) fr.watch.disconnect();
      return false;
    });
  }

  /* The full-size view: the same frame over the whole window. */
  var fullFrame = null;
  function openFull(id, size) {
    fullTitle.textContent = S.index[id].title;
    $$('input', full).forEach(function (i) { i.checked = i.value === size; });
    full.showModal();
    $$('.tray-seg', full).forEach(function (s) { s.dispatchEvent(new Event('change')); });  /* its pill follows the size set */
    fullFrame = mount(fullStage, id, { size: size, fill: true });
  }
  full.addEventListener('close', function () {
    unmount(function (fr) { return fr === fullFrame; });
    fullFrame = null;
    fullStage.textContent = '';
  });
  $$('input', full).forEach(function (i) {
    i.addEventListener('change', function () { if (fullFrame) { fullFrame.size = i.value; layout(fullFrame); } });
  });

  function wireFrames() {
    unmount(function (fr) { return fr.page; });
    if (lazy) lazy.disconnect();
    var thumbs = $$('[data-thumb]', view);
    if (thumbs.length) {
      if (window.IntersectionObserver) {
        lazy = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            lazy.unobserve(e.target);
            mount(e.target, e.target.getAttribute('data-thumb'), { thumb: true });
          });
        }, { rootMargin: '400px 0px' });
        thumbs.forEach(function (t) { lazy.observe(t); });
      } else thumbs.forEach(function (t) { mount(t, t.getAttribute('data-thumb'), { thumb: true }); });
    }
    /* the home page: one frame, and a control that chooses which page it shows */
    $$('[data-show]', view).forEach(function (box) {
      var host = $('[data-frame]', box), fr = mount(host, host.getAttribute('data-frame'), { size: 'desktop' });
      $$('input[type="radio"]', box).forEach(function (i) { i.addEventListener('change', function () { if (i.checked) show(fr, i.value); }); });
    });
    /* the page of a block or a template */
    var v = $('[data-viewer]', view);
    if (!v) return;
    var id = v.getAttribute('data-viewer'), size = window.innerWidth < 640 ? 'phone' : 'desktop';
    var src = $('#site-src-code', v);
    if (!src.textContent.trim()) S.paint(src, S.pages[id].source, 'html');  /* the build writes it in the page, coloured */
    var fr = mount($('[data-frame]', v), id, { size: size });
    $$('.site-viewer__sizes input', v).forEach(function (i) {
      i.checked = i.value === size;
      i.addEventListener('change', function () { fr.size = i.value; layout(fr); });
    });
    $$('.site-viewer__sizes .tray-seg, .site-viewer__sizes.tray-seg', v).forEach(function (s) { s.dispatchEvent(new Event('change')); });
    $('[data-full]', v).addEventListener('click', function () { openFull(id, fr.size); });
  }

  /* ---------- Charts: the examples of the React package, drawn by a script of their own ----------
     An example's place is marked data-rechart: data-chart belongs to the plain-HTML chart, which keeps its figures there. */
  var chartsLib = null, chartWatch = null;
  function needCharts() {
    if (!chartsLib) {
      chartsLib = new Promise(function (ok, fail) {
        var s = document.createElement('script');
        s.src = ROOT + S.files['charts.js'];
        s.onload = function () { if (window.TrayCharts) ok(window.TrayCharts); else { chartsLib = null; fail(new Error('The charts did not start.')); } };
        s.onerror = function () { chartsLib = null; fail(new Error('The charts did not load.')); };
        document.head.appendChild(s);
      });
    }
    return chartsLib;
  }
  function drawChart(host) {
    var id = host.getAttribute('data-rechart');
    host.setAttribute('aria-busy', 'true');
    needCharts().then(function (lib) {
      if (!host.isConnected) return;
      host.removeAttribute('aria-busy');
      lib.mount(id, host);
    }, function () {
      if (!host.isConnected) return;
      host.removeAttribute('aria-busy');
      host.innerHTML = '<div class="tray-alert tray-alert--danger" role="alert"><span class="tray-alert__icon">' + UI.icon('circle-alert') + '</span><div class="tray-alert__body">' +
        '<p class="tray-alert__title">This chart did not load</p><p class="tray-alert__text">Check the connection and <a href="' + href(current()) + '" data-retry>try again</a>.</p></div></div>';
    });
  }
  /* Before the page changes: React lets go of what it drew. */
  function clearCharts() {
    if (chartWatch) { chartWatch.disconnect(); chartWatch = null; }
    if (window.TrayCharts) window.TrayCharts.clear();
  }
  function wireCharts() {
    var hosts = $$('[data-rechart]', view);
    if (!hosts.length) return;
    if (!window.IntersectionObserver) { hosts.forEach(drawChart); return; }
    chartWatch = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        chartWatch.unobserve(e.target);
        drawChart(e.target);
      });
    }, { rootMargin: '600px 0px' });
    hosts.forEach(function (h) { chartWatch.observe(h); });
  }

  /* ---------- What a page of the docs may hold: the icons, each a button that copies its markup ---------- */
  function wirePage() {
    var icons = $('[data-icons]', view);
    if (!icons) return;
    var input = $('[data-icon-filter]', view), empty = $('[data-icon-empty]', view);
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase(), any = false;
      $$('[data-icon]', icons).forEach(function (b) { var on = !q || b.getAttribute('data-icon').indexOf(q) >= 0; b.hidden = !on; if (on) any = true; });
      empty.hidden = any;
    });
    icons.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-icon]') : null;
      if (!b) return;
      var name = b.getAttribute('data-icon'), text = '<svg class="tray-icon" aria-hidden="true"><use href="#tray-i-' + name + '"/></svg>';
      function said() { UI.toast({ tone: 'success', title: 'Copied the markup of "' + name + '"', duration: 2500 }); }
      function failed() { UI.toast({ title: 'Copy it by hand', text: text }); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(said, failed); else failed();
    });
  }

  /* ---------- What the document says about the page shown: its title, description, address and picture ---------- */
  function describe(id) {
    var m = S.index[id], url = S.site ? S.site + '/' + m.path : '';
    document.title = m.head;
    function set(sel, attr, value) { var n = $(sel); if (n && value) n.setAttribute(attr, value); }
    set('meta[name="description"]', 'content', m.desc);
    set('meta[property="og:description"]', 'content', m.desc);
    set('meta[property="og:title"]', 'content', id === 'home' ? 'Tray UI' : m.title);
    set('meta[property="og:url"]', 'content', url);
    set('link[rel="canonical"]', 'href', url);
    if (m.og && S.site) { set('meta[property="og:image"]', 'content', S.site + '/' + m.og); set('meta[property="og:image:alt"]', 'content', 'Tray UI: ' + m.title); }
    var md = $('link[rel="alternate"][type="text/markdown"]');
    if (md && id !== 'home') md.setAttribute('href', ROOT + m.path + '.md');
  }

  /* ---------- One view for the page the address names ---------- */
  /* paint(id, y, first): the page drawn and wired. y is where to scroll to: the place it was left, on the way back; else the
     top. The first page of a visit stays where the browser put it. */
  function paint(id, y, first) {
    var p = S.pages[id];
    clearCharts();
    /* a page that came drawn in its file is kept as it is, and only wired */
    if (view.getAttribute('data-prerendered') !== id) put(view, p.html);
    view.removeAttribute('data-prerendered');
    if (S.index[id].wide) view.setAttribute('data-wide', ''); else view.removeAttribute('data-wide');
    UI.init(view);
    wireFrames();
    wireCharts();
    wireThemes();
    wirePage();
    wirePlay(id);
    if (S.run[id]) { try { S.run[id](); } catch (e) { if (window.console) window.console.error(e); } }
    if (!first) {
      var h = $('h1', view);
      if (h) h.focus({ preventScroll: true });
      window.scrollTo(0, typeof y === 'number' ? y : 0);
    }
    view.setAttribute('data-page', id);
    view.removeAttribute('aria-busy');
  }

  function render(y) {
    var id = current(), meta = S.index[id], first = shown === null;
    shown = id;
    var sec = S.sections.filter(function (s) { return s.id === meta.section; })[0] || null;
    if (full.open) full.close();
    if (search.open) search.close();
    showSection(sec);
    describe(id);
    navs.forEach(function (nav) {
      $$('.tray-sidebar__item', nav).forEach(function (a) {
        if (a.getAttribute('href') === href(id)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
    });
    var here = $('.tray-sidebar__item[aria-current]', navs[0]);
    if (here && navs[0].offsetParent !== null) {
      var box = navs[0].getBoundingClientRect(), item = here.getBoundingClientRect();
      if (item.top < box.top + 8 || item.bottom > box.bottom - 8) navs[0].scrollTop += item.top - box.top - box.height / 2;
    }
    if (sheet.open) sheet.close();
    if (loaded[meta.chunk] || (meta.bare && view.getAttribute('data-prerendered') === id)) { paint(id, y, first); return; }
    if (view.getAttribute('data-prerendered') === id) {
      /* the page came drawn in its file: it stays as it is, readable, while the script that wires it arrives */
      if (typeof y === 'number') window.scrollTo(0, y);
      need(id).then(function () { if (current() === id) paint(id, null, true); }, function () { /* it stays readable; its examples wait for a reload */ });
      return;
    }
    /* the page is on its way: say so, in the place it will take */
    clearCharts();
    view.removeAttribute('data-prerendered');
    view.setAttribute('aria-busy', 'true');
    view.innerHTML = '<div class="tray-pagehead"><div class="tray-pagehead__row"><div class="tray-pagehead__text"><h1 class="title" tabindex="-1">' + esc(meta.title) + '</h1><p>' + esc(meta.desc || '') + '</p></div></div></div>' +
      '<div class="tray-skeleton site-wait" role="status" aria-label="Loading the page"></div>';
    need(id).then(function () { if (current() === id) paint(id, y, first); }, function () {
      if (current() !== id) return;
      /* a new version of the site came out while this one was open, and the file of the page has another name now:
         the page itself, loaded afresh, knows it */
      if (PATHS && navigator.onLine !== false && !first) { location.assign(href(id)); return; }
      view.removeAttribute('aria-busy');
      $('.site-wait', view).outerHTML = '<div class="tray-alert tray-alert--danger" role="alert"><span class="tray-alert__icon">' + UI.icon('circle-alert') + '</span><div class="tray-alert__body">' +
        '<p class="tray-alert__title">This page did not load</p><p class="tray-alert__text">Check the connection and <a href="' + href(id) + '" data-retry>try again</a>.</p></div></div>';
    });
  }

  /* Links and forms inside an example lead nowhere: only links between pages, files of the site and real outside links are followed. */
  view.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var raw = a.getAttribute('href');
    if (a.hasAttribute('data-retry')) { e.preventDefault(); render(); return; }
    if (PATHS ? idOf(raw) !== null : raw.charAt(0) === '#' && has(S.index, raw.slice(1))) return;  /* another page: the address changes */
    if (/^(https?:\/\/|mailto:)/.test(raw)) return;
    /* the contents of an article: a heading on this page. With addresses the browser goes there and the address keeps it;
       with hashes the hash names the page, so the heading is scrolled to instead. */
    var to = raw.charAt(0) === '#' && a.closest('[data-anchors]') ? document.getElementById(raw.slice(1)) : null;
    if (to && view.contains(to)) {
      if (!PATHS) { e.preventDefault(); to.scrollIntoView(); }
      return;
    }
    if (/\.(zip|txt|md|css|js|cjs|json|xml)$/.test(raw) && a.closest('.site-prose, .tray-footer, .site-foot, .tray-cta')) {
      /* a file of the site: a download cannot start inside another page's frame, so say where it works */
      if (framed) { e.preventDefault(); UI.toast({ title: 'This file opens on the published site', text: 'This preview runs inside another page, which cannot open or download a file.' }); }
      return;
    }
    e.preventDefault();
  });
  view.addEventListener('submit', function (e) { e.preventDefault(); });

  /* A link to another page of the site opens it here, its address joining the history. A click that asks for a new tab or
     window, or a download, is left to the browser, which opens the page's own file. */
  if (PATHS) document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var u = new URL(a.href), id = u.origin === location.origin ? idOf(u.pathname) : null;
    if (id === null || (u.hash && u.pathname === location.pathname)) return;  /* a place on this page: the browser goes there */
    e.preventDefault();
    go(id, u.search.slice(1));
  });

  /* ---------- Theme: this page, every frame on it, and the menu that chooses ---------- */
  function paintThemeMenu() {
    var own = ownTheme(), here = pageTheme(), slot = $('[data-custom-theme]', themeList);
    slot.innerHTML = own ? '<div class="tray-list__label">Yours</div><button type="button" class="tray-option" role="menuitemradio" tabindex="-1" data-group="theme" data-value="' + own.id + '">' +
      '<span class="site-dot" data-theme="' + own.id + '" aria-hidden="true"></span><span class="tray-option__text">' + esc(own.name || own.id) + '</span>' + UI.icon('check', 'tray-option__check') + '</button>' : '';
    $$('[role="menuitemradio"]', themeList).forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-value') === here)); });
  }
  /* The icon of the tab is the mark of the system, in the accent of the theme the site wears. */
  function paintIcon() {
    var link = $('link[rel="icon"]'), cs = getComputedStyle(document.documentElement);
    var tile = cs.getPropertyValue('--accent').trim(), bar = cs.getPropertyValue('--on-accent').trim();
    if (!link || !/^#[0-9a-f]{3,8}$/i.test(tile) || !/^#[0-9a-f]{3,8}$/i.test(bar)) return;
    link.href = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="10" fill="' + tile +
      '"/><rect x="8" y="14" width="16" height="10" rx="4" fill="' + bar + '"/></svg>');
  }
  /* setTheme(id): the whole site in that theme, remembered for the next visit. */
  function setTheme(id) {
    if (!known(id)) id = 'light';
    document.documentElement.setAttribute('data-theme', id);
    try { localStorage.setItem('tray-site-theme', id); } catch (e) { /* the choice lasts for this visit only */ }
    paintThemeMenu();
    paintIcon();
    frames.forEach(function (fr) { if (!fr.theme && S.pages[fr.id]) fr.iframe.srcdoc = frameDoc(fr.id); });
    document.dispatchEvent(new CustomEvent('site:theme', { detail: { id: id } }));
  }
  /* setOwnTheme(own): keep a theme the visitor made, or forget it with null. It becomes one more choice in the menu. */
  function setOwnTheme(own) {
    var style = $('#site-own-theme'), was = ownTheme();
    try {
      if (own) localStorage.setItem('tray-site-own-theme', JSON.stringify(own)); else localStorage.removeItem('tray-site-own-theme');
    } catch (e) { /* it lasts for this visit only */ }
    style.textContent = own ? own.css : '';  /* the element stands after the stylesheets, so its rule wins over the themes of the system */
    if (was && (!own || own.id !== was.id) && document.documentElement.getAttribute('data-theme') === was.id) setTheme(own ? own.id : 'light');
    else { paintThemeMenu(); paintIcon(); frames.forEach(function (fr) { if (!fr.theme && S.pages[fr.id]) fr.iframe.srcdoc = frameDoc(fr.id); }); }
  }
  /* A theme in the menu is a radio: choosing one changes the site and leaves the menu open, to try the next. */
  themeList.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[role="menuitemradio"]') : null;
    if (b) setTheme(b.getAttribute('data-value'));
  });
  if (!known(document.documentElement.getAttribute('data-theme'))) setTheme('light'); else { paintThemeMenu(); paintIcon(); }
  S.theme = { list: THEMES, current: pageTheme, set: setTheme, own: ownTheme, setOwn: setOwnTheme };

  /* ---------- The Themes page: its script arrives with the page ---------- */
  var themesLib = null;
  function script(src) {
    return new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = ROOT + src; s.onload = function () { ok(); }; s.onerror = function () { fail(new Error(src + ' did not load.')); };
      document.head.appendChild(s);
    });
  }
  function wireThemes() {
    var host = $('[data-themes]', view);
    if (!host) return;
    if (!themesLib) themesLib = script(S.files['theme.js']).then(function () { return script(S.files['themes.js']); });
    themesLib.then(function () { if (host.isConnected) window.TrayThemesPage.mount(host, S, UI); }, function () {
      themesLib = null;
      if (host.isConnected) host.insertAdjacentHTML('afterbegin', '<div class="tray-alert tray-alert--danger" role="alert"><span class="tray-alert__icon">' + UI.icon('circle-alert') + '</span><div class="tray-alert__body">' +
        '<p class="tray-alert__title">The theme maker did not load</p><p class="tray-alert__text">Check the connection and <a href="' + href(current()) + '" data-retry>try again</a>.</p></div></div>');
    });
  }

  /* ---------- The playground of a component: its script arrives with the first page that has one ---------- */
  var playLib = null;
  function wirePlay(id) {
    var host = $('[data-play]', view), spec = S.pages[id] && S.pages[id].play;
    if (!host || !spec) return;
    if (!playLib) playLib = script(S.files['playground.js']);
    playLib.then(function () { if (host.isConnected) window.TrayPlay.mount(host, spec, UI); }, function () {
      playLib = null;
      if (host.isConnected) $('[data-play-stage]', host).innerHTML = '<div class="tray-alert tray-alert--danger" role="alert"><span class="tray-alert__icon">' + UI.icon('circle-alert') + '</span><div class="tray-alert__body">' +
        '<p class="tray-alert__title">The playground did not load</p><p class="tray-alert__text">Check the connection and <a href="' + href(current()) + '" data-retry>try again</a>.</p></div></div>';
    });
  }

  /* ---------- Keyboard: "/" and Ctrl or Command with K open the search ---------- */
  document.addEventListener('keydown', function (e) {
    var k = e.key === 'k' && (e.metaKey || e.ctrlKey) && !e.altKey;
    var slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !(e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]'));
    if ((!k && !slash) || full.open) return;
    e.preventDefault();
    openSearch();
  });
  $('#site-skip').addEventListener('click', function () { view.focus(); });

  /* For tests, and for the pages that make links (the Themes page). */
  S.go = go; S.here = current; S.href = href; S.urlOf = urlOf; S.query = query; S.paths = PATHS;

  if (PATHS) {
    /* Back and forward: the page of that step, at the place it was left. A step within one page (a #part of it) stays put. */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.addEventListener('popstate', function (e) {
      if (current() === shown) return;
      render(e.state && typeof e.state.y === 'number' ? e.state.y : 0);
    });
    window.addEventListener('hashchange', function () { if (fromHash()) render(); });
    /* the place on the page, for a reload */
    window.addEventListener('pagehide', function () { try { history.replaceState({ y: window.scrollY }, ''); } catch (e) { /* the place is lost */ } });
    fromHash();
    render(history.state && typeof history.state.y === 'number' && history.state.y > 0 ? history.state.y : undefined);
  } else {
    window.addEventListener('hashchange', function () { render(); });
    render();
  }
})();
