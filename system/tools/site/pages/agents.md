# For AI agents

The system is written to be read by an agent as well as by a person: short rules, exact names, and markup that can be copied. This page says what to give an agent, and what to ask of it.

## Give it the skill

The skill is a folder an agent reads when a task touches Tray UI: `SKILL.md` with the rules it breaks most, every page of this site as Markdown, and a checker it runs on the HTML it writes. It works offline. Install it once, in one of these ways.

- **Claude Code**, as a plugin that updates with the site: run `claude plugin marketplace add {{site}}/skills/marketplace.json`, then `claude plugin install trayui@trayui`. For one session only: `claude --plugin-dir trayui.zip`.
- **claude.ai**: download [trayui.zip](skills/trayui.zip) and upload it as a skill, under Skills in the settings.
- **In a project**, for Claude Code and the other agents that read `SKILL.md` from a folder: run `npx trayui skill`, which copies it into `.claude/skills/trayui`, or `npx trayui skill --agents` for `.agents/skills/trayui`. Unzipping `trayui.zip` into the same place does the same. The `trayui` package on npm also carries it, in `skills/trayui`.

The skill names the release it was made from. Once it is installed, ask for a screen as you would ask anyone: "Build the order history page of a shop with Tray UI". The agent starts from the nearest block, reads the pages of the components it uses, and runs `node scripts/check.mjs` (or `npx trayui check`) on its page before it hands it over.

## Or give it the pages

- [llms.txt](llms.txt) is the index: what Tray UI is, the three lines that install it, and a link to every page. It is short enough to paste into a prompt.
- [llms-full.txt](llms-full.txt) holds the whole system in one file: the rules of the brand book, the guides (grounds, behaviour, accessibility, page layouts), theming, React, the index of components and the guidelines of every component with its markup.
- Every page of this site is also Markdown at its own address with `.md` added: the page of the button is at `/components/button`, its Markdown at `/components/button.md`. A block's Markdown holds its whole page of HTML, and a chart's holds its React file. Each page names its Markdown in its head, as `<link rel="alternate" type="text/markdown">`.

An agent that can fetch pages needs only the address of llms.txt. One that cannot needs the skill, llms-full.txt, or the Markdown of the pages the task touches, pasted in.

## Connect it to a tool

1. In a chat, attach llms-full.txt, or paste llms.txt and let the agent fetch the pages it lists.
2. In an editor with an agent (Cursor, Windsurf, Claude Code, Copilot), add the address of llms.txt as a documentation source where the tool allows one, or save llms-full.txt into the project and point the agent at it from its rules file (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules`).
3. In a project of your own, run `npx trayui init` (or copy the three files in) and tell the agent where they are, so it links them instead of a CDN. It can add blocks with `npx trayui add`, as [Add with a CLI](#d-cli) describes.

## What to tell the agent

- Link the three files; write plain HTML with `tray-` classes; attach behaviour with `data-tray`.
- Start a screen from the nearest block, not from an empty page.
- Follow the brand book: one yellow per view, depth by fill, selected is solid ink, sentence case, buttons that start with a verb.
- Use only classes that exist. If a layout needs a value that no class gives, use a token (`var(--space-6)`), never a literal colour or size.
- Check the result at 1280, 768 and 390 pixels in a light and a dark theme.
{{#npm}}- From npm, the files are `trayui` and React is `trayui-react`; an agent that installs them needs nothing else from the system.{{/npm}}{{^npm}}- The React package, `trayui-react`, is not on npm yet. An agent should not install a package of that name from npm: it would not be this one.{{/npm}}

## A prompt to start from

```text
Build the order history page of a shop with Tray UI.
Read {{site}}/llms.txt first, then the pages it lists for the
components you use. Start from the closest block (a table page), link
tokens.css, components/bundle.css and components/bundle.js, and use only
tray- classes and tokens that exist. One yellow button per view.
Give me one HTML file, then check it at 1280, 768 and 390 px wide.
```

## What it gets right, and what to check

An agent that has read the guidelines writes the right markup for a component: the classes, the attributes and the ARIA. What it gets wrong most often is the page around the components: two yellow buttons in one view, a colour or a size typed by hand, a heading level skipped, a class that sounds right but does not exist. `npx trayui check page.html` finds those, and the skill has the agent run it; what it cannot see, ask the agent to check against the brand book, and look at the page in a dark theme yourself.
