/* The Themes page of the site: the list of themes to choose from, and the maker of a theme of one's own.
   site.js loads this file after theme.js (the engine) when the page is opened, and calls TrayThemesPage.mount.
   The maker keeps its work in this browser; nothing is sent anywhere. */
(function () {
  'use strict';
  var T = window.TrayTheme;
  var DRAFT = 'tray-site-theme-draft', SEEDS = ['page', 'surface', 'ink', 'accent'];
  var active = null;  // the page that is mounted now: a change of theme elsewhere on the site reaches it through here

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function copy(o) { var out = {}, k; for (k in o) out[k] = o[k]; return out; }

  document.addEventListener('site:theme', function (e) { if (active && active.host.isConnected) active.onTheme(e.detail.id); });

  function mount(host, S, UI) {
    var data = S.themes, byId = {}, base = {};
    data.list.forEach(function (t) { byId[t.id] = t; if (t.id === 'light' || t.id === 'dark') base[t.id] = t.tokens; });
    var form = $('[data-maker]', host), radios = $$('input[name="site-theme-pick"]', host);
    var out = { css: $('#site-theme-css', host), html: $('#site-theme-html', host), verdict: $('[data-maker-verdict]', host), report: $('[data-maker-report]', host),
                tokens: $('[data-maker-tokens]', host), name: $('[data-maker-name]', host), use: $('[data-maker-use]', host),
                link: $('#site-theme-link', host), shared: $('[data-maker-shared]', host) };
    var draft = $('#site-draft-theme');
    if (!draft) { draft = document.createElement('style'); draft.id = 'site-draft-theme'; document.head.appendChild(draft); }
    /* The tokens a person may set one by one: every colour that is not one of the four they choose, and that is a plain hex. */
    var editable = Object.keys(byId.light.tokens).filter(function (n) { return SEEDS.indexOf(n) < 0 && n.indexOf('paper') !== 0 && T.valid(byId.light.tokens[n]); });

    /* ---------- The state of the maker ---------- */
    function fresh(id, name) {
      var t = byId[id] || byId.light;
      return { base: t.id, name: name || 'My theme', seed: { page: t.tokens.page, surface: t.tokens.surface, ink: t.tokens.ink, accent: t.tokens.accent },
               trayAuto: true, touched: false, over: {}, round: 100 };
    }
    function load() {
      try {
        var s = JSON.parse(localStorage.getItem(DRAFT) || 'null');
        if (s && byId[s.base] && s.seed && SEEDS.every(function (k) { return T.valid(s.seed[k]); })) return s;
      } catch (e) { /* start afresh */ }
      return null;
    }
    /* ---------- A theme sent as a link: /docs/themes?theme=Name&from=light&colours=page-tray-ink-accent&corners=80&tray=auto&set=token:hex,… ----------
       The address holds the colours themselves, so a link works in any browser and nothing is stored anywhere. */
    function fromLink() {
      var given = S.query();
      if (!given) return null;
      var q = new URLSearchParams(given);
      if (!q.has('theme')) return null;
      var cols = (q.get('colours') || '').split('-'), seed = {}, over = {};
      if (cols.length !== 4 || !cols.every(function (c) { return /^[0-9a-f]{6}$/i.test(c); })) return { state: null };
      SEEDS.forEach(function (k, i) { seed[k] = '#' + cols[i].toLowerCase(); });
      var from = byId[q.get('from')] ? q.get('from') : T.modeOf(seed.page);
      var round = q.has('corners') && isFinite(Number(q.get('corners'))) ? Math.max(0, Math.min(150, Math.round(Number(q.get('corners')) / 10) * 10)) : 100;
      (q.get('set') || '').split(',').forEach(function (pair) {
        var p = pair.split(':');
        if (p.length === 2 && editable.indexOf(p[0]) >= 0 && /^[0-9a-f]{6}$/i.test(p[1])) over[p[0]] = '#' + p[1].toLowerCase();
      });
      var name = (q.get('theme') || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 32) || 'Shared theme';
      var same = SEEDS.every(function (k) { return T.normal(byId[from].tokens[k]) === seed[k]; });
      return { state: { base: from, name: name, seed: seed, trayAuto: q.get('tray') === 'auto', touched: !same, over: over, round: round } };
    }
    /* Where a link leads: this page, or the page on the published site when this one runs inside another page, or from the
       file system, whose address nobody else can open. */
    function home() {
      return !S.paths && S.site ? S.site + '/' + S.index['d-themes'].path + '?' : S.urlOf('d-themes') + '?';
    }
    function link() {
      var t = tokens(), q = new URLSearchParams(), set = Object.keys(state.over).filter(function (n) { return T.valid(state.over[n]); });
      q.set('theme', state.name || 'My theme');
      q.set('from', state.base);
      q.set('colours', SEEDS.map(function (k) { return t[k].slice(1); }).join('-'));
      if (state.round !== 100) q.set('corners', String(state.round));
      if (state.touched && state.trayAuto) q.set('tray', 'auto');
      if (set.length) q.set('set', set.map(function (n) { return n + ':' + T.normal(state.over[n]).slice(1); }).join(','));
      return home() + q.toString();
    }

    var here = S.theme.current(), saved = load();
    var state = saved || fresh(byId[here] ? here : 'light');
    var shared = fromLink(), before = null;
    if (shared) {
      if (shared.state) { before = saved && JSON.stringify(saved) !== JSON.stringify(shared.state) ? saved : null; state = shared.state; }
      /* the address goes back to the page alone: the theme is in the maker now, and a reload keeps it there */
      try { history.replaceState(history.state, '', S.urlOf('d-themes')); } catch (e) { /* the address keeps the link */ }
    }

    function tokens() {
      var t, k;
      if (!state.touched) t = copy(byId[state.base].tokens);
      else {
        var seed = { page: state.seed.page, ink: state.seed.ink, accent: state.seed.accent };
        /* the tray follows the page: it stays the base theme's while the page does, and is worked out again once the page changes */
        if (!state.trayAuto || state.seed.page === byId[state.base].tokens.page) seed.surface = state.seed.surface;
        t = T.derive(seed, base);
      }
      for (k in state.over) if (T.valid(state.over[k])) t[k] = T.normal(state.over[k]);
      return t;
    }
    /* What a theme sets besides its colours: the shadow of its mode, and its corners when they differ from the system's. */
    function more(t) {
      var m = copy(byId[T.modeOf(t.page)].more), c, k;
      if (state.round !== 100) { c = T.corners(state.round / 100, data.radii); for (k in c) m[k] = c[k]; }
      return m;
    }
    /* The tokens a theme writes: those that differ between the themes of the system, those set by hand, and a status colour
       of the yellow or the ink card that had to move for this theme's accent or ink. */
    function names(t) {
      var extra = Object.keys(state.over).concat(T.CARDS.map(function (c) { return c[0]; }).filter(function (n) { return t && t[n] !== byId.light.tokens[n]; }));
      return data.themed.concat(extra.filter(function (n, i) { return data.themed.indexOf(n) < 0 && extra.indexOf(n) === i; }));
    }

    /* ---------- Drawing ---------- */
    function setField(el, value) { if (el && el !== document.activeElement && el.value !== value) el.value = value; }
    function render() {
      var t = tokens(), id = T.slug(state.name), extra = more(t), rows = T.report(t), missed = rows.filter(function (r) { return !r.ok; });
      draft.textContent = T.css('site-draft', t, names(t), extra);
      SEEDS.forEach(function (k) {
        setField($('[data-seed="' + k + '"]', form), t[k]);
        var hex = $('[data-seed-hex="' + k + '"]', form);
        setField(hex, t[k]);
        if (hex !== document.activeElement) hex.removeAttribute('aria-invalid');
      });
      setField($('[data-maker-base]', form), state.base);
      setField($('[data-maker-name-input]', form), state.name);
      var round = $('[data-maker-round]', form);
      if (round !== document.activeElement && Number(round.value) !== state.round) { round.value = state.round; round.dispatchEvent(new Event('input', { bubbles: true })); }
      $$('[data-token]', out.tokens).forEach(function (row) {
        var n = row.getAttribute('data-token');
        setField($('input', row), t[n]);
        $('[data-auto]', row).hidden = !(n in state.over);
      });
      out.name.textContent = state.name || 'My theme';
      S.paint(out.css, T.css(id, t, names(t), extra), 'css');
      S.paint(out.html, '<html lang="en" data-theme="' + id + '">', 'html');
      out.link.textContent = link();
      /* the verdict changes only when what it says changes, so a screen reader hears it once, not on every step of a drag */
      var say = missed.length
        ? '<div class="tray-alert tray-alert--danger" role="status"><span class="tray-alert__icon">' + UI.icon('circle-alert') + '</span><div class="tray-alert__body"><p class="tray-alert__title">' +
          missed.length + ' of ' + rows.length + ' pairs ' + (missed.length === 1 ? 'misses its' : 'miss their') + ' contrast</p><p class="tray-alert__text">' +
          esc(missed.slice(0, 3).map(function (r) { return r.what + ' (' + r.token + ' on ' + r.on + '): ' + r.ratio.toFixed(2) + ', needs ' + r.need; }).join('. ')) +
          (missed.length > 3 ? ', and ' + (missed.length - 3) + ' more' : '') + '. Make the ink and the page further apart, or the accent brighter.</p></div></div>'
        : '<div class="tray-alert tray-alert--success" role="status"><span class="tray-alert__icon">' + UI.icon('circle-check') + '</span><div class="tray-alert__body"><p class="tray-alert__title">All ' + rows.length +
          ' pairs hold their contrast</p><p class="tray-alert__text">Text keeps its contrast on every ground of this ' + T.modeOf(t.page) + ' theme, and ink reads on the accent.</p></div></div>';
      if (out.verdict.getAttribute('data-said') !== say) { out.verdict.innerHTML = say; out.verdict.setAttribute('data-said', say); }
      out.report.innerHTML = rows.map(function (r) {
        return '<tr><th scope="row">' + esc(r.what) + '</th><td><code class="tray-code-inline">' + r.token + '</code> on <code class="tray-code-inline">' + r.on + '</code></td><td data-num>' + r.ratio.toFixed(2) +
          '</td><td data-num>' + r.need + '</td><td>' + (r.ok ? '<span class="tray-badge tray-badge--success">' + UI.icon('circle-check', 'tray-icon--sm') + 'Yes</span>'
            : '<span class="tray-badge tray-badge--danger">' + UI.icon('circle-alert', 'tray-icon--sm') + 'No</span>') + '</td></tr>';
      }).join('');
      var own = S.theme.own();
      $('[data-maker-forget]', form).hidden = !own;
      $('span', out.use).textContent = own && own.id === id ? 'Update it on this site' : 'Use on this site';
      try { localStorage.setItem(DRAFT, JSON.stringify(state)); } catch (e) { /* the work lasts for this visit only */ }
      radios.forEach(function (r) { r.checked = r.value === S.theme.current(); });
      if (radios[0] && radios[0].closest('.tray-seg')) radios[0].closest('.tray-seg').dispatchEvent(new Event('change'));
    }

    /* ---------- The list of themes ---------- */
    radios.forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) S.theme.set(r.value); });
    });

    /* ---------- The controls ---------- */
    out.tokens.innerHTML = editable.map(function (n) {
      return '<div class="site-token" data-token="' + n + '"><input type="color" aria-label="' + n + '"><div class="site-token__text"><b>' + n + '</b><small>' + esc(data.usage[n] || '') + '</small></div>' +
        '<button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-auto hidden>Auto</button></div>';
    }).join('');
    function seedSet(key, value) {
      if (!T.valid(value)) return false;
      /* the first change moves the theme off its base: from here on its steps are worked out from the four colours */
      state.touched = true;
      state.seed[key] = T.normal(value);
      if (key === 'surface') state.trayAuto = false;
      render();
      return true;
    }
    form.addEventListener('input', function (e) {
      var el = e.target, row;
      if (el.hasAttribute('data-seed')) seedSet(el.getAttribute('data-seed'), el.value);
      else if (el.hasAttribute('data-seed-hex')) {
        var ok = seedSet(el.getAttribute('data-seed-hex'), el.value.trim().replace(/^([0-9a-f]{3,6})$/i, '#$1'));
        if (ok) el.removeAttribute('aria-invalid'); else el.setAttribute('aria-invalid', 'true');
      } else if (el.hasAttribute('data-maker-name-input')) { state.name = el.value.slice(0, 32); render(); }
      else if (el.hasAttribute('data-maker-round')) { state.round = Number(el.value); render(); }
      else if ((row = el.closest('[data-token]'))) { state.over[row.getAttribute('data-token')] = el.value; render(); }
    });
    form.addEventListener('change', function (e) {
      if (!e.target.hasAttribute('data-maker-base')) return;
      state = fresh(e.target.value, state.name);
      render();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b) return;
      if (b.hasAttribute('data-auto')) { delete state.over[b.closest('[data-token]').getAttribute('data-token')]; render(); }
      else if (b.hasAttribute('data-maker-reset')) { state = fresh(byId[S.theme.current()] ? S.theme.current() : state.base); render(); }
      else if (b.hasAttribute('data-maker-random')) { surprise(); render(); }
      else if (b.hasAttribute('data-maker-use')) use();
      else if (b.hasAttribute('data-maker-link')) copyLink();
      else if (b.hasAttribute('data-maker-forget')) {
        S.theme.setOwn(null);
        UI.toast({ title: 'Your theme is off this site', text: 'It is still here in the maker.', duration: 4000 });
        render();
      }
    });

    /* A theme nobody chose: a hue for the neutrals, a bright accent near it or across from it. It follows every rule the others do. */
    function surprise() {
      var hue = Math.random() * 360, dark = Math.random() < 0.4, turn = [0, 30, -40, 150, 180, 200][Math.floor(Math.random() * 6)];
      var page = dark ? T.oklch(0.17, 0.014 + Math.random() * 0.016, hue) : T.oklch(0.988, 0.005 + Math.random() * 0.008, hue);
      var mode = T.modeOf(page);
      state.base = mode;
      state.seed = { page: page, ink: dark ? T.oklch(0.975, 0.012, hue) : T.oklch(0.2, 0.025, hue), accent: T.oklch(0.84, 0.15, hue + turn),
                     surface: T.along(page, T.oklch(dark ? 0.6 : 0.55, 0.09, hue), page, T.STEPS[mode].surface) };
      state.trayAuto = false; state.touched = true; state.over = {};
    }

    function use() {
      var t = tokens(), id = T.slug(state.name);
      if (byId[id]) { UI.toast({ title: 'Give it a name of its own', text: '"' + state.name + '" is one of the themes of the system.', duration: 5000 }); $('[data-maker-name-input]', form).focus(); return false; }
      S.theme.setOwn({ id: id, name: state.name || 'My theme', css: T.css(id, t, names(t), more(t)) });
      S.theme.set(id);
      UI.toast({ tone: 'success', title: 'This site now wears ' + (state.name || 'your theme'), text: 'It is in the theme menu, in this browser only.', duration: 4500 });
      render();
      return true;
    }

    function copyLink() {
      var text = link(), name = state.name || 'your theme';
      function said() { UI.toast({ tone: 'success', title: 'Copied a link to ' + name, text: 'Whoever opens it finds the theme in the maker.', duration: 4000 }); }
      function failed() { UI.toast({ title: 'Copy the link by hand', text: 'It is under Take it with you, at the end of this page.', duration: 6000 }); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(said, failed); else failed();
    }

    /* What a link brought: the theme is in the maker; one press wears it, another brings back the draft it replaced. */
    function tell(what) {
      if (!what) { out.shared.innerHTML = ''; return; }
      if (!what.state) {
        out.shared.innerHTML = '<div class="tray-alert tray-alert--danger" role="alert"><span class="tray-alert__icon">' + UI.icon('circle-alert') + '</span><div class="tray-alert__body">' +
          '<p class="tray-alert__title">This link holds no theme the maker can read</p><p class="tray-alert__text">Its colours are cut short or changed, so the maker shows your own work. Ask for the link again.</p></div></div>';
        return;
      }
      out.shared.innerHTML = '<div class="tray-alert" role="status"><span class="tray-alert__icon">' + UI.icon('link') + '</span><div class="tray-alert__body">' +
        '<p class="tray-alert__title">' + esc(what.state.name) + ' came with the link</p><p class="tray-alert__text">It is in the maker below, checked like every other theme. Wear it on this site as it is, or change it first.</p>' +
        '<div class="tray-alert__actions"><button class="tray-btn tray-btn--sm" type="button" data-shared-use>Wear it on this site</button>' +
        (before ? '<button class="tray-btn tray-btn--ghost tray-btn--sm" type="button" data-shared-undo>Put back my draft</button>' : '') + '</div></div></div>';
    }
    out.shared.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b) return;
      if (b.hasAttribute('data-shared-use')) { if (use()) tell(null); }
      else if (b.hasAttribute('data-shared-undo')) {
        state = before; before = null; tell(null); render();
        UI.toast({ title: 'Your draft is back', text: 'The theme from the link is gone from the maker.', duration: 4000 });
      }
    });

    active = {
      host: host,
      /* A theme chosen elsewhere: the list follows, and so does the maker while nobody has changed anything in it. */
      onTheme: function (id) {
        if (byId[id] && !state.touched && !Object.keys(state.over).length && state.round === 100) state = fresh(id, state.name);
        render();
      },
    };
    render();
    if (shared) {
      tell(shared);
      $('#themes-make', host).scrollIntoView({ block: 'start' });
    }
  }

  window.TrayThemesPage = { mount: mount };
})();
