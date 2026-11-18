# Add with a CLI

`npx trayui` puts the system into a project: the three files and the font, a block beside your pages, or in React the source of a component or a block, which is then yours to change. It needs Node 18 or later and nothing else, and it never overwrites a file you have changed unless you ask it to.

## In a folder of HTML pages

```sh
npx trayui init
npx trayui add login-01
```

`init` writes the three files, the font and their licences into a `trayui/` folder. `add` puts a block beside your pages, here `login-01.html`, with its links pointed at that folder, so it opens as it is. `--pages <folder>` puts the block in another folder, and its links follow. The folder needs no `package.json`.

`npx trayui list` names every block. A component in plain HTML is markup rather than a file: copy it from its page, such as [Button](#c-button).

## In React

```sh
npx trayui init
npx trayui add button tabs login-01
```

In a project whose `package.json` lists React, such as a Vite or a Next.js app, the same commands copy source files into `src/components/trayui/`, or `components/trayui/` when there is no `src/` folder:

- `init` copies the core every component needs (the helpers, the behaviours as a module, the icons), installs the `trayui` package for the stylesheet and the font, and imports the stylesheet once, in `src/main.tsx` or `app/layout.tsx`.
- `add` copies components and blocks, with the files they need. A block becomes a React component with the same markup and classes, whose behaviours are wired once it is mounted.
- `index.ts` in the folder exports all of it: `import { Button, Login01 } from './components/trayui'`.

The files are yours: rename them, change them, delete what you do not use. Components that keep state start with `'use client'`, so a Server Component in Next.js can use them as they are. The project's own package manager installs what they need: npm, pnpm, yarn or bun. To use the package instead of copies, see [React](#d-react).

## Updates and your changes

`trayui.json`, at the root of the project, records what was added and a fingerprint of each file as it was written.

- `npx trayui update` brings every file it added to the current release, and keeps each one you changed. It names those it kept.
- `npx trayui diff` shows, file by file, what you changed and what the release changed, with the lines.
- `--overwrite` replaces the files you changed with the release's. `--dry-run` says what would be written and writes nothing.

## Check the markup

```sh
npx trayui check index.html pages/
```

It reads plain HTML and reports classes, behaviours and icons that do not exist, more than one yellow button in a view, buttons and fields without a name, missing `autocomplete`, references to ids that are not there, tabs wired wrong, skipped headings, literal colours and sizes, and a page without its language, its theme or the three files in order. It exits with 1 when it finds an error, so it can run in CI; `--json` gives the findings to another tool. It cannot see the page: look at it as well, at 1280, 768 and 390 pixels wide, in a light and a dark theme.

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

| Option | What it does |
| --- | --- |
| `--react`, `--html` | Choose React or plain HTML when the project does not say |
| `--dir <folder>` | Where the system's files go (`trayui`, or `src/components/trayui` in React) |
| `--pages <folder>` | Where a block's page goes in plain HTML (the project's folder by default) |
| `--overwrite` | Replace files you changed |
| `--dry-run` | Say what would be written, and write nothing |
| `--no-install` | Do not run the package manager |
| `--registry <address or folder>` | Where the items come from: {{site}}/r by default, or a folder, to work offline |
| `--cwd <folder>` | The project, when it is not the folder you are in |

`npx trayui --help` lists them all, and `npx trayui <command> --help` explains one.

## With the shadcn CLI

The same items make a registry in shadcn's format: {{site}}/r/registry.json lists the React items, {{site}}/r/html/registry.json the plain HTML ones. Each file goes to a path of its own, so no `components.json` and no Tailwind are needed:

```sh
npx shadcn@latest add {{site}}/r/login-01.json
npx shadcn@latest add {{site}}/r/html/login-01.json
```

The shadcn CLI cannot bring the font of the plain HTML files, which is not text: copy `fonts/` from the download on [Installation](#d-installation), or run `npx trayui init`, which does. In React the font comes with the `trayui` package.

## For an agent

An agent can run the same commands, and check what it wrote with `npx trayui check`. `npx trayui skill` gives it the skill, which holds the rules, a page for every component and block, and the checker; [The agent skill](#d-skill) says more.
