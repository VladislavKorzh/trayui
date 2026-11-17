#!/usr/bin/env python3
"""Check that the buttons at the foot of every dialog, sheet and drawer sit on one line, at several window widths.

    python3 tools/feet.py
"""
import json, pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
P, PREV = ROOT / 'project', ROOT / '.preview'
JS = '''() => [...document.querySelectorAll('.tray-dialog__foot')].filter(f => f.getBoundingClientRect().width).map(f => {
  const tops = [...f.children].map(c => Math.round(c.getBoundingClientRect().top));
  const box = f.closest('dialog, .tray-dialog, .tray-sheet, .tray-drawer');
  return { labels: [...f.children].map(c => c.textContent.trim()).join(' | '), lines: new Set(tops).size, inner: Math.round(f.getBoundingClientRect().width),
           need: [...f.children].reduce((s, c) => s + c.getBoundingClientRect().width, 0) + 8 * (f.children.length - 1), box: box ? box.className : '' }; })'''


def main():
    tokens = (PREV / 'tokens.css').read_text(encoding='utf-8'); css = (ROOT / 'dist/components/bundle.css').read_text(encoding='utf-8'); js = (ROOT / 'dist/components/bundle.js').read_text(encoding='utf-8')
    names = sorted(d.name for d in (P / 'components').iterdir() if (d / 'preview.html').exists() and 'tray-dialog__foot' in (d / 'preview.html').read_text(encoding='utf-8'))
    bad = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        for width in (700, 920, 1280, 1520, 1920):
            ctx = b.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
            ctx.add_init_script('(() => { const boot = () => { const d = document.documentElement; if (!d) return false; d.setAttribute("data-theme", "light"); for (const t of ' + json.dumps([tokens, css]) + ') { const s = document.createElement("style"); s.textContent = t; d.appendChild(s); } return true; }; if (!boot()) new MutationObserver((_, o) => { if (boot()) o.disconnect(); }).observe(document, { childList: true }); })();')
            ctx.add_init_script(js)
            for name in names:
                pg = ctx.new_page(); pg.goto((P / 'components' / name / 'preview.html').as_uri(), wait_until='load'); pg.wait_for_timeout(150)
                pg.evaluate('document.querySelectorAll("dialog:not([open])").forEach(d => d.showModal())'); pg.wait_for_timeout(80)
                for f in pg.evaluate(JS):
                    if f['lines'] > 1: bad.append((width, name, f))
                pg.close()
            ctx.close()
        b.close()
    print(f'{len(names)} previews with a dialog foot, 5 widths: {len(bad)} feet wrap')
    for w, n, f in bad: print(f'  {w}px {n}: "{f["labels"]}" needs {round(f["need"])}px, has {f["inner"]}px  [{f["box"]}]')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
