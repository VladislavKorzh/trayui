  /* ---------- Chart ----------
     TrayUI.chart(el, config) draws into a <figure class="tray-chart">; or put the config as JSON in data-chart with data-tray="chart".
     config: { type: 'bar' | 'line' | 'area' | 'donut' | 'radial' | 'radar', labels: [...], series: [{ name, values: [...] }],
               unit, max, stacked, horizontal, step, height, label: 'peak' | 'none', table: true, summary, labelHead, totalLabel, locale } */
  function niceMax(max) {
    if (!(max > 0)) return 1;
    var pow = Math.pow(10, Math.floor(Math.log10(max))), steps = [1, 2, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < steps.length; i += 1) if (steps[i] * pow >= max) return steps[i] * pow;
    return 10 * pow;
  }
  function make(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; n.setAttribute('data-gen', ''); return n; }
  function colour(k) { return '--tray-c:var(--tray-s' + Math.min(k + 1, 5) + ')'; }

  UI.chart = function (el, cfg) {
    cfg = cfg || JSON.parse(el.getAttribute('data-chart') || '{}');
    var type = cfg.type || 'bar', labels = cfg.labels || [], series = cfg.series || [], unit = cfg.unit || '';
    var nf = new Intl.NumberFormat(cfg.locale || 'en-GB', { maximumFractionDigits: 1 });
    function val(v) { return nf.format(v) + unit; }
    function all() { return series.reduce(function (a, s) { return a.concat(s.values); }, []); }
    $$('[data-gen]', el).forEach(function (n) { if (n.parentNode === el) el.removeChild(n); });
    el.classList.add('tray-chart');
    /* The figure is named by its caption: browsers do not all take a figure's name from its figcaption, so it is said
       with aria-labelledby. */
    var caption = $(':scope > figcaption', el);
    if (caption && !el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) { caption.id = caption.id || uid('tray-chart-title'); el.setAttribute('aria-labelledby', caption.id); }
    el.classList.toggle('tray-chart--single', series.length === 1 && type !== 'donut' && !(type === 'radial' && series[0].values.length > 1));
    var summary = cfg.summary || (type + ' chart. ' + series.map(function (s) { return s.name + ': ' + labels.map(function (l, i) { return l + ' ' + val(s.values[i]); }).join(', '); }).join('. '));
    /* What the arrow keys reach is said through this region. It sits in the figure, beside the drawing: the children of a
       role="img" are presentational, so a region inside it would never be heard. */
    var live = make('span', 'tray-vh');
    live.setAttribute('aria-live', 'polite');

    /* On touch a tap shows the values under it until the next tap elsewhere: a finger that lifts is not a pointer that
       leaves. lingers(box, clear) gives the pointerleave handler, which clears for a mouse or a pen only. */
    function lingers(box, clear) {
      function away(e) { if (!box.contains(e.target)) { document.removeEventListener('pointerdown', away); clear(); } }
      box.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') document.addEventListener('pointerdown', away); });
      return function (e) { if (e.pointerType !== 'touch') clear(); };
    }

    function legend(names) {
      var ul = make('ul', 'tray-chart__legend');
      ul.innerHTML = names.map(function (name, k) { return '<li><span class="tray-swatch" style="' + colour(k) + '"></span>' + esc(name) + '</li>'; }).join('');
      el.appendChild(ul);
    }
    function table() {
      if (cfg.table === false) return;
      var d = make('details', 'tray-collapsible');
      var head = '<tr><th scope="col">' + esc(cfg.labelHead || '') + '</th>' + series.map(function (s) { return '<th scope="col" data-num>' + esc(s.name) + '</th>'; }).join('') + '</tr>';
      var rows = labels.map(function (l, i) { return '<tr><th scope="row">' + esc(l) + '</th>' + series.map(function (s) { return '<td data-num>' + val(s.values[i]) + '</td>'; }).join('') + '</tr>'; }).join('');
      d.innerHTML = '<summary><span>Show the figures</span><span class="tray-tile" aria-hidden="true">' + icon('plus') + '</span></summary>' +
        '<div class="tray-collapsible__body"><table class="tray-table tray-table--compact"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>';
      el.appendChild(d);
    }

    function cartesian() {
      var n = labels.length, stacked = !!cfg.stacked;
      var totals = labels.map(function (_, i) { return series.reduce(function (a, s) { return a + (s.values[i] || 0); }, 0); });
      var max = cfg.max || niceMax(Math.max.apply(null, stacked ? totals : all()));
      var every = n > 12 ? Math.ceil(n / 8) : 1;
      var frame = make('div', 'tray-chart__frame');
      frame.innerHTML = '<div class="tray-chart__axis" aria-hidden="true"><span>' + val(max) + '</span><span>' + nf.format(max / 2) + '</span><span>0</span></div>' +
        '<div class="tray-chart__plot" tabindex="0" role="img" aria-label="' + esc(summary) + '"><div class="tray-chart__grid"><span style="inset-block-start:0"></span><span style="inset-block-start:50%"></span></div></div>' +
        '<div class="tray-chart__x" aria-hidden="true">' + labels.map(function (l, i) { return '<span>' + (i % every ? '' : esc(l)) + '</span>'; }).join('') + '</div>';
      if (cfg.height) frame.style.setProperty('--tray-h', cfg.height + 'px');
      el.appendChild(frame);
      /* The labels under the plot: every one while each fits its column, else every second, third and so on, so that on
         a narrow card none is cut. A label is centred on its column and may reach into the empty ones beside it. */
      var xrow = $('.tray-chart__x', frame), xs = $$('span', xrow);
      watch(xrow, function () {
        var col = xrow.clientWidth / n, wide = 0, r = document.createRange();
        if (!col) return;
        labels.forEach(function (l, i) { xs[i].textContent = l; r.selectNodeContents(xs[i]); wide = Math.max(wide, r.getBoundingClientRect().width); });
        var step = Math.max(every, Math.ceil((wide + 8) / col));
        labels.forEach(function (l, i) { xs[i].textContent = i % step ? '' : l; });
      });
      var plot = $('.tray-chart__plot', frame), lines = [];
      var peak = null;
      if (series.length === 1 && cfg.label !== 'none') {
        var top = Math.max.apply(null, series[0].values);
        peak = { i: series[0].values.indexOf(top), v: top };
      }
      if (type === 'bar') {
        var cols = make('div', 'tray-chart__cols');
        cols.innerHTML = labels.map(function (_, i) {
          return '<div class="tray-chart__col' + (stacked ? ' tray-chart__col--stack' : '') + '">' + series.map(function (s, k) {
            return '<span class="tray-chart__bar" style="' + colour(k) + ';block-size:' + ((s.values[i] || 0) / max * 100).toFixed(2) + '%"></span>';
          }).join('') + (peak && peak.i === i ? '<span class="tray-chart__peak" style="inset-block-end:calc(' + (peak.v / max * 100).toFixed(2) + '% + 6px)">' + val(peak.v) + '</span>' : '') + '</div>';
        }).join('');
        plot.appendChild(cols);
      } else {
        var svg = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">', base = labels.map(function () { return 0; });
        series.forEach(function (s, k) {
          var pts = s.values.map(function (v, i) { return [(i + .5) / n * 100, 100 - (stacked ? base[i] + v : v) / max * 100]; });
          var d = pts.map(function (p, i) { return !i ? 'M' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) : (cfg.step ? 'H' + p[0].toFixed(2) + 'V' + p[1].toFixed(2) : 'L' + p[0].toFixed(2) + ' ' + p[1].toFixed(2)); }).join('');
          if (type === 'area') {
            var floor = stacked ? base.map(function (b, i) { return [(i + .5) / n * 100, 100 - b / max * 100]; }).reverse() : [[pts[n - 1][0], 100], [pts[0][0], 100]];
            svg += '<path class="tray-chart__area" style="' + colour(k) + '" d="' + d + floor.map(function (p) { return 'L' + p[0].toFixed(2) + ' ' + p[1].toFixed(2); }).join('') + 'Z"/>';
          }
          svg += '<path class="tray-chart__line" style="' + colour(k) + '" d="' + d + '"/>';
          if (stacked) base = base.map(function (b, i) { return b + s.values[i]; });
          lines.push(pts);
        });
        plot.insertAdjacentHTML('beforeend', svg + '</svg>');
        if (peak) {
          var p = lines[0][peak.i];
          plot.insertAdjacentHTML('beforeend', '<span class="tray-chart__dot" style="' + colour(0) + ';inset-inline-start:' + p[0] + '%;inset-block-start:' + p[1] + '%"></span>' +
            '<span class="tray-chart__peak" style="inset-inline-start:' + p[0] + '%;inset-block-end:calc(' + (100 - p[1]) + '% + 10px)">' + val(peak.v) + '</span>');
        }
      }
      var cross = type === 'bar' ? null : make('span', 'tray-chart__cross'), tip = make('div', 'tray-tip'), dots = [], active = null;
      if (cross) { cross.hidden = true; plot.appendChild(cross); }
      tip.hidden = true;
      plot.appendChild(tip);
      el.appendChild(live);
      function hide() {
        active = null; tip.hidden = true;
        if (cross) cross.hidden = true;
        dots.forEach(function (d) { d.remove(); }); dots = [];
        $$('.tray-chart__col', plot).forEach(function (c) { c.removeAttribute('data-active'); });
        $$('.tray-chart__peak', plot).forEach(function (c) { c.style.visibility = ''; });
      }
      function show(i, announce) {
        if (i == null || i < 0 || i >= n) { hide(); return; }
        active = i;
        var x = (i + .5) / n * 100;
        if (cross) { cross.hidden = false; cross.style.insetInlineStart = x + '%'; }
        $$('.tray-chart__col', plot).forEach(function (c, k) { c.toggleAttribute('data-active', k === i); });
        dots.forEach(function (d) { d.remove(); }); dots = [];
        lines.forEach(function (pts, k) { var d = make('span', 'tray-chart__dot'); d.style.cssText = colour(k) + ';inset-inline-start:' + pts[i][0] + '%;inset-block-start:' + pts[i][1] + '%'; plot.appendChild(d); dots.push(d); });
        tip.hidden = false;
        tip.innerHTML = series.length > 1
          ? '<span>' + esc(labels[i]) + '</span>' + series.map(function (s, k) { return '<span class="tray-tip__row"><span class="tray-swatch" style="' + colour(k) + '"></span>' + esc(s.name) + '<b>' + val(s.values[i]) + '</b></span>'; }).join('')
          : esc(labels[i]) + ', ' + val(series[0].values[i]);
        tip.style.insetBlockStart = '0';
        tip.style.insetInlineStart = x < 50 ? 'calc(' + x + '% + 14px)' : 'auto';
        tip.style.insetInlineEnd = x < 50 ? 'auto' : 'calc(' + (100 - x) + '% + 14px)';
        $$('.tray-chart__peak', plot).forEach(function (c) { c.style.visibility = 'hidden'; });
        if (announce) live.textContent = labels[i] + ': ' + series.map(function (s) { return (series.length > 1 ? s.name + ' ' : '') + val(s.values[i]); }).join(', ');
      }
      function at(e) {
        var box = plot.getBoundingClientRect(), f = (e.clientX - box.left) / box.width;
        if (getComputedStyle(plot).direction === 'rtl') f = 1 - f;
        return clamp(Math.floor(f * n), 0, n - 1);
      }
      plot.addEventListener('pointermove', function (e) { show(at(e)); });
      plot.addEventListener('pointerdown', function (e) { show(at(e)); });
      plot.addEventListener('pointerleave', lingers(plot, hide));
      plot.addEventListener('blur', hide);
      plot.addEventListener('keydown', function (e) {
        var rtl = getComputedStyle(plot).direction === 'rtl', step = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 }[e.key];
        if (step) { e.preventDefault(); show(clamp((active == null ? (peak ? peak.i : 0) - step : active) + step, 0, n - 1), true); }
        else if (e.key === 'Home') { e.preventDefault(); show(0, true); }
        else if (e.key === 'End') { e.preventDefault(); show(n - 1, true); }
        else if (e.key === 'Escape') hide();
      });
      if (series.length > 1) legend(series.map(function (s) { return s.name; }));
    }

    function horizontal() {
      var vals = series[0].values, max = cfg.max || Math.max.apply(null, vals);
      var rows = make('div', 'tray-chart__rows');
      /* Every chart is a stop for Tab, so its summary is read there. Each figure is written beside its bar: nothing to walk. */
      rows.setAttribute('tabindex', '0');
      rows.setAttribute('role', 'img');
      rows.setAttribute('aria-label', summary);
      rows.innerHTML = labels.map(function (l, i) {
        return '<span>' + esc(l) + '</span><span class="tray-chart__track"><span style="' + colour(0) + ';inline-size:' + (vals[i] / max * 100).toFixed(2) + '%"></span></span><span class="tray-num">' + val(vals[i]) + '</span>';
      }).join('');
      el.appendChild(rows);
    }

    function donut() {
      var vals = series[0].values, total = vals.reduce(function (a, b) { return a + b; }, 0), r = 40, a0 = -Math.PI / 2, gap = .04;
      var round = make('div', 'tray-chart__round'), svg = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">';
      vals.forEach(function (v, i) {
        var sweep = v / total * Math.PI * 2, s = a0 + gap / 2, e = a0 + sweep - gap / 2;
        if (e > s) svg += '<path class="tray-chart__seg" data-i="' + i + '" style="' + colour(i) + '" d="M' + (50 + r * Math.cos(s)).toFixed(2) + ' ' + (50 + r * Math.sin(s)).toFixed(2) +
          'A' + r + ' ' + r + ' 0 ' + (e - s > Math.PI ? 1 : 0) + ' 1 ' + (50 + r * Math.cos(e)).toFixed(2) + ' ' + (50 + r * Math.sin(e)).toFixed(2) + '"/>';
        a0 += sweep;
      });
      round.innerHTML = svg + '</svg><div class="tray-chart__center"><b></b><span></span></div>';
      round.setAttribute('tabindex', '0');
      round.setAttribute('role', 'img');
      round.setAttribute('aria-label', summary);
      el.appendChild(round);
      el.appendChild(live);
      var big = $('.tray-chart__center b', round), small = $('.tray-chart__center span', round), active = null;
      function show(i, announce) {
        active = i;
        $$('.tray-chart__seg', round).forEach(function (seg) { seg.toggleAttribute('data-active', +seg.dataset.i === i); });
        round.toggleAttribute('data-hover', i != null);
        big.textContent = i == null ? val(total) : val(vals[i]);
        small.textContent = i == null ? (cfg.totalLabel || 'Total') : labels[i] + ', ' + Math.round(vals[i] / total * 100) + '%';
        if (announce && i != null) live.textContent = labels[i] + ': ' + val(vals[i]) + ', ' + Math.round(vals[i] / total * 100) + '%';
      }
      round.addEventListener('pointerover', function (e) { var seg = e.target.closest && e.target.closest('.tray-chart__seg'); show(seg ? +seg.dataset.i : null); });
      round.addEventListener('pointerleave', lingers(round, function () { show(null); }));
      round.addEventListener('blur', function () { show(null); });
      round.addEventListener('keydown', function (e) {
        var step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
        if (step) { e.preventDefault(); show(((active == null ? (step > 0 ? -1 : 0) : active) + step + vals.length) % vals.length, true); }
        else if (e.key === 'Escape') show(null);
      });
      show(null);
      var key = make('table', 'tray-chart__key');
      key.innerHTML = '<tbody>' + labels.map(function (l, i) { return '<tr><th scope="row"><span class="tray-swatch" style="' + colour(i) + '"></span>' + esc(l) + '</th><td>' + val(vals[i]) + '</td><td>' + Math.round(vals[i] / total * 100) + '%</td></tr>'; }).join('') + '</tbody>';
      el.appendChild(key);
    }

    function radial() {
      var vals = series[0].values.slice(0, 3), max = cfg.max || 100;
      var round = make('div', 'tray-chart__round'), svg = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">';
      vals.forEach(function (v, i) {
        var r = 43 - i * 10, c = 2 * Math.PI * r;
        svg += '<circle class="tray-chart__ring" cx="50" cy="50" r="' + r + '"/><circle class="tray-chart__value" cx="50" cy="50" r="' + r + '" style="' + colour(i) + '" stroke-dasharray="' + (c * clamp(v / max, 0, 1)).toFixed(2) + ' ' + c.toFixed(2) + '" transform="rotate(-90 50 50)"/>';
      });
      round.innerHTML = svg + '</svg>' + (vals.length === 1 ? '<div class="tray-chart__center"><b>' + val(vals[0]) + '</b><span>' + esc(labels[0] || '') + '</span></div>' : '');
      /* A stop for Tab like every chart, so its summary is read there; its figures are in the middle or in the key. */
      round.setAttribute('tabindex', '0');
      round.setAttribute('role', 'img');
      round.setAttribute('aria-label', summary);
      el.appendChild(round);
      if (vals.length > 1) {
        var key = make('table', 'tray-chart__key');
        key.innerHTML = '<tbody>' + vals.map(function (v, i) { return '<tr><th scope="row"><span class="tray-swatch" style="' + colour(i) + '"></span>' + esc(labels[i]) + '</th><td>' + val(v) + '</td></tr>'; }).join('') + '</tbody>';
        el.appendChild(key);
      }
    }

    function radar() {
      var n = labels.length, max = cfg.max || niceMax(Math.max.apply(null, all())), R = 36;
      function pt(i, v) { var a = -Math.PI / 2 + i / n * Math.PI * 2, r = v / max * R; return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; }
      function poly(fn) { return labels.map(function (_, i) { var p = fn(i); return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' '); }
      var round = make('div', 'tray-chart__round'), svg = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">';
      [1 / 3, 2 / 3, 1].forEach(function (f) { svg += '<polygon class="tray-chart__web" points="' + poly(function (i) { return pt(i, max * f); }) + '"/>'; });
      labels.forEach(function (_, i) { var p = pt(i, max); svg += '<line class="tray-chart__web" x1="50" y1="50" x2="' + p[0].toFixed(2) + '" y2="' + p[1].toFixed(2) + '"/>'; });
      series.forEach(function (s, k) { svg += '<polygon class="tray-chart__shape" style="' + colour(k) + '" points="' + poly(function (i) { return pt(i, s.values[i]); }) + '"/>'; });
      round.innerHTML = svg + '</svg>' + labels.map(function (l, i) { var p = pt(i, max * 1.24); return '<span class="tray-chart__spoke" style="inset-inline-start:' + p[0].toFixed(1) + '%;inset-block-start:' + p[1].toFixed(1) + '%" aria-hidden="true">' + esc(l) + '</span>'; }).join('');
      round.setAttribute('tabindex', '0');
      round.setAttribute('role', 'img');
      round.setAttribute('aria-label', summary);
      round.style.direction = 'ltr';
      el.appendChild(round);
      var tip = make('div', 'tray-tip'), active = null;
      tip.hidden = true;
      round.appendChild(tip);
      el.appendChild(live);
      function show(i, announce) {
        active = i;
        tip.hidden = i == null;
        if (i == null) return;
        tip.innerHTML = '<span>' + esc(labels[i]) + '</span>' + series.map(function (s, k) { return '<span class="tray-tip__row"><span class="tray-swatch" style="' + colour(k) + '"></span>' + esc(s.name) + '<b>' + val(s.values[i]) + '</b></span>'; }).join('');
        var p = pt(i, max * .6);
        tip.style.left = p[0] + '%';
        tip.style.top = p[1] + '%';
        tip.style.transform = 'translate(-50%, -50%)';
        if (announce) live.textContent = labels[i] + ': ' + series.map(function (s) { return s.name + ' ' + val(s.values[i]); }).join(', ');
      }
      function point(e) {
        var box = round.getBoundingClientRect(), a = Math.atan2(e.clientY - box.top - box.height / 2, e.clientX - box.left - box.width / 2) + Math.PI / 2;
        show(Math.round(((a + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * n) % n);
      }
      /* a tap moves nothing: it shows the spoke under it as it lands */
      round.addEventListener('pointermove', point);
      round.addEventListener('pointerdown', point);
      round.addEventListener('pointerleave', lingers(round, function () { show(null); }));
      round.addEventListener('blur', function () { show(null); });
      round.addEventListener('keydown', function (e) {
        var step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
        if (step) { e.preventDefault(); show(((active == null ? (step > 0 ? -1 : 0) : active) + step + n) % n, true); }
        else if (e.key === 'Escape') show(null);
      });
      if (series.length > 1) legend(series.map(function (s) { return s.name; }));
    }

    if (type === 'donut') donut();
    else if (type === 'radial') radial();
    else if (type === 'radar') radar();
    else if (type === 'bar' && cfg.horizontal) horizontal();
    else cartesian();
    table();
    return { update: function (next) { return UI.chart(el, next); } };
  };
  UI.register('chart', function (el) { if (el.hasAttribute('data-chart')) UI.chart(el); });

  /* ---------- Data table ----------
     data-tray="datatable" on the wrapper of a .tray-table. Optional parts, found by attribute:
     .tray-sort buttons in column heads, [data-filter] input, [data-select-all] and [data-select] checkboxes, [data-selected-count],
     data-page-size on the wrapper with [data-page-prev], [data-page-next], [data-page-status], and a [data-empty] row. */
  UI.register('datatable', function (root) {
    var table = $('table', root), body = table.tBodies[0];
    var empty = $('[data-empty]', body), rows = $$('tr', body).filter(function (r) { return r !== empty; });
    var filter = $('[data-filter]', root), size = +(root.dataset.pageSize || 0), page = 0;
    var status = $('[data-page-status]', root), prev = $('[data-page-prev]', root), next = $('[data-page-next]', root);
    var count = $('[data-selected-count]', root), allBox = $('[data-select-all]', root);
    function matched() {
      var q = filter ? filter.value.trim().toLowerCase() : '';
      return rows.filter(function (r) { return !q || r.textContent.toLowerCase().indexOf(q) >= 0; });
    }
    function key(cell) {
      var v = cell.dataset.value != null ? cell.dataset.value : cell.textContent.trim();
      var t = /^\d{4}-\d{2}-\d{2}/.test(v) ? Date.parse(v) : NaN;  /* a date written as 2026-11-27 or 2026-11-27T10:31 */
      if (!isNaN(t)) return t;
      var n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
      return /^[^a-z]*[0-9]/i.test(v) && !isNaN(n) ? n : String(v).toLowerCase();
    }
    function paint() {
      var list = matched(), per = size || list.length || 1, pages = Math.max(1, Math.ceil(list.length / per));
      page = clamp(page, 0, pages - 1);
      rows.forEach(function (r) { r.hidden = true; });
      list.slice(page * per, page * per + per).forEach(function (r) { r.hidden = false; });
      if (empty) empty.hidden = list.length > 0;
      if (status) status.textContent = list.length ? (page * per + 1) + '–' + Math.min(list.length, (page + 1) * per) + ' of ' + list.length : 'Nothing to show';
      /* A button that turns off under the reader's finger, on the first or the last page, hands focus to the other one
         (or to the count when both are off), so focus is not dropped to the top of the page. */
      var first = page === 0, last = page >= pages - 1;
      if (prev && !first) prev.disabled = false;
      if (next && !last) next.disabled = false;
      if (prev && first) { rescue(prev, !last && next || status); prev.disabled = true; }
      if (next && last) { rescue(next, !first && prev || status); next.disabled = true; }
      /* The row's checkbox carries the state: aria-selected means nothing on the row of a plain table. */
      var picked = 0;
      rows.forEach(function (r) { var c = $('[data-select]', r); if (c && c.checked) picked += 1; });
      if (count) count.textContent = picked ? picked + ' of ' + rows.length + ' selected' : rows.length + ' rows';
      if (allBox) { allBox.checked = picked === rows.length && rows.length > 0; allBox.indeterminate = picked > 0 && picked < rows.length; }
      fire(root, 'change', { selected: picked, page: page });
    }
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.tray-sort');
      if (btn) {
        var th = btn.closest('th'), i = [].indexOf.call(th.parentNode.children, th), dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
        $$('th', table.tHead).forEach(function (h) { h.removeAttribute('aria-sort'); var u = $('.tray-sort use', h); if (u) u.setAttribute('href', '#tray-i-arrow-up-down'); });
        th.setAttribute('aria-sort', dir);
        /* the icon is optional: aria-sort on the head says the order, the arrow only shows it */
        var use = $('use', btn);
        if (use) use.setAttribute('href', '#tray-i-arrow-' + (dir === 'ascending' ? 'up' : 'down'));
        rows.sort(function (a, b) { var x = key(a.children[i]), y = key(b.children[i]); return (x > y ? 1 : x < y ? -1 : 0) * (dir === 'ascending' ? 1 : -1); });
        rows.forEach(function (r) { body.insertBefore(r, empty || null); });
        page = 0; paint();
      }
      if (e.target.closest('[data-page-prev]')) { page -= 1; paint(); }
      if (e.target.closest('[data-page-next]')) { page += 1; paint(); }
    });
    root.addEventListener('change', function (e) {
      if (e.target === allBox) matched().forEach(function (r) { var c = $('[data-select]', r); if (c) c.checked = allBox.checked; });
      if (e.target === allBox || e.target.matches('[data-select]')) paint();
    });
    if (filter) filter.addEventListener('input', function () { page = 0; paint(); });
    paint();
  });
