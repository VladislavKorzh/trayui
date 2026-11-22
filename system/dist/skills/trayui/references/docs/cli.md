# Add with a CLI

`npx trayui@0.4.1` puts the system into a project: the three files and the font, a block beside your pages, or in React the source of a component or a block, which is then yours to change. It needs Node 18 or later and nothing else, and it never overwrites a file you have changed unless you ask it to.

## In a folder of HTML pages

```sh
npx trayui@0.4.1 init
npx trayui@0.4.1 add login-01
```

`init` writes the three files, the font and their licences into a `trayui/` folder. `add` puts a block beside your pages, here `login-01.html`, with its links pointed at that folder, so it opens as it is. `--pages <folder>` puts the block in another folder, and its links follow. The folder needs no `package.json`.

`npx trayui@0.4.1 list` names every block. A component in plain HTML is markup rather than a file: copy it from its page, such as [Button](https://trayui.com/components/button.md).

## In React

```sh
npx trayui@0.4.1 init
npx trayui@0.4.1 add button tabs login-01
```

In a project whose `package.json` lists React, such as a Vite or a Next.js app, the same commands copy source files into `src/components/trayui/`, or `components/trayui/` when there is no `src/` folder:

- `init` copies the core every component needs (the helpers, the behaviours as a module, the icons), installs the `trayui` package for the stylesheet and the font, and imports the stylesheet once, in `src/main.tsx` or `app/layout.tsx`.
- `add` copies components and blocks, with the files they need. A block becomes a React component with the same markup and classes, whose behaviours are wired once it is mounted.
- `index.ts` in the folder exports all of it: `import { Button, Login01 } from './components/trayui'`.

The files are yours: rename them, change them, delete what you do not use. Components that keep state start with `'use client'`, so a Server Component in Next.js can use them as they are. The project's own package manager installs what they need: npm, pnpm, yarn or bun. To use the package instead of copies, see [React](https://trayui.com/docs/react.md).

## Updates and your changes

`trayui.json`, at the root of the project, records what was added and a fingerprint of each file as it was written.

- `npx trayui@0.4.1 update` brings every file it added to the current release, and keeps each one you changed. It names those it kept.
- `npx trayui@0.4.1 diff` shows, file by file, what you changed and what the release changed, with the lines.
- `--overwrite` replaces the files you changed with the release's. `--dry-run` says what would be written and writes nothing.

## Check the markup

```sh
npx trayui@0.4.1 check index.html pages/
```

It reads plain HTML and reports classes, behaviours and icons that do not exist, more than one yellow button in a view, buttons and fields without a name, missing `autocomplete`, references to ids that are not there, tabs wired wrong, skipped headings, literal colours and sizes, and a page without its language, its theme or the three files in order. It exits with 1 when it finds an error, so it can run in CI; `--json` gives the findings to another tool. A project with classes of its own names their start with `--prefix` (`--prefix kit-`, or `--prefix kit-,app-` for more), and they are no longer reported as foreign. It cannot see the page: look at it as well, at 1280, 768 and 390 pixels wide, in a light and a dark theme.

## A kit

The paid kits from https://trayui.com/kits are whole sites and apps built with Tray UI. With the licence key from your licence mail, `kit` downloads one and unpacks it:

```sh
read -rs TRAYUI_KEY && export TRAYUI_KEY   # paste the key, then Enter: it is not shown, nor kept in the history
npx trayui@0.4.1 kit --list                      # the kits your licence opens, with their versions and editions
npx trayui@0.4.1 kit <name>                      # the HTML edition, into <name>-html/
npx trayui@0.4.1 kit <name> --react              # the React edition, into <name>-react/
```

`--key <key>` gives the key on the command line instead, where your shell keeps it in its history; the command never prints it. The key is also on https://trayui.com/kits/account. `--dir <folder>` unpacks the kit in another folder. Before it writes a file, the command checks the download against its sha256 and every path in the archive, so nothing lands outside the kit's folder. It stops when that folder already holds files, unless you add `--force`, which writes the kit's files over them and keeps the others. Then it says how to start: open `index.html`, or `cd` into the folder, `npm install` and `npm run dev`, as the kit's `package.json` has it.

## The commands

| Command | What it does |
| --- | --- |
| `init` | The three files and the font (plain HTML), or the core and the stylesheet (React) |
| `add <name>…` | Blocks, and in React components, with what they need |
| `update [<name>…]` | Everything added, or the items named, brought to the current release; your changes are kept |
| `diff [<name>…]` | What you changed and what the release changed, file by file |
| `list` | Every item there is to add |
| `check <file or folder>…` | The markup checked against the system's rules |
| `skill` | The skill for agents, copied into `.claude/skills/trayui` (`--agents` for `.agents/skills/trayui`) |
| `kit <name>` | A paid kit from https://trayui.com/kits, unpacked into `<name>-html/`, or `<name>-react/` with `--react`; `--list` names those your licence opens |

| Option | What it does |
| --- | --- |
| `--react`, `--html` | Choose React or plain HTML when the project does not say |
| `--dir <folder>` | Where the system's files go (`trayui`, or `src/components/trayui` in React) |
| `--pages <folder>` | Where a block's page goes in plain HTML (the project's folder by default) |
| `--overwrite` | Replace files you changed |
| `--dry-run` | Say what would be written, and write nothing |
| `--no-install` | Do not run the package manager |
| `--registry <address or folder>` | Where the items come from: https://trayui.com/r by default, or a folder, to work offline |
| `--cwd <folder>` | The project, when it is not the folder you are in |
| `--key <key>` | `kit`: your licence key, when it is not in the environment variable `TRAYUI_KEY` |
| `--react`, `--edition html` or `react` | `kit`: the edition (HTML by default) |
| `--dir <folder>` | `kit`: the folder the kit's folder goes in (this one by default) |
| `--force` | `kit`: unpack into a folder that already holds files |

`npx trayui@0.4.1 --help` lists them all, and `npx trayui@0.4.1 <command> --help` explains one.

## With the shadcn CLI

The same items make a registry in shadcn's format: https://trayui.com/r/registry.json lists the React items, https://trayui.com/r/html/registry.json the plain HTML ones. Each file goes to a path of its own, so no `components.json` and no Tailwind are needed:

```sh
npx shadcn@4.23.0 add https://trayui.com/r/login-01.json
npx shadcn@4.23.0 add https://trayui.com/r/html/login-01.json
```

The shadcn CLI cannot bring the font of the plain HTML files, which is not text: copy `fonts/` from the download on [Installation](https://trayui.com/docs/installation.md), or run `npx trayui@0.4.1 init`, which does. In React the font comes with the `trayui` package.

## For an agent

An agent can run the same commands, and check what it wrote with `npx trayui@0.4.1 check`. `npx trayui@0.4.1 skill` gives it the skill, which holds the rules, a page for every component and block, and the checker; [The agent skill](https://trayui.com/docs/skill.md) says more.
