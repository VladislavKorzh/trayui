#!/usr/bin/env python3
"""Write Tray UI as a registry in shadcn's format, from the repository, which it only reads.

    python3 tools/registry.py --out DIR [--base URL]    write DIR/r/ (base: where r/ is served, default <site>/r)
    python3 tools/registry.py --check DIR/r             check a written registry; exit 1 on a problem

tools/site.py calls write(site/, <site>/r), so the site serves it at https://trayui.com/r/, and tools/site_check.py
calls validate(). Two flat registries, each a registry.json index and one <name>.json per item:

  r/       React: `core` (the helpers, the behaviours as a module, the icons, an import of the stylesheet from the
           package trayui), one item per component (its source as it is in react/src, with the lib files it imports,
           each lib file an item of its own unless every component needs it), one item per block (the page turned into
           a component by tools/html2jsx.py).
  r/html/  Plain HTML: `trayui` (the three files and their licences; the font is binary, so the item names it in
           meta.trayui.assets for a CLI to fetch from /fonts/) and one item per block, the page as it is.

Every item is a "universal" item: type registry:item, every file registry:file with an explicit target from the root of
the project (~/), so the shadcn CLI writes the files as they are, with no components.json, no Tailwind and no rewriting
of imports (npx shadcn add https://trayui.com/r/login-01.json), and so does npx trayui (cli/trayui.mjs), which also
places a plain HTML block beside the user's pages, fetches the font and keeps the user's edits.

validate() checks a registry against shadcn's published schemas, kept in tools/shadcn/, with the small draft-07
validator below (the standard library has none), and against the rules of the format the schemas leave to prose.
"""
import argparse, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
from html2jsx import block_to_tsx  # noqa: E402

SCHEMA_ITEM = 'https://ui.shadcn.com/schema/registry-item.json'
SCHEMA_REG = 'https://ui.shadcn.com/schema/registry.json'
SCHEMAS = ROOT / 'tools' / 'shadcn'
REACT_ROOT = '~/src/components/trayui'   # where the React files land; npx trayui moves them (components/trayui without src/, --dir)
HTML_ROOT = '~/trayui'                   # the plain HTML files; npx trayui places a block beside the user's pages


def kebab(name):
    """Button -> button, AlertDialog -> alert-dialog, InputOTP -> input-otp: the address of the component's page."""
    return re.sub(r'(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])', '-', name).lower()


def pascal(name):
    return ''.join(p[:1].upper() + p[1:] for p in re.split(r'[-_]', name))


def first_paragraph(md):
    body = re.sub(r'\A---\n.*?\n---\n', '', md, flags=re.S)
    body = re.sub(r'^# .*\n', '', body.strip() + '\n', count=1).strip()
    return re.sub(r'\s+', ' ', body.split('\n\n')[0]).strip()


def doc_summary(md_path):
    """(category, first paragraph) of a component's React guide, react/docs/<Name>.md."""
    if not md_path.exists():
        return '', ''
    text = md_path.read_text(encoding='utf-8')
    cat = re.search(r'^category:\s*(.+)$', text, re.M)
    return (cat.group(1).strip() if cat else ''), first_paragraph(text)


def block_meta(source):
    meta = lambda name: (re.search(rf'<meta name="{name}" content="([^"]*)"', source) or [None, ''])[1]
    title = re.search(r'<title>(.*?)</title>', source, re.S)
    import html
    return html.unescape(title.group(1).strip() if title else ''), html.unescape(meta('description')), meta('tray-category')


def strongly_connected(graph):
    """Tarjan's algorithm, iterative: the groups of files that import each other (a cycle travels as one item)."""
    index, low, on, stack, out, n = {}, {}, set(), [], [], 0
    for start in sorted(graph):
        if start in index:
            continue
        work = [(start, iter(sorted(graph[start])))]
        index[start] = low[start] = n; n += 1; stack.append(start); on.add(start)
        while work:
            v, it = work[-1]
            for w in it:
                if w not in graph:
                    continue
                if w not in index:
                    index[w] = low[w] = n; n += 1; stack.append(w); on.add(w)
                    work.append((w, iter(sorted(graph[w]))))
                    break
                if w in on:
                    low[v] = min(low[v], index[w])
            else:
                work.pop()
                if work:
                    low[work[-1][0]] = min(low[work[-1][0]], low[v])
                if low[v] == index[v]:
                    comp = []
                    while True:
                        w = stack.pop(); on.discard(w); comp.append(w)
                        if w == v:
                            break
                    out.append(sorted(comp))
    return out


def import_graph(src):
    """The React sources a registry item may carry, and which of them each imports: {'components/Button.tsx': {...}}."""
    files = {}
    for p in sorted((src / 'components').glob('*.tsx')) + sorted((src / 'lib').glob('*.ts')) + sorted((src / 'lib').glob('*.tsx')):
        files[p.relative_to(src).as_posix()] = p
    for extra in ('runtime.ts', 'icons.ts'):
        if (src / extra).exists():
            files[extra] = src / extra
    graph = {}
    spec_re = re.compile(r"""(?:\bfrom\s+|\bimport\s+|\bimport\(\s*)['"](\.{1,2}/[^'"]+)['"]""")
    for rel, p in files.items():
        deps = set()
        for spec in spec_re.findall(p.read_text(encoding='utf-8')):
            parts = (Path(rel).parent / spec).as_posix().split('/')
            norm = []
            for part in parts:
                if part == '..':
                    if norm:
                        norm.pop()
                elif part not in ('.', ''):
                    norm.append(part)
            target = '/'.join(norm)
            target = re.sub(r'\.js$', '', target)
            for cand in (target, target + '.tsx', target + '.ts', target + '/index.ts'):
                if cand in files:
                    deps.add(cand)
                    break
            else:
                raise SystemExit(f'registry: react/src/{rel} imports {spec}, which is not a file the registry can carry')
        graph[rel] = deps
    return files, graph


def entry(path, target, content):
    return {'path': path, 'type': 'registry:file', 'target': target, 'content': content}


def write(out, base=None):
    """Write out/r/ (React) and out/r/html/ (plain HTML). Returns a summary: the counts, the core files, the merged cycles,
    the blocks with a script of their own and what the converter dropped."""
    out = Path(out)
    links = json.loads((ROOT / 'tools' / 'links.json').read_text(encoding='utf-8'))
    version, site = links['version'], links['site'].rstrip('/')
    base = (base or site + '/r').rstrip('/')
    src, docs, dist = ROOT / 'react' / 'src', ROOT / 'react' / 'docs', ROOT / 'dist'
    author = f'Tray UI <{site}>'
    url = lambda name, sub='': f'{base}/{sub}{name}.json'
    files, graph = import_graph(src)

    # core: what every component needs, the helpers in util and icon and what they import (the runtime, the icons)
    core_files, todo = [], [f for f in ('lib/util.ts', 'lib/icon.ts') if f in files]
    while todo:
        f = todo.pop()
        if f not in core_files:
            core_files.append(f)
            todo += sorted(graph[f])
    owner = {f: 'core' for f in core_files}
    for comp in strongly_connected({f: graph[f] for f in files if f not in owner}):
        comps = [f for f in comp if f.startswith('components/')]
        name = kebab(Path(comps[0]).stem) if comps else 'lib-' + kebab(Path(comp[0]).stem.split('.')[0])
        for f in comp:
            owner[f] = name
    groups = {}
    for f, name in sorted(owner.items()):
        groups.setdefault(name, []).append(f)
    merged = {n: fs for n, fs in groups.items() if n != 'core' and len([f for f in fs if f.startswith('components/')]) > 1}

    react = {}
    styles_ts = ("/* The system's stylesheet, with its font, from the package trayui (the core item installs it). Import this file once,\n"
                 "   at the entry of the app: import './components/trayui/styles' (in src/main.tsx, or in app/layout.tsx in Next.js). */\n"
                 "import 'trayui/tokens.css';\nimport 'trayui/components/bundle.css';\n")
    react['core'] = {
        '$schema': SCHEMA_ITEM, 'name': 'core', 'type': 'registry:item', 'title': 'Tray UI core for React',
        'description': 'What every Tray UI component in React needs: the helpers, the behaviours of the system as a module, the icons, '
                       'and an import of the stylesheet from the package trayui.',
        'author': author, 'dependencies': [f'trayui@{version}'],
        'files': [entry(f'react/src/{f}', f'{REACT_ROOT}/{f}', files[f].read_text(encoding='utf-8')) for f in sorted(core_files)]
                 + [entry('react/src/styles.ts', f'{REACT_ROOT}/styles.ts', styles_ts),
                    entry('LICENSE', f'{REACT_ROOT}/LICENSE', (ROOT.parent / 'LICENSE').read_text(encoding='utf-8')),
                    entry('src/LUCIDE-LICENSE.txt', f'{REACT_ROOT}/LUCIDE-LICENSE.txt', (ROOT / 'src' / 'LUCIDE-LICENSE.txt').read_text(encoding='utf-8'))],
        'docs': "Import the stylesheet once, at the entry of your app: import './components/trayui/styles' (from src/main.tsx; in Next.js from app/layout.tsx), "
                "or import 'trayui/tokens.css' and 'trayui/components/bundle.css' yourself.",
        'categories': ['core'],
        'meta': {'trayui': {'version': version, 'kind': 'core', 'framework': 'react', 'page': f'{site}/docs/react'}},
    }
    for name, fs in groups.items():
        if name == 'core':
            continue
        comps = [f for f in fs if f.startswith('components/')]
        deps = sorted({owner[d] for f in fs for d in graph[f]} - {name})
        if 'core' not in deps:
            deps = ['core'] + deps  # the stylesheet comes with core
        comp = Path(comps[0]).stem if comps else None
        cat, summary = doc_summary(docs / f'{comp}.md') if comp else ('', '')
        readme = ROOT / 'project' / 'components' / (comp or '') / 'README.md'
        title = readme.read_text(encoding='utf-8').split('\n', 1)[0].lstrip('# ').strip() if comp and readme.exists() else (comp or name)
        imports = ', '.join(Path(c).stem for c in comps)
        react[name] = {
            '$schema': SCHEMA_ITEM, 'name': name, 'type': 'registry:item', 'title': title,
            'description': summary or (f'Shared code for {", ".join(sorted({Path(f).stem for f in fs}))}: the components that need it bring it.' if not comp else title),
            'author': author, 'registryDependencies': [url(d) for d in deps],
            'files': [entry(f'react/src/{f}', f'{REACT_ROOT}/{f}', files[f].read_text(encoding='utf-8')) for f in sorted(fs)],
            'categories': [c for c in [cat.lower()] if c] or ['lib'],
            'meta': {'trayui': {'version': version, 'kind': 'component' if comp else 'lib', 'framework': 'react',
                                'page': f'{site}/components/{kebab(comp)}' if comp else f'{site}/docs/react',
                                **({'components': [Path(c).stem for c in comps]} if comp else {})}},
            **({'docs': f"import {{ {imports} }} from './components/trayui/components/{Path(comps[0]).stem}'. Its guide: {site}/components/{kebab(comp)}"} if comp else {}),
        }

    html_items = {'trayui': {
        '$schema': SCHEMA_ITEM, 'name': 'trayui', 'type': 'registry:item', 'title': 'Tray UI: the three files',
        'description': 'tokens.css, components/bundle.css and components/bundle.js, with their licences, in a trayui/ folder. The font is fetched beside them.',
        'author': author,
        'files': [entry(f'dist/{p}', f'{HTML_ROOT}/{p}', (dist / p).read_text(encoding='utf-8'))
                  for p in ('tokens.css', 'components/bundle.css', 'components/bundle.js', 'components/LUCIDE-LICENSE.txt', 'fonts/OFL.txt', 'LICENSE')],
        'docs': 'Link trayui/tokens.css, then trayui/components/bundle.css, then trayui/components/bundle.js. '
                f'The font is a binary file a registry item cannot carry: copy {site}/fonts/Onest-Variable.woff2 and Onest-Variable.ttf '
                'into trayui/fonts/, or run npx trayui init, which does.',
        'categories': ['core'],
        'meta': {'trayui': {'version': version, 'kind': 'core', 'framework': 'html', 'page': f'{site}/docs/installation',
                            'assets': [{'url': f'../../fonts/{f}', 'target': f'{HTML_ROOT}/fonts/{f}'} for f in ('Onest-Variable.woff2', 'Onest-Variable.ttf')]}},
    }}
    with_script, dropped = [], {}
    for p in sorted((ROOT / 'project' / 'blocks').glob('*.html')):
        source = p.read_text(encoding='utf-8')
        title, desc, group = block_meta(source)
        name, comp = p.stem, pascal(p.stem)
        page = f'{site}/blocks/{name}'
        html_items[name] = {
            '$schema': SCHEMA_ITEM, 'name': name, 'type': 'registry:item', 'title': title, 'description': desc,
            'author': author, 'registryDependencies': [url('trayui', 'html/')],
            'files': [entry(f'project/blocks/{name}.html', f'{HTML_ROOT}/blocks/{name}.html', source)],
            'docs': f'The page links ../tokens.css, ../components/bundle.css and ../components/bundle.js: it works where it is, in trayui/blocks/. '
                    f'npx trayui add {name} puts it beside your pages instead, with its links pointed at trayui/. Its page: {page}',
            'categories': [c for c in [group.lower()] if c],
            'meta': {'trayui': {'version': version, 'kind': 'block', 'framework': 'html', 'page': page}},
        }
        tsx, info = block_to_tsx(source, comp)
        if info['scripts']:
            with_script.append(name)
        if info['warnings']:
            dropped[name] = info['warnings']
        react[name] = {
            '$schema': SCHEMA_ITEM, 'name': name, 'type': 'registry:item', 'title': title, 'description': desc,
            'author': author, 'registryDependencies': [url('core')],
            'files': [entry(f'project/blocks/{name}.html', f'{REACT_ROOT}/blocks/{comp}.tsx', tsx)],
            'docs': (f"import {{ {comp} }} from './components/trayui/blocks/{comp}'. " +
                     ("Its own page script runs once, as plain DOM code, in an effect (so the file starts with // @ts-nocheck): "
                      'rewrite it with React state when you make the screen yours. ' if info['scripts'] else '') + f'Its page: {page}'),
            'categories': [c for c in [group.lower()] if c],
            'meta': {'trayui': {'version': version, 'kind': 'block', 'framework': 'react', 'page': page, 'component': comp,
                                'pageScript': bool(info['scripts'])}},
        }

    for sub, pool, title in (('', react, 'trayui'), ('html/', html_items, 'trayui-html')):
        folder = out / 'r' / sub
        folder.mkdir(parents=True, exist_ok=True)
        for old in folder.glob('*.json'):
            old.unlink()
        index = []
        for n in sorted(pool):
            item = pool[n]
            (folder / f'{n}.json').write_text(json.dumps(item, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
            slim = {k: v for k, v in item.items() if k not in ('$schema', 'docs')}
            slim['files'] = [{k: v for k, v in f.items() if k != 'content'} for f in item['files']]
            index.append(slim)
        (folder / 'registry.json').write_text(json.dumps({'$schema': SCHEMA_REG, 'name': title, 'homepage': site, 'items': index},
                                                         indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    kinds = lambda pool: {k: sum(1 for i in pool.values() if i['meta']['trayui']['kind'] == k) for k in ('core', 'component', 'lib', 'block')}
    return {'version': version, 'base': base, 'react': len(react), 'html': len(html_items), 'react_kinds': kinds(react),
            'core_files': sorted(core_files), 'merged': merged, 'blocks_with_script': with_script, 'dropped': dropped}


# ---------- validation: shadcn's schemas, with a validator for the draft-07 keywords they use ----------

KEYWORDS = {'$schema', '$id', '$ref', 'description', 'title', 'default', 'examples', 'definitions', 'type', 'properties', 'required',
            'additionalProperties', 'items', 'enum', 'const', 'allOf', 'anyOf', 'oneOf', 'not', 'if', 'then', 'else'}
TYPES = {'string': lambda v: isinstance(v, str), 'number': lambda v: isinstance(v, (int, float)) and not isinstance(v, bool),
         'integer': lambda v: isinstance(v, int) and not isinstance(v, bool), 'boolean': lambda v: isinstance(v, bool),
         'object': lambda v: isinstance(v, dict), 'array': lambda v: isinstance(v, list), 'null': lambda v: v is None}


def schema_keywords(schema, where='#'):
    """Every keyword in a schema that this validator does not know: none, or a schema update needs a look."""
    bad = []
    if isinstance(schema, dict):
        for k, v in schema.items():
            if k not in KEYWORDS:
                bad.append(f'{where}/{k}')
            elif k in ('properties', 'definitions'):
                for name, sub in v.items():
                    bad += schema_keywords(sub, f'{where}/{k}/{name}')
            elif k in ('items', 'not', 'if', 'then', 'else', 'additionalProperties') and isinstance(v, dict):
                bad += schema_keywords(v, f'{where}/{k}')
            elif k in ('allOf', 'anyOf', 'oneOf'):
                for i, sub in enumerate(v):
                    bad += schema_keywords(sub, f'{where}/{k}/{i}')
    return bad


class Schemas:
    def __init__(self, folder=SCHEMAS):
        self.store = {SCHEMA_ITEM: json.loads((folder / 'registry-item.json').read_text(encoding='utf-8')),
                      SCHEMA_REG: json.loads((folder / 'registry.json').read_text(encoding='utf-8'))}
        unknown = [f'{u}: {k}' for u, s in self.store.items() for k in schema_keywords(s)]
        if unknown:
            raise SystemExit('tools/shadcn: the schemas use keywords tools/registry.py does not check: ' + ', '.join(unknown))

    def resolve(self, ref, root):
        doc, _, frag = ref.partition('#')
        target = self.store[doc] if doc else root
        node = target
        for part in [p for p in frag.split('/') if p]:
            node = node[part.replace('~1', '/').replace('~0', '~')]
        return node, target

    def errors(self, value, schema, root, path='$'):
        if schema is True or schema == {}:
            return []
        if schema is False:
            return [f'{path}: nothing is allowed here']
        out = []
        if '$ref' in schema:  # in draft 07 a $ref stands for the whole schema it sits in
            sub, sub_root = self.resolve(schema['$ref'], root)
            return self.errors(value, sub, sub_root, path)
        t = schema.get('type')
        if t is not None:
            names = t if isinstance(t, list) else [t]
            if not any(TYPES[n](value) for n in names):
                return [f'{path}: is {type(value).__name__}, the schema wants {t}']
        if 'enum' in schema and value not in schema['enum']:
            out.append(f'{path}: {value!r} is not one of {schema["enum"]}')
        if 'const' in schema and value != schema['const']:
            out.append(f'{path}: {value!r} is not {schema["const"]!r}')
        if isinstance(value, dict):
            props = schema.get('properties', {})
            for k in schema.get('required', []):
                if k not in value:
                    out.append(f'{path}: {k} is required')
            for k, v in value.items():
                if k in props:
                    out += self.errors(v, props[k], root, f'{path}.{k}')
                elif 'additionalProperties' in schema:
                    extra = schema['additionalProperties']
                    if extra is False:
                        out.append(f'{path}: {k} is not allowed')
                    elif isinstance(extra, dict):
                        out += self.errors(v, extra, root, f'{path}.{k}')
        if isinstance(value, list) and isinstance(schema.get('items'), dict):
            for i, v in enumerate(value):
                out += self.errors(v, schema['items'], root, f'{path}[{i}]')
        for sub in schema.get('allOf', []):
            out += self.errors(value, sub, root, path)
        if 'anyOf' in schema and not any(not self.errors(value, s, root, path) for s in schema['anyOf']):
            out.append(f'{path}: matches none of anyOf')
        if 'oneOf' in schema:
            n = sum(1 for s in schema['oneOf'] if not self.errors(value, s, root, path))
            if n != 1:
                out.append(f'{path}: matches {n} of oneOf, not one')
        if 'not' in schema and not self.errors(value, schema['not'], root, path):
            out.append(f'{path}: matches what "not" forbids')
        if 'if' in schema:
            branch = 'then' if not self.errors(value, schema['if'], root, path) else 'else'
            if branch in schema:
                out += self.errors(value, schema[branch], root, path)
        return out

    def item(self, value):
        return self.errors(value, self.store[SCHEMA_ITEM], self.store[SCHEMA_ITEM])

    def registry(self, value):
        return self.errors(value, self.store[SCHEMA_REG], self.store[SCHEMA_REG])


def validate(r, schemas=None):
    """Problems with the registry written at r (the folder holding registry.json and html/): an empty list when it is
    right. Checks every file against shadcn's schemas and the rules of a flat universal registry."""
    r = Path(r)
    schemas = schemas or Schemas()
    problems, names = [], {}
    for sub in ('', 'html/'):
        folder = r / sub
        if not (folder / 'registry.json').exists():
            problems.append(f'{sub}registry.json is missing')
            continue
        reg = json.loads((folder / 'registry.json').read_text(encoding='utf-8'))
        problems += [f'{sub}registry.json: {e}' for e in schemas.registry(reg)]
        if not reg.get('name') or not reg.get('homepage'):
            problems.append(f'{sub}registry.json: a root registry names itself and its homepage')
        listed = [it.get('name') for it in reg.get('items', [])]
        if len(set(listed)) != len(listed):
            problems.append(f'{sub}registry.json: an item is listed twice')
        for it in reg.get('items', []):
            if any('content' in f for f in it.get('files', [])):
                problems.append(f'{sub}registry.json: {it["name"]} carries file content in the index')
            if not (folder / f'{it.get("name")}.json').exists():
                problems.append(f'{sub}registry.json lists {it.get("name")}, which has no file')
        files = sorted(p for p in folder.glob('*.json') if p.name != 'registry.json')
        names[sub] = {p.stem: json.loads(p.read_text(encoding='utf-8')) for p in files}
        for stem, item in names[sub].items():
            where = f'{sub}{stem}.json'
            problems += [f'{where}: {e}' for e in schemas.item(item)]
            if item.get('name') != stem:
                problems.append(f'{where}: its name is {item.get("name")}')
            if stem not in listed:
                problems.append(f'{where}: not listed in {sub}registry.json')
            if item.get('type') != 'registry:item' or not all(f.get('type') == 'registry:file' and str(f.get('target', '')).startswith('~/') for f in item.get('files', [])):
                problems.append(f'{where}: not a universal item (type registry:item, every file registry:file with a target from ~/)')
            if not item.get('files') or not all(isinstance(f.get('content'), str) and f['content'] for f in item['files']):
                problems.append(f'{where}: a file without content')
            if not item.get('title') or not item.get('description'):
                problems.append(f'{where}: no title or description')
            if not (item.get('meta') or {}).get('trayui', {}).get('version'):
                problems.append(f'{where}: no meta.trayui.version')
            for d in item.get('registryDependencies', []):
                rest = d.split('/r/', 1)[1] if '/r/' in d else None
                if not rest or not (r / rest).exists():
                    problems.append(f'{where}: depends on {d}, which is not in this registry')
    blocks = {p.stem for p in (ROOT / 'project' / 'blocks').glob('*.html')}
    for sub in ('', 'html/'):
        got = {n for n, i in names.get(sub, {}).items() if i.get('meta', {}).get('trayui', {}).get('kind') == 'block'}
        if got != blocks:
            problems.append(f'{sub or "r/"}: {len(got)} blocks, the system has {len(blocks)}: missing {sorted(blocks - got)[:5]}, extra {sorted(got - blocks)[:5]}')
    comps = {p.stem for p in (ROOT / 'react' / 'src' / 'components').glob('*.tsx')}
    carried = {c for i in names.get('', {}).values() for c in i.get('meta', {}).get('trayui', {}).get('components', [])}
    if comps - carried:
        problems.append(f'r/: no item carries the components {sorted(comps - carried)[:6]}')
    return problems


def main():
    ap = argparse.ArgumentParser(description='Write or check the Tray UI registry in shadcn\'s format.')
    ap.add_argument('--out', help='write DIR/r/')
    ap.add_argument('--base', help='the address r/ is served at (default: <site>/r from tools/links.json)')
    ap.add_argument('--check', help='check the registry written at this r/ folder')
    args = ap.parse_args()
    if not args.out and not args.check:
        ap.error('give --out DIR or --check DIR/r')
    if args.out:
        print(json.dumps(write(Path(args.out), args.base), indent=1))
    if args.check:
        problems = validate(Path(args.check))
        count = sum(1 for _ in Path(args.check).glob('*.json')) + sum(1 for _ in Path(args.check, 'html').glob('*.json'))
        print(f'{count} files checked against shadcn\'s registry-item.json and registry.json: '
              + ('valid' if not problems else f'{len(problems)} problems'))
        for p in problems[:40]:
            print('PROBLEM', p)
        return 1 if problems else 0
    return 0


if __name__ == '__main__':
    sys.exit(main())
