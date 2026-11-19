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

  var view = $('#site-view'), sheet = $('#site-sheet'), themeList = $('#site-theme-list');
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
    /* The strip of sections keeps its links and only moves its mark, as any strip of tabs does: its pill slides while the
       words of the two links change colour with it. Written anew, the links would take their new colour at once, and both
       words would vanish against the pill on its way. */
    switches.forEach(function (n) {
      if (n.getAttribute('data-section') === key) return;
      var tabs = S.sections.filter(function (s) { return s.tab !== false; }), links = S.links || [];
      if ($$('.tray-tab', n).length !== tabs.length + links.length) n.innerHTML = tabs.map(function (s) { return '<a class="tray-tab" href="' + href(s.home) + '">' + esc(s.title) + '</a>'; }).join('')
        + links.map(function (l) { return '<a class="tray-tab" href="' + esc(l.href) + '">' + esc(l.title) + '</a>'; }).join('');
      tabs.forEach(function (s, i) {
        var a = $$('.tray-tab', n)[i];
        if (s === sec) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
      n.setAttribute('data-section', key);
    });
    if (sec) document.documentElement.removeAttribute('data-home'); else document.documentElement.setAttribute('data-home', '');
  }

  /* ---------- Search: every page of the site in one list, but the later pages of a list (unlisted), which would only repeat it ---------- */
  (function () {
    var h = '';
    S.sections.forEach(function (sec) {
      h += '<div data-group><div class="tray-list__label">' + esc(sec.title) + '</div>';
      sec.nav.forEach(function (g) {
        g.items.forEach(function (it) {
          if (it.unlisted) return;
          h += '<button type="button" class="tray-option" role="option" data-value="' + it.id + '"><span class="tray-option__text">' + esc(it.title) + '</span>' +
            (g.group || sec.tab === false ? '<span class="tray-option__meta">' + esc(sec.tab === false ? sec.title : g.group) + '</span>' : '') + '</button>';
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
    /* the frame is a grey shape until the page in it has loaded with its styles, so no bare page flashes there */
    box.setAttribute('data-loading', '');
    function ready() { box.removeAttribute('data-loading'); }
    f.addEventListener('load', function () { try { if (f.contentWindow.location.href === 'about:srcdoc') ready(); } catch (e) { ready(); } });
    setTimeout(ready, 6000);
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
    if (src && !src.textContent.trim()) S.paint(src, S.pages[id].source, 'html');  /* the build writes it in the page, coloured; a template has none */
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

  /* ---------- The skeleton of a page on its way ----------
     S.index[id].sk, written by the build (skeleton_of() in tools/site.py), says what the page holds: its kind, then what its
     first screens hold. The skeleton is laid out with the page's own classes and takes its own title and summary, so the
     page takes the place the skeleton held when it comes. Words stand in as grey bars, line by line: under each bar is filler
     of the same length, hidden, so its lines break about where the page's will. Controls stand in as grey pills of their own
     size (S.parts: the bars of the page, copied by the build). Nothing in it can be reached but the title. */
  var FILL = 'tray page card with each form list that row one from into its when line and stays for the all of'.split(' ');
  function filler(n) {
    var out = '', i = 0;
    n = Math.round(n * 1.12);  /* these words are narrower than most: so many more letters take the width of the page's */
    while (out.length < n) { out += (out ? ' ' : '') + FILL[i]; i = (i + 7) % FILL.length; }
    return out.slice(0, n).trim();
  }
  function times(n, f) { var h = ''; for (var i = 0; i < n; i++) h += f(i); return h; }
  function bar(n) { return '<span class="site-sk-ink">' + (n > 0 ? filler(n) : '&nbsp;') + '</span>'; }
  function ink(n, tag, cls) { return '<' + tag + (cls ? ' class="' + cls + '"' : '') + '>' + bar(n) + '</' + tag + '>'; }
  function fold(words) { return '<details class="tray-collapsible"><summary>' + bar(words) + '<span class="tray-tile site-sk-pill"></span></summary></details>'; }
  function codeBox(lines) {
    return '<div class="tray-code"><div class="tray-code__head">' + bar(4) + '<span class="tray-btn tray-btn--ghost tray-btn--xs site-sk-pill">' + UI.icon('copy', 'tray-icon--sm') + '<span>Copy</span></span></div>' +
      '<pre><code>' + new Array(Math.min(lines, 24)).join('\n') + ' </code></pre></div>';
  }
  /* A column of words: h a heading, i a smaller one, p a paragraph, l a list, c code, t a table, d a fold, m the list of themes. */
  function words(outline) {
    return (outline || '').split(' ').filter(Boolean).map(function (t) {
      var a = t.slice(1).split(':').map(Number);
      switch (t.charAt(0)) {
        case 'h': return ink(a[0], 'h2', 'subtitle');
        case 'i': return ink(a[0], 'h3', 'site-h3');
        case 'p': return ink(a[0], 'p');
        case 'l': return '<ul class="tray-list-plain">' + times(Math.min(a[0], 8), function () { return ink(a[1], 'li'); }) + '</ul>';
        case 'c': return codeBox(a[0]);
        case 't': return '<div class="tray-table-wrap"><table class="tray-table"><thead><tr>' + times(a[1], function () { return ink(8, 'th'); }) + '</tr></thead><tbody>' +
          times(Math.min(a[0] - 1, 16), function () { return '<tr>' + times(a[1], function (j) { return ink(j ? a[2] || 30 : Math.min(a[2] || 12, 16), 'td'); }) + '</tr>'; }) + '</tbody></table></div>';
        case 'd': return fold(14);
        case 'm': return '<div class="site-themelist">' + times(a[0], function () { return S.parts.theme || ''; }) + '</div>';
      }
      return '';
    }).join('');
  }
  function prose(outline, tag) { return outline ? '<' + (tag || 'article') + ' class="site-prose site-sk" inert>' + words(outline) + '</' + (tag || 'article') + '>' : ''; }
  /* A chart: the height of its plot, k and the names in its key, f when its figures fold under it, h when its card has a head,
     n when it has no caption. */
  function chartCard(code) {
    var m = /^(\d+)(?:k(\d+))?(f?)(h?)(n?)/.exec(code || '');
    if (!m) return '<div class="tray-card site-sk-area site-sk-chart"></div>';
    return '<div class="tray-card">' + (m[4] ? '<div class="tray-card__head"><div>' + ink(14, 'h3', 'subtitle') + ink(46, 'p', 'tray-soft') + '</div>' +
      '<div class="tray-seg tray-seg--sm site-sk-pill">' + times(2, function () { return '<span class="tray-seg__item"><span>' + filler(10) + '</span></span>'; }) + '</div></div>' : '') +
      '<figure class="tray-chart">' + (m[4] ? '' : ink(26, 'figcaption', 'tray-chart__title')) + (m[4] || m[5] ? '' : ink(30, 'p', 'tray-chart__caption')) +
      '<div class="tray-chart__canvas site-sk-area" style="--tray-h: ' + m[1] + 'px"></div>' +
      (m[2] ? '<ul class="tray-chart__legend">' + times(+m[2], function () { return '<li><span class="tray-swatch"></span>' + bar(6) + '</li>'; }) + '</ul>' : '') +
      (m[3] ? fold(16) : '') + '</figure></div>';
  }
  function chart(name, note, code, folded) {
    return '<article class="site-chart' + (/w$/.test(code) ? ' site-chart--wide' : '') + '"><div class="site-chart__bar"><div>' + ink(name, 'h2', 'site-chart__name') + ink(note, 'p') + '</div></div>' +
      '<div class="site-chart__view">' + chartCard(code) + '</div>' +
      (folded ? '<details class="site-chart__code"><summary class="site-sk-pill">' + UI.icon('code', 'tray-icon--sm') + '<span>Code</span></summary></details>' : '') + '</article>';
  }
  /* A control of a playground: g segments, l a list, t a text, s a switch, r a slider. */
  function control(k) {
    var label = '<span class="tray-label">' + bar(7) + '</span>';
    if (k === 's') return '<span class="tray-switch"><span class="tray-switch__track site-sk-pill"></span>' + bar(8) + '</span>';
    if (k === 'r') return '<div class="tray-slider-field"><div class="tray-slider-field__head"><span class="tray-label tray-label--inline">' + bar(7) + '</span><output>&nbsp;</output></div><input class="tray-slider site-sk-pill" type="range"></div>';
    if (k === 'l') return '<div class="tray-field">' + label + '<span class="tray-select tray-select--sm site-sk-pill"><select></select></span></div>';
    if (k === 't') return '<div class="tray-field">' + label + '<input class="tray-input tray-input--sm site-sk-pill"></div>';
    return '<div class="tray-field">' + label + '<span class="tray-seg tray-seg--sm tray-seg--fill site-sk-pill"><span class="tray-seg__item"><span>&nbsp;</span></span></span></div>';
  }
  function article(n) {
    return '<div class="tray-row tray-row--sm"><span class="tray-badge site-sk-pill">' + filler(10) + '</span>' + ink(n || 26, 'span', 'caption') + '</div>';
  }
  function person(cls) {
    return '<span class="tray-person"><span class="tray-avatar' + cls + ' site-sk-pill">VK</span><span class="tray-person__text"><b>' + bar(15) + '</b><small>' + bar(17) + '</small></span></span>';
  }
  /* The summary under a title as the page shows it: its own markup, or, where it is the start of the description, its length. */
  function leadOf(m) { return typeof m.lead === 'number' ? esc(m.desc.slice(0, m.lead)) : m.lead || esc(m.desc || ''); }
  function headOf(m) {
    return '<div class="tray-pagehead"><div class="tray-pagehead__row"><div class="tray-pagehead__text"><h1 class="title" tabindex="-1">' + esc(m.title) + '</h1><p>' + leadOf(m) + '</p></div>' +
      (m.acts ? '<div class="tray-pagehead__actions site-sk" inert>' + m.acts + '</div>' : '') + '</div></div>';
  }
  function shape(id) {
    var m = S.index[id], sk = m.sk || ['p', ''], P = S.parts || {}, k = sk[0], said = '<p class="tray-vh" role="status">Loading the page</p>';
    if (k === 'home') {
      return said + '<div class="site-home site-sk" inert><section class="tray-hero"><div class="tray-card tray-hero__text"><div class="tray-hero__copy">' + ink(42, 'h1', 'display') + ink(170, 'p') + '</div>' +
        '<div class="tray-stack tray-stack--sm"><div class="tray-hero__actions"><span class="tray-btn site-sk-pill">' + filler(11) + '</span><span class="tray-btn tray-btn--quiet site-sk-pill">' + filler(21) + '</span></div>' + ink(140, 'p', 'tray-hero__note') + '</div></div>' +
        '<div class="tray-card tray-card--accent tray-hero__media"><div class="tray-row tray-row--between">' + ink(13, 'h2', 'title') + '<span class="tray-badge site-sk-pill">' + filler(13) + '</span></div>' +
        '<div class="tray-stack"><ul class="tray-items site-ways">' + times(3, function () { return '<li class="tray-item"><span class="tray-item__media site-sk-pill"></span><span class="tray-item__body">' + ink(14, 'span', 'tray-item__title') + ink(24, 'span', 'tray-item__text') +
          '</span><span class="tray-item__end"><span class="tray-btn tray-btn--sm site-sk-pill">' + filler(16) + '</span></span></li>'; }) + '</ul>' +
        '<p><span class="tray-btn tray-btn--quiet tray-btn--sm site-sk-pill">' + filler(17) + '</span></p></div>' + ink(90, 'p') + '</div></section></div>';
    }
    if (k === 'a') {
      return said + '<article class="site-post"><header class="site-post__head"><div class="site-sk" inert><ol class="tray-crumbs">' + (sk[3] || [8, 12, 16]).map(function (n) { return ink(n, 'li'); }).join('') + '</ol></div>' +
        '<div class="site-post__words"><h1 class="headline" tabindex="-1">' + esc(m.title) + '</h1><p class="lead tray-soft">' + leadOf(m) + '</p></div>' +
        '<div class="tray-row site-post__meta site-sk" inert>' + person('') + '<span class="tray-badge site-sk-pill">' + filler(12) + '</span>' + ink(16, 'span', 'caption') + ink(18, 'span', 'caption') + '</div></header>' +
        '<div class="site-post__body"><nav class="tray-sidebar tray-sidebar--plain site-toc site-sk" inert><div class="tray-sidebar__group">' + ink(8, 'p', 'tray-sidebar__label') +
        times(sk[1], function () { return ink(26, 'span', 'tray-sidebar__item'); }) + '</div></nav><div class="site-post__main"><div class="site-toc-fold site-sk" inert>' + fold(8) + '</div>' + prose(sk[2], 'div') + '</div></div></article>';
    }
    var h = said + headOf(m);
    if (k === 'c') {
      return h + '<section class="site-example site-sk" inert>' + (P.example || '') + '<div class="tray-tabpanel"><div class="site-stage site-sk-area" style="min-block-size: ' + sk[1] + 'px"></div></div></section>' +
        (sk[2] ? '<section class="site-play site-sk" inert><div class="site-play__head">' + ink(10, 'h2', 'subtitle') + ink(90, 'p') + '</div>' +
          '<div class="site-play__box"><div class="site-play__stage site-sk-area"></div><div class="tray-card site-play__controls"><div class="tray-stack">' +
          sk[2].split('').map(control).join('') + '<span class="tray-btn tray-btn--ghost tray-btn--sm site-sk-pill">' + filler(10) + '</span></div></div></div>' + codeBox(sk[4] || 1) + '</section>' : '') + prose(sk[3]);
    }
    if (k === 'b') return h + '<section class="site-viewer site-sk" inert>' + (P.viewer || '') + '<div class="tray-tabpanel"><div class="site-frame site-sk-frame"></div></div></section>' + prose(sk[1]);
    if (k === 'g') {
      return h + prose(sk[1], 'section') + sk[2].slice(0, 4).map(function (g) {
        return '<section class="site-prose site-sk" inert>' + ink(g[0], 'h2', 'subtitle') + '<div class="site-gallery">' + times(g[1], function () {
          return '<span class="site-thumb"><span class="site-thumb__view site-sk-area"></span><span class="site-thumb__text"><b>' + bar(30) + '</b><small>' + bar(84) + '</small></span></span>';
        }) + '</div></section>';
      }).join('');
    }
    if (k === 'i') {
      return h + '<div class="site-groups site-sk" inert>' + sk[1].map(function (g) {
        return '<section class="tray-card site-group">' + ink(g[0], 'h2') + '<ul>' + times(g[1], function () { return '<li><a>' + bar(11) + '</a></li>'; }) + '</ul></section>';
      }).join('') + '</div>';
    }
    if (k === 'o') {
      return h + prose(sk[1], 'section') + sk[2].map(function (r) {
        return '<section class="site-prose site-chartrow site-sk" inert><div class="site-chartrow__head"><div>' + ink(r[0], 'h2', 'subtitle') + ink(r[1], 'p') + '</div>' +
          '<span class="tray-btn tray-btn--quiet tray-btn--sm site-sk-pill">' + filler(13) + '</span></div><div class="site-charts site-charts--pair">' +
          r[2].map(function (code) { return chart(10, 28, code, false); }).join('') + '</div></section>';
      }).join('');
    }
    if (k === 'h') return h + '<div class="site-charts site-sk" inert>' + sk[1].map(function (c) { return chart(c[0], c[1], c[2], true); }).join('') + '</div>';
    if (k === 'l') {
      return h + '<div class="site-articles site-sk" inert>' + (P.topics || '') +
        (sk[1] ? '<div class="tray-card site-lead"><div class="tray-bento"><div class="site-thumb tray-span-7 site-sk-area"></div><div class="tray-feature tray-span-5">' + article() +
          ink(44, 'h2', 'title') + ink(170, 'p') + '<div class="tray-feature__end tray-row tray-row--between">' + person(' tray-avatar--sm') + ink(16, 'span', 'caption') + '</div></div></div></div>' : '') +
        '<section class="tray-stack tray-stack--lg"><div class="tray-stack tray-stack--sm">' + ink(13, 'h2', 'subtitle') + ink(34, 'p', 'tray-soft') + '</div><div class="tray-bento">' +
        times(sk[2], function () { return '<div class="tray-card tray-span-4"><div class="tray-stack"><div class="site-thumb site-sk-area"></div>' + article(28) + ink(48, 'h3', 'subtitle') + ink(170, 'p', 'tray-soft') + '</div></div>'; }) +
        '</div></section></div>';
    }
    return h + prose(sk[1]);
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
    view.removeAttribute('data-skeleton');
    view.removeAttribute('aria-busy');
  }

  /* swap(update): the view changes in one step. Where the browser can, and the visitor has not asked for less motion, what
     goes fades out as what comes fades in (a view transition: site.css gives it the system's timing); else at once. Only a
     page coming over its skeleton is drawn so. */
  var still = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function swap(update) {
    if (!document.startViewTransition || (still && still.matches) || document.hidden) { update(); return; }
    var t;
    try { t = document.startViewTransition(update); } catch (e) { update(); return; }
    /* a transition cut short by the next change of page is no error: the page it was for is drawn all the same */
    t.ready.catch(function () {}); t.finished.catch(function () {});
  }
  /* How long the page shown stays while the next one is on its way, before the skeleton takes its place: a page that comes
     sooner replaces it at once, and no grey flashes (the Skeleton's own rule). */
  var WAIT = 300, waiting = 0;

  function render(y) {
    var id = current(), meta = S.index[id], first = shown === null;
    shown = id;
    clearTimeout(waiting);
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
    /* the first page of a visit stays where the browser put it. Another is drawn at once over the last page, as two different
       pages faded one through the other show both at once; over its own skeleton it fades in, the two being alike. */
    function draw() {
      if (first) { paint(id, y, true); return; }
      if (view.hasAttribute('data-skeleton')) swap(function () { if (current() === id) paint(id, y, false); });
      else paint(id, y, false);
    }
    if (loaded[meta.chunk] || (meta.bare && view.getAttribute('data-prerendered') === id)) { draw(); return; }
    if (view.getAttribute('data-prerendered') === id) {
      /* the page came drawn in its file: it stays as it is, readable, while the script that wires it arrives */
      if (typeof y === 'number') window.scrollTo(0, y);
      need(id).then(function () { if (current() === id) paint(id, null, true); }, function () { /* it stays readable; its examples wait for a reload */ });
      return;
    }
    /* the page is on its way. The page shown stays for a moment; if the next has not come by then, its skeleton takes the
       place, at the top of the window. The first page of a visit has none to keep: its skeleton is drawn at once. */
    view.setAttribute('aria-busy', 'true');
    function wait() {
      if (current() !== id || view.getAttribute('data-page') === id) return;
      clearCharts();
      view.removeAttribute('data-prerendered');
      view.removeAttribute('data-page');
      if (meta.wide) view.setAttribute('data-wide', ''); else view.removeAttribute('data-wide');
      put(view, shape(id));
      view.setAttribute('data-skeleton', '');
      window.scrollTo(0, 0);
    }
    if (first) wait(); else waiting = setTimeout(wait, WAIT);
    need(id).then(function () { if (current() === id) { clearTimeout(waiting); draw(); } }, function () {
      if (current() !== id) return;
      clearTimeout(waiting);
      /* a new version of the site came out while this one was open, and the file of the page has another name now:
         the page itself, loaded afresh, knows it */
      if (PATHS && navigator.onLine !== false && !first) { location.assign(href(id)); return; }
      clearCharts();
      view.removeAttribute('aria-busy');
      view.removeAttribute('data-prerendered');
      view.removeAttribute('data-skeleton');
      put(view, (meta.sk && meta.sk[0] === 'a' ? '<h1 class="title" tabindex="-1">' + esc(meta.title) + '</h1>' : headOf(meta)) +
        '<div class="tray-alert tray-alert--danger" role="alert"><span class="tray-alert__icon">' + UI.icon('circle-alert') + '</span><div class="tray-alert__body">' +
        '<p class="tray-alert__title">This page did not load</p><p class="tray-alert__text">Check the connection and <a href="' + href(id) + '" data-retry>try again</a>.</p></div></div>');
      window.scrollTo(0, 0);
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

  /* ---------- A page is fetched when a link to it is about to be followed ----------
     A moment under the pointer, focus, or a press: by the time the click lands the file of the page has usually come, so it
     is drawn at once and its skeleton is never seen. For a visitor who asked to save data, only a press fetches. */
  var saving = !!(navigator.connection && navigator.connection.saveData), soon = 0;
  function aimed(el) {
    var a = el && el.closest ? el.closest('a[href], [role="option"][data-value]') : null, id = null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return null;
    if (a.tagName !== 'A') id = a.getAttribute('data-value');
    else if (PATHS) { var u = new URL(a.href, location.href); id = u.origin === location.origin ? idOf(u.pathname) : null; }
    else id = a.getAttribute('href').charAt(0) === '#' ? a.getAttribute('href').slice(1).split('?')[0] : null;
    return id !== null && has(S.index, id) && id !== current() && !loaded[S.index[id].chunk] ? id : null;
  }
  function fetchPage(id) { if (id !== null) need(id).catch(function () { /* fetched again when it is opened */ }); }
  function fetchSoon(id, delay) {
    clearTimeout(soon);
    if (id !== null) soon = setTimeout(function () { fetchPage(id); }, delay);
  }
  document.addEventListener('pointerover', function (e) { if (!saving && e.pointerType === 'mouse') fetchSoon(aimed(e.target), 80); });
  document.addEventListener('pointerout', function () { clearTimeout(soon); });
  document.addEventListener('focusin', function (e) { if (!saving) fetchSoon(aimed(e.target), 150); });
  document.addEventListener('pointerdown', function (e) { fetchPage(aimed(e.target)); });

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
  /* setTheme(id): the whole site in that theme, remembered for the next visit. follow: the system's setting chose it, not
     the visitor, so nothing is remembered and the site goes on following the setting. */
  var chosen = false;
  function setTheme(id, follow) {
    if (!known(id)) id = 'light';
    document.documentElement.setAttribute('data-theme', id);
    if (!follow) {
      chosen = true;
      try { localStorage.setItem('tray-site-theme', id); } catch (e) { /* the choice lasts for this visit only */ }
    }
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
  /* Until the visitor chooses a theme, the site wears Light or Dark as their system asks (the script in <head> reads it
     before the page is drawn), and follows the setting when it changes. */
  var scheme = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (scheme && scheme.addEventListener) scheme.addEventListener('change', function () {
    var saved = null;
    try { saved = localStorage.getItem('tray-site-theme'); } catch (e) { /* nothing kept */ }
    if (!chosen && !saved) setTheme(scheme.matches ? 'dark' : 'light', true);
  });
  S.theme = { current: pageTheme, set: setTheme, own: ownTheme, setOwn: setOwnTheme };

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

  /* ---------- Keyboard: "/" and Ctrl or Command with K open the search ----------
     K in either case, so Shift and Caps Lock change nothing; on a layout whose letters are not Latin, the key where K is. */
  document.addEventListener('keydown', function (e) {
    var key = String(e.key || '').toLowerCase();
    var k = (key === 'k' || (e.code === 'KeyK' && !/^[a-z]$/.test(key))) && (e.metaKey || e.ctrlKey) && !e.altKey;
    var slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !(e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]'));
    if ((!k && !slash) || full.open) return;
    e.preventDefault();
    openSearch();
  });
  $('#site-skip').addEventListener('click', function () { view.focus(); });

  /* For tests, and for the pages that make links (the Themes page). */
  S.go = go; S.here = current; S.urlOf = urlOf; S.query = query; S.paths = PATHS;

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
