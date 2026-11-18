# The agent skill

The skill is a folder an agent reads when a task touches Tray UI: the rules it breaks most, every page of this site as Markdown, and a checker it runs on the HTML it writes. It holds Tray UI {{version}}, works offline, and runs nothing by itself.

## In Claude Code

As a plugin, for every project, updated with the site:

```sh
claude plugin marketplace add {{site}}/skills/marketplace.json
claude plugin install trayui@trayui
```

For one project only, run `npx trayui skill` in it. It copies the skill into `.claude/skills/trayui`, where Claude Code finds it when it starts in that folder, and there it is also `/trayui`, to call by hand. Commit the folder, and everyone who works on the project has the skill.

For one session, without installing anything: `claude --plugin-url {{site}}/skills/trayui.zip`.

## In claude.ai

Download [trayui.zip](skills/trayui.zip) and upload it under Settings, Capabilities, Skills. Claude then reads it when a chat asks for a screen in Tray UI.

## In other agents

An agent that reads skills from a folder (`SKILL.md` and the files beside it) uses the same one:

- `npx trayui skill --agents` copies it into `.agents/skills/trayui`, and `--dir <folder>` into the folder you name.
- Without Node, unzip `trayui.zip` there yourself. After `npm install trayui` it is also in `node_modules/trayui/skills/trayui`.

An agent that reads no skills can still use it: say in its rules file (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules`) to read the skill's `SKILL.md` before a task that touches Tray UI.

## What is in it

- `SKILL.md`: when to use the skill, and how to build with the system on one page: the three files, the conventions, the rules agents break most, the accessibility the markup must carry, and the check before handing a page over.
- `references/`: every page of this site as Markdown, by the same path as its address, so the page at `/components/button` is `references/components/button.md`. The {{components}} components with their markup and Accessibility sections, the {{blocks}} blocks each as a whole page of HTML, the docs, the foundations, the guides and the charts.
- `scripts/check.mjs`: the markup checker, one file with no dependencies (Node 18 or later).
- `scripts/rules.json`: its rules, the classes, behaviours and icons of this release.

The zip puts a manifest, a README and an icon around the same folder, which make it a Claude Code plugin. The changelog and the pages about agents stay out: the skill holds how to build, not the story of the system.

## How an agent uses it

An agent loads the skill when the task fits: the user names Tray UI, the project links `tokens.css` and `components/bundle.css` or depends on `trayui` or `trayui-react`, or the task is a screen in the system, such as a sign-in page, a dashboard or a table. Then it works in this order:

1. It starts from the nearest block, never from an empty page: it picks one in `references/blocks.md` and reads its page.
2. It reads the page of each component before it writes it, and copies the markup and the ARIA as they are written there.
3. It follows the rules: one yellow per view, selected is solid ink, only classes that exist, tokens instead of literal values, sentence case, buttons that start with a verb.
4. It runs the checker on every page it wrote, fixes what it finds, and says what the checker cannot see.

It fetches a page from this site only when the skill does not hold it.

## The checker

`scripts/check.mjs` is the checker that `npx trayui check` runs, carried in the skill so an agent needs no npm to use it:

```sh
node .claude/skills/trayui/scripts/check.mjs page.html
```

It takes files, folders (every `.html` in them), or `-` for markup on standard input, and exits with 1 when a file has an error; `--json` gives the findings to another tool. On a card with two yellow buttons, one of them saying OK, and an icon button with no name and an icon that is not built in, it says (the messages are shortened here):

```text
card.html: 2 errors, 2 warnings
  error   line 5    A button with no text needs an aria-label that says what it does.  [button-name]
  error   line 6    #tray-i-trash is not one of the icons built in. Near it: hash, trash-2, tag.  [unknown-icon]
  warning line 4    2 yellow (primary) buttons in the page, on lines 3, 4.  [one-yellow]
  warning line 4    Button text "OK": start with a verb and name the outcome.  [button-words]
```

| It finds, as errors | It finds, as warnings |
| --- | --- |
| A class, a behaviour or an icon that Tray UI does not have | More than one yellow button in a view |
| A button, a field or an image without a name or `alt` | Buttons that say OK, Submit or Yes, and exclamation marks |
| `tray-btn` on an element that is not a button or a link | A heading level skipped |
| A reference to an id that is not there, and an id used twice | A literal colour or size, and a `<style>` of its own |
| Tabs wired wrong | Classes from another system, and state kept in a class |
| A page without its language, or the three files missing or out of order | A field without `autocomplete`, a button without `type`, a page without a viewport or a theme |

It cannot see the page. Look at it as well, at 1280, 768 and 390 pixels wide, in a light and a dark theme, and tab through it.

## Ask for a screen

Once the skill is installed, ask for a screen as you would ask anyone, and give it what is yours: the name, the words, the data.

```text
Build the order history page of a shop with Tray UI.

Turn the login-01 block into the sign-in page of our notes app.
People sign in with their email.

Check every page in pages/ with the Tray UI checker and fix
what it finds.
```

The invented brands of the blocks, Counter and Perly Farm, are examples: the skill tells the agent to replace their names, prices and quotes with yours.

## Keep it current

`SKILL.md` names the release it was made from, under `metadata`. Each release of Tray UI brings a new skill:

- **The plugin**: run `claude plugin marketplace update trayui`, then `claude plugin update trayui@trayui`, and start Claude Code again. The marketplace pins the zip by its digest, so any change to the skill is an update.
- **A copy in a project**: run `npx trayui@latest skill` again. `trayui.json` records every file it wrote, so a file you changed is kept and named; `--overwrite` replaces it, and `--dry-run` says what would change.
- **claude.ai**: upload the new zip in place of the old one.

Keep the project's own rules, its names and what not to touch, in `CLAUDE.md` or `AGENTS.md` rather than in `SKILL.md`: an update keeps a `SKILL.md` you changed, which then stays on the old release.
