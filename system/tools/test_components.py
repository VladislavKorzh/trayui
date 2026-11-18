#!/usr/bin/env python3
"""Test every component against what its README promises, in Chrome, several at a time.

    python3 tools/test_components.py                    every component, in parallel
    python3 tools/test_components.py Tabs Select        only these
    python3 tools/test_components.py --group Forms      one group (the group= of the preview's marker; Blocks for the blocks and templates)
    python3 tools/test_components.py --blocks           only the blocks and templates (dashboard-01 or inbox names one); --no-blocks leaves them out
    python3 tools/test_components.py Tabs -k keys       only the steps whose name holds "keys" (generic, PARITY, test_keys, ...)
    python3 tools/test_components.py --no-generic       leave out the checks every component gets (faster while writing a test)
    python3 tools/test_components.py --no-react         leave out the React previews and the parity checks
    python3 tools/test_components.py --jobs 4           how many Chromes run at once (default: the processors, at most 8)
    python3 tools/test_components.py -v                 print every check, not only those that fail
    python3 tools/test_components.py --json out.json    also write every result
    python3 tools/test_components.py --build Tabs       first run tools/build.py, once no other build is running
    python3 tools/test_components.py --build-only       only that

Every run also checks the 64 blocks of project/blocks and the 10 templates of project/templates (harness.run_block: no
script error, every label names its control, axe in Light and Dark at 390 and 1440px; what a block or a template is
excused is in tests/blocks.py). Each component has a module in
tests/components/<Name>.py; tests/harness.py says what every component is checked for
(the accessibility scan in Light and Dark, the layout at 390 and 1440px, the targets, the React preview) and what a module
adds: the accessibility tree, the keys, the focus, the events, the motion and the forced colours its README speaks of, and
parity with its React twin. It tests the built files (dist/ and react/src): run tools/build.py after changing src/.

It needs what the other browser checks need (Python with requirements.txt, Google Chrome through Playwright), Node and
react/node_modules for the React previews, and axe-core, which it installs into tests/node_modules the first time
(npm ci, from tests/package-lock.json). Exits 1 when a check fails; a check a module marks XFAIL is reported apart.
"""
import json, multiprocessing as mp, os, pathlib, shutil, subprocess, sys, time

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tests'))
import harness  # noqa: E402

_browser = None


def _init():
    global _browser
    _browser = harness.Browser()


def _run(job):
    name, group, only, skip_generic, react = job
    try:
        if group == harness.BLOCKS:
            results, took = harness.run_block(_browser, name, only)
        else:
            results, took = harness.run_component(_browser, name, group, only, skip_generic, react)
    except Exception as e:  # the browser itself failed: start it again for the next component
        results, took = [{'component': name, 'group': group, 'kind': 'html', 'fn': 'harness', 'check': 'the harness ran', 'ok': False,
                          'detail': f'{type(e).__name__}: {e}'[:600], 'xfail': None}], 0
        try:
            _browser.close()
        except Exception:
            pass
        _init()
    return name, results, took


def build():
    """Run tools/build.py once no other build, check or site build is running (they write the same files), one at a time
    among the runners that ask for it (a lock in .cache/tests)."""
    import fcntl
    lock = ROOT / '.cache' / 'tests' / 'build.lock'
    lock.parent.mkdir(parents=True, exist_ok=True)
    with open(lock, 'w') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        waited = 0
        while subprocess.run(['pgrep', '-f', 'tools/(build|check|site).py'], capture_output=True).stdout.strip():
            if waited == 0:
                print('waiting for another build to end', flush=True)
            time.sleep(2); waited += 2
            if waited > 900:
                sys.exit('another build has run for 15 minutes: not building')
        done = subprocess.run([sys.executable, 'tools/build.py'], cwd=ROOT)
        if done.returncode:
            sys.exit(f'tools/build.py failed (exit {done.returncode})')


def setup(react):
    if not harness.AXE.exists():
        print('installing axe-core into tests/node_modules (npm ci)', flush=True)
        subprocess.run(['npm', 'ci', '--no-audit', '--no-fund', '--silent'], cwd=ROOT / 'tests', check=True)
    if react:
        if not (ROOT / 'react' / 'node_modules' / 'esbuild').exists():
            print('installing the React package (npm ci in react/)', flush=True)
            subprocess.run(['npm', 'ci', '--no-audit', '--no-fund', '--silent'], cwd=ROOT / 'react', check=True)
        out = pathlib.Path(os.environ['TRAY_TEST_REACT'])
        done = subprocess.run(['node', str(ROOT / 'tests' / 'react.mjs'), '--out', str(out)], cwd=ROOT, capture_output=True, text=True)
        if done.returncode:
            print(done.stderr.strip())
            print('the React previews did not bundle: every React check will fail', flush=True)


def main(argv):
    def take(flag, default=None):
        nonlocal argv
        if flag in argv:
            i = argv.index(flag); v = argv[i + 1]; argv = argv[:i] + argv[i + 2:]; return v
        return default
    if '--build' in argv or '--build-only' in argv:
        build()
        if '--build-only' in argv:
            return 0
    argv = [a for a in argv if a not in ('--build', '--build-only')]
    verbose = '-v' in argv
    skip_generic = '--no-generic' in argv
    react = '--no-react' not in argv
    only_blocks, no_blocks = '--blocks' in argv, '--no-blocks' in argv
    argv = [a for a in argv if a not in ('-v', '--no-generic', '--no-react', '--blocks', '--no-blocks')]
    group = take('--group')
    only = [k for k in [take('-k')] if k]
    out = take('--json')
    jobs = int(take('--jobs', 0) or 0) or min(8, os.cpu_count() or 4)
    every = harness.components()
    for b in harness.blocks():
        every[b] = harness.BLOCKS
    unknown = [a for a in argv if a not in every]
    if unknown:
        sys.exit(f'not a component, a block or a template: {", ".join(unknown)}')
    if argv:
        names = argv
    elif only_blocks:
        names = harness.blocks()
    else:  # every component, then (unless a group is asked for, or --no-blocks) every block
        names = [n for n, g in every.items() if (g.lower() == group.lower() if group else (g != harness.BLOCKS or not no_blocks))]
    if not names:
        sys.exit(f'no component in the group {group!r}')
    start = time.time()
    # this run's own folder for the React pages, so runs at the same time do not wipe each other's; old ones are cleared
    cache = ROOT / '.cache' / 'tests'
    cache.mkdir(parents=True, exist_ok=True)
    for old in cache.glob('react-*'):
        if time.time() - old.stat().st_mtime > 3 * 3600:
            shutil.rmtree(old, ignore_errors=True)
    os.environ['TRAY_TEST_REACT'] = str(cache / f'react-{os.getpid()}')
    harness.REACT_OUT = pathlib.Path(os.environ['TRAY_TEST_REACT'])
    try:
        return run(names, every, only, skip_generic, react, out, verbose, jobs, start)
    finally:
        shutil.rmtree(os.environ['TRAY_TEST_REACT'], ignore_errors=True)


def run(names, every, only, skip_generic, react, out, verbose, jobs, start):
    setup(react and any(every[n] != harness.BLOCKS for n in names))
    jobs = max(1, min(jobs, len(names)))
    # the biggest previews first, so the last to finish are short ones
    size = lambda n: (harness.page_file(n) if every[n] == harness.BLOCKS else (harness.COMPONENTS / n / 'preview.html')).stat().st_size
    work = sorted(names, key=lambda n: -size(n))
    todo = [(n, every[n], only, skip_generic, react) for n in work]
    allres, times = [], {}
    if jobs == 1:
        _init()
        for job in todo:
            n, res, took = _run(job); allres += res; times[n] = took; report(n, res, took, verbose)
        _browser.close()
    else:
        with mp.get_context('spawn').Pool(jobs, initializer=_init) as pool:
            for n, res, took in pool.imap_unordered(_run, todo):
                allres += res; times[n] = took; report(n, res, took, verbose)
    took = time.time() - start
    fails = [r for r in allres if not r['ok'] and not r['xfail']]
    xfails = [r for r in allres if not r['ok'] and r['xfail']]
    xpass = [r for r in allres if r['ok'] and r['xfail']]
    by = lambda rs, k: sum(1 for r in rs if r['kind'] == k)
    nb = sum(1 for n in names if every[n] == harness.BLOCKS)
    print(f'\n{len(names) - nb} components and {nb} blocks and templates, {len(allres)} checks ({by(allres, "html")} of the system, {by(allres, "react")} of the React previews, '
          f'{by(allres, "parity")} of parity, {by(allres, "block")} of the blocks) in {took:.0f}s with {jobs} at a time')
    print(f'{len(fails)} failed ({by(fails, "html")} system, {by(fails, "react")} React, {by(fails, "parity")} parity, {by(fails, "block")} blocks)'
          + (f', {len(xfails)} known to fail (XFAIL)' if xfails else '') + (f', {len(xpass)} marked XFAIL now pass: take them out' if xpass else ''))
    if xfails and verbose:
        for r in xfails:
            print(f"  XFAIL {r['component']}: {r['check']} ({r['xfail']})")
    for r in xpass:
        print(f"  XPASS {r['component']}: {r['check']}")
    if out:
        pathlib.Path(out).write_text(json.dumps({'took': took, 'times': times, 'results': allres}, indent=1), encoding='utf-8')
    return 1 if fails else 0


def report(name, res, took, verbose):
    bad = [r for r in res if not r['ok'] and not r['xfail']]
    print(f"{'FAIL' if bad else 'ok  '} {name:<24} {len(res):>3} checks {took:5.1f}s" + (f'  {len(bad)} failed' if bad else ''), flush=True)
    for r in res:
        if verbose or (not r['ok'] and not r['xfail']):
            mark = 'ok' if r['ok'] else ('XFAIL' if r['xfail'] else 'FAIL')
            print(f"     {mark:<5} [{r['kind']}:{r['fn']}] {r['check']}" + (f"\n           {r['detail']}".replace('\n', '\n           ') if r['detail'] else ''), flush=True)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
