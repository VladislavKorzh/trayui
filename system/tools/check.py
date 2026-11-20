#!/usr/bin/env python3
"""Build the system and the site, then run every check, in order, and stop at the first that fails.

    python3 tools/check.py           everything: what CI runs
    python3 tools/check.py --fast    the build and the checks that need no browser

It needs Python 3.12 with system/requirements.txt, Node 20.19 or later (the CLI check builds Vite and Next.js apps), and Google Chrome (the browser checks drive it
through Playwright). Each step is one of the tools in this folder; their own docstrings say what they look at.
"""
import pathlib, subprocess, sys, time

ROOT = pathlib.Path(__file__).resolve().parent.parent
PY = sys.executable

STEPS = [
    ('build the system', [PY, 'tools/build.py'], ROOT, False),
    ('build the site', [PY, 'tools/site.py'], ROOT, False),
    ('test the markup checker and npx trayui kit', ['node', 'cli/test.mjs'], ROOT, False),
    ('measure the themes', [PY, 'tools/themes.py', '--check'], ROOT, False),
    ('type-check the React package', ['npm', 'run', '--silent', 'check'], ROOT / 'react', False),
    ('build the React package', ['npm', 'run', '--silent', 'build'], ROOT / 'react', False),
    ('drive the previews', [PY, 'tools/smoke.py'], ROOT, True),
    ('render the playgrounds', [PY, 'tools/play_check.py'], ROOT, True),
    ('render the blocks and templates', [PY, 'tools/pages.py'], ROOT, True),
    ('render the previews', [PY, 'tools/shoot.py'], ROOT, True),
    ('check the dialog feet', [PY, 'tools/feet.py'], ROOT, True),
    ('test the components', [PY, 'tools/test_components.py'], ROOT, True),
    ('check the site', [PY, 'tools/site_check.py'], ROOT, True),
    ('prove the registry and the CLI', [PY, 'tools/cli_check.py'], ROOT, True),
]


def main():
    fast = '--fast' in sys.argv
    for name, cmd, cwd, browser in STEPS:
        if fast and browser:
            continue
        print(f'\n== {name}: {" ".join(c if c != PY else "python3" for c in cmd)}', flush=True)
        start = time.time()
        done = subprocess.run(cmd, cwd=cwd)
        if done.returncode:
            print(f'\nFAILED: {name} (exit {done.returncode})')
            return done.returncode
        print(f'   ok in {time.time() - start:.0f}s', flush=True)
    print('\nall checks pass')
    return 0


if __name__ == '__main__':
    sys.exit(main())
