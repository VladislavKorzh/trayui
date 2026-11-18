"""Turns a Tray UI block (one HTML page) into a React component, mechanically: the same markup and classes, the
behaviours wired by the runtime on the block's root once it is mounted (useBehaviour), and the block's own script, if it
has one, run once in an effect. tools/registry.py calls it for every block; the result is the block's React item.

    from html2jsx import block_to_tsx
    tsx, info = block_to_tsx(source, 'Login01')

Only the standard library. The result compiles under a strict TypeScript config (Vite's react-ts template, Next.js):
numbers where React's types want numbers, defaultValue/defaultChecked for form state, style objects typed as
CSSProperties. A block's own script is plain DOM code and the file then starts with // @ts-nocheck. A script that waits
for the window's load event or for DOMContentLoaded runs at once when the page is past that point, as it is by the
time React runs an effect, and waits as before otherwise.
"""
import html
import json
import re
from html.parser import HTMLParser

WS = r'[ \t\n\r\f]+'   # HTML's whitespace: not \s, which also eats the no-break space
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
PHRASING = {'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'button', 'cite', 'code', 'data', 'dfn', 'em', 'i', 'img', 'input',
            'kbd', 'label', 'mark', 'output', 'q', 's', 'samp', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg',
            'textarea', 'time', 'u', 'var', 'wbr', 'meter', 'progress'}
RENAME = {'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex', 'autocomplete': 'autoComplete',
          'readonly': 'readOnly', 'maxlength': 'maxLength', 'minlength': 'minLength', 'colspan': 'colSpan',
          'rowspan': 'rowSpan', 'inputmode': 'inputMode', 'spellcheck': 'spellCheck', 'datetime': 'dateTime',
          'novalidate': 'noValidate', 'autofocus': 'autoFocus', 'enctype': 'encType', 'accesskey': 'accessKey',
          'contenteditable': 'contentEditable', 'crossorigin': 'crossOrigin', 'srcset': 'srcSet',
          'popovertarget': 'popoverTarget', 'popovertargetaction': 'popoverTargetAction', 'enterkeyhint': 'enterKeyHint',
          'formaction': 'formAction', 'formmethod': 'formMethod', 'formnovalidate': 'formNoValidate',
          'viewbox': 'viewBox', 'preserveaspectratio': 'preserveAspectRatio', 'gradientunits': 'gradientUnits',
          'autocapitalize': 'autoCapitalize', 'autocorrect': 'autoCorrect', 'autosave': 'autoSave',
          'itemprop': 'itemProp', 'itemscope': 'itemScope', 'itemtype': 'itemType', 'playsinline': 'playsInline',
          'referrerpolicy': 'referrerPolicy', 'fetchpriority': 'fetchPriority', 'usemap': 'useMap',
          'xlink:href': 'href', 'xmlns:xlink': 'xmlnsXlink'}
NUMERIC = {'tabIndex', 'colSpan', 'rowSpan', 'maxLength', 'minLength', 'rows', 'cols', 'span', 'start', 'size',
           'aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-level', 'aria-posinset', 'aria-setsize',
           'aria-colcount', 'aria-rowcount', 'aria-colindex', 'aria-rowindex', 'aria-colspan', 'aria-rowspan'}
BOOLEAN = {'disabled', 'required', 'multiple', 'hidden', 'open', 'readOnly', 'noValidate', 'autoFocus', 'reversed',
           'formNoValidate', 'novalidate', 'inert', 'default', 'playsinline', 'muted', 'controls', 'loop', 'async', 'defer'}
VALUE_AS_DEFAULT = {'text', 'search', 'email', 'tel', 'url', 'password', 'number', 'range', 'date', 'time',
                    'datetime-local', 'month', 'week', 'color', ''}


class Node:
    def __init__(self, tag, attrs=None, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, attrs or [], parent, []


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('#root')
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.cur)
        self.cur.children.append(node)
        if tag not in VOID:
            self.cur = node

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(data)

    def handle_comment(self, data):
        self.cur.children.append(('#comment', data))


def find(node, tag):
    if isinstance(node, Node):
        if node.tag == tag:
            return node
        for c in node.children:
            got = find(c, tag)
            if got:
                return got
    return None


def text_of(node):
    return ''.join(c if isinstance(c, str) else text_of(c) for c in node.children if not isinstance(c, tuple))


def camel(prop):
    return re.sub(r'-([a-z])', lambda m: m.group(1).upper(), prop)


def style_obj(css):
    parts = []
    for decl in css.split(';'):
        if ':' not in decl:
            continue
        k, v = decl.split(':', 1)
        k, v = k.strip(), v.strip()
        if not k:
            continue
        key = k if k.startswith('--') else camel(k)
        parts.append(f'{json.dumps(key)}: {json.dumps(v)}')
    return '{ ' + ', '.join(parts) + ' } as CSSProperties'


class Emitter:
    def __init__(self):
        self.uses_css_type = False
        self.warnings = []

    def attrs(self, node, in_svg):
        out = []
        tag = node.tag
        itype = dict(node.attrs).get('type', '') if tag == 'input' else None
        for name, value in node.attrs:
            if name.startswith('on'):
                self.warnings.append(f'<{tag} {name}> dropped (inline handler)')
                continue
            key = RENAME.get(name, name)
            if in_svg and '-' in key and not key.startswith(('aria-', 'data-')):
                key = camel(key)
            if tag == 'input' and key == 'checked':
                key = 'defaultChecked'
            if tag == 'input' and key == 'value' and (itype or '') in VALUE_AS_DEFAULT:
                key = 'defaultValue'
            if tag == 'option' and key == 'selected':
                continue  # becomes the select's defaultValue
            if value is None or (key in BOOLEAN and value in ('', key.lower())):
                out.append(key)
            elif key == 'style':
                self.uses_css_type = True
                out.append(f'style={{{style_obj(value)}}}')
            elif key in NUMERIC and re.fullmatch(r'-?\d+(\.\d+)?', value):
                out.append(f'{key}={{{value}}}')
            elif any(ch in value for ch in '"\\\n&'):
                out.append(f'{key}={{{json.dumps(value)}}}')
            else:
                out.append(f'{key}="{value}"')
        if tag == 'select':
            chosen = [o for o in node.children if isinstance(o, Node) and o.tag == 'option' and 'selected' in dict(o.attrs)]
            if chosen:
                o = chosen[0]
                v = dict(o.attrs).get('value') or text_of(o).strip()
                out.append(f'defaultValue={json.dumps(v)}')
        return out

    def text(self, s, pre):
        if pre:
            return '{' + json.dumps(s) + '}'
        if any(ch in s for ch in '{}<>'):
            return '{' + json.dumps(s) + '}'
        # JSX decodes entities in text and trims whitespace at line ends; a compiler may count U+00A0 as whitespace
        return s.replace('&', '&amp;').replace(' ', '&nbsp;')

    def children(self, node, depth, in_svg, pre):
        kids = [c for c in node.children if not (isinstance(c, tuple))]
        lines = []
        pad = '  ' * depth
        for i, c in enumerate(kids):
            if isinstance(c, str):
                if pre:
                    lines.append(self.text(c, True))
                    continue
                collapsed = re.sub(WS, ' ', c)
                if collapsed == ' ':
                    prev = kids[i - 1] if i > 0 else None
                    nxt = kids[i + 1] if i + 1 < len(kids) else None

                    def inline(x):
                        return isinstance(x, str) or (isinstance(x, Node) and x.tag in PHRASING)
                    if prev is not None and nxt is not None and inline(prev) and inline(nxt):
                        lines.append(pad + '{" "}')
                    continue
                if collapsed == '':
                    continue
                lead = collapsed.startswith(' ') and i > 0
                trail = collapsed.endswith(' ') and i + 1 < len(kids)
                body = self.text(collapsed.strip(' '), False)
                lines.append(pad + ('{" "}' if lead else '') + body + ('{" "}' if trail else ''))
            else:
                lines.extend(self.element(c, depth, in_svg, pre))
        return lines

    def element(self, node, depth, in_svg=False, pre=False):
        pad = '' if pre else '  ' * depth
        in_svg = in_svg or node.tag == 'svg'
        attrs = self.attrs(node, in_svg)
        head = '<' + node.tag + (' ' + ' '.join(attrs) if attrs else '')
        if node.tag == 'textarea':
            value = text_of(node)
            if value.strip():
                head += f' defaultValue={json.dumps(value.lstrip(chr(10)))}'
            return [pad + head + ' />']
        kids = [c for c in node.children if not isinstance(c, tuple)]
        if node.tag in VOID or not kids:
            return [pad + head + ' />']
        if pre or node.tag == 'pre':
            inner = ''.join(self.children(node, 0, in_svg, True))
            return [pad + head + '>' + inner + '</' + node.tag + '>']
        simple = len(kids) == 1 and isinstance(kids[0], str) and '\n' not in kids[0].strip()
        if simple:
            t = re.sub(WS, ' ', kids[0]).strip(' ')
            return [pad + head + '>' + self.text(t, False) + '</' + node.tag + '>']
        return [pad + head + '>'] + self.children(node, depth + 1, in_svg, False) + [pad + '</' + node.tag + '>']


def block_to_tsx(source, component, core='..'):
    """Returns (tsx, info). `core` is the relative path from the block file to the folder holding lib/."""
    tree = Tree()
    tree.feed(source)
    body = find(tree.root, 'body')
    title = find(tree.root, 'title')
    scripts = []
    keep = []
    for c in body.children:
        if isinstance(c, Node) and c.tag == 'script':
            if not dict(c.attrs).get('src'):
                scripts.append(text_of(c))
            continue
        keep.append(c)
    body.children = keep
    elems = [c for c in keep if isinstance(c, Node)]
    em = Emitter()
    single = len(elems) == 1
    if single:
        elems[0].attrs = elems[0].attrs + [('__ref', None)]
        lines = em.element(elems[0], 2)
    else:
        wrapper = Node('div', [('style', 'display: contents'), ('__ref', None)])
        wrapper.children = keep
        lines = em.element(wrapper, 2)
    jsx = '\n'.join(lines).replace(' __ref', ' ref={ref}', 1)
    uses_behaviours = 'data-tray=' in source
    imports = ["import { useEffect, useRef } from 'react';" if scripts else "import { useRef } from 'react';"]
    if em.uses_css_type:
        imports.append("import type { CSSProperties } from 'react';")
    if uses_behaviours:
        imports.append(f"import {{ useBehaviour }} from '{core}/lib/util';")
    root_tag = elems[0].tag if single else 'div'
    dom = {'div': 'HTMLDivElement', 'form': 'HTMLFormElement', 'span': 'HTMLSpanElement', 'ul': 'HTMLUListElement',
           'ol': 'HTMLOListElement', 'dialog': 'HTMLDialogElement', 'table': 'HTMLTableElement'}.get(root_tag, 'HTMLElement')
    body_lines = [f'  const ref = useRef<{dom}>(null);']
    if uses_behaviours:
        body_lines.append('  useBehaviour(ref);')
    if scripts:
        code = '\n'.join(s.strip('\n') for s in scripts)
        # In the HTML page the script runs before the page has loaded; in React it runs in an effect, later. A wait for an
        # event that has already happened would never end, so the waits become calls that run at once when it has.
        code, loads = re.subn(r"\bwindow\.addEventListener\(\s*(['\"])load\1\s*,\s*", 'whenLoaded(', code)
        code, readies = re.subn(r"\bdocument\.addEventListener\(\s*(['\"])DOMContentLoaded\1\s*,\s*", 'whenReady(', code)
        body_lines.append('  const ran = useRef(false);')
        body_lines.append('  useEffect(() => {')
        body_lines.append('    if (ran.current) return;')
        body_lines.append('    ran.current = true;')
        body_lines.append("    // The block's own script, as it is in the HTML file: plain DOM code that keeps the page in step.")
        body_lines.append('    // Rewrite it with React state when you make this screen yours.')
        if loads:
            body_lines.append("    const whenLoaded = (fn) => { if (document.readyState === 'complete') fn(); else window.addEventListener('load', fn, { once: true }); };")
        if readies:
            body_lines.append("    const whenReady = (fn) => { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn, { once: true }); };")
        for ln in code.split('\n'):
            body_lines.append(('    ' + ln) if ln.strip() else '')
        body_lines.append('  }, []);')
    head = (['// @ts-nocheck'] if scripts else []) + ["'use client';"]
    head.append(f'/* Generated from the Tray UI block of the same name: {html.unescape(text_of(title)).strip()}.')
    head.append('   The markup and classes are the HTML block\'s; the runtime wires its behaviours once it is mounted. */')
    tsx = '\n'.join(head + imports + ['', f'export function {component}() {{'] + body_lines +
                    ['  return (', jsx, '  );', '}', ''])
    return tsx, {'scripts': len(scripts), 'behaviours': uses_behaviours, 'warnings': em.warnings, 'title': html.unescape(text_of(title)).strip()}
