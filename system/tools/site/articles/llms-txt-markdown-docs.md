# llms.txt and Markdown pages for AI agents

Give AI agents an llms.txt index and a Markdown copy of every page: the proposal, the full file, the .md address, the alternate link and who reads them.

A documentation page is built for a person: a sidebar, a theme menu, live examples, scripts. An agent that fetches it to answer a question has to dig the text back out of all that. The llms.txt proposal asks a site for two things: a short Markdown index at `/llms.txt`, and a clean Markdown copy of each page beside the page itself. Tray UI's build writes both, plus a third file with the whole system in it, and each page names its copy in its head.

## The proposal

Jeremy Howard published the proposal at llmstxt.org on 3 September 2024, and a second version in August 2026. Its reasoning: an HTML page "wraps its information in navigation, ads, and JavaScript, and converting it back into clean text is difficult and imprecise", and context windows "are still too small for most websites in their entirety". So the site writes a guide for agents itself.

The file is Markdown with a fixed order, so a program can parse it as well as a model can read it:

1. An H1 with the name of the project or site. The proposal calls it "the only required section".
2. A blockquote with a short summary, "containing key information necessary for understanding the rest of the file".
3. Any number of paragraphs or lists, but no headings.
4. Any number of H2 sections, each a "file list": a Markdown list where every item is a link, optionally followed by a colon and a note.

A section called "Optional" holds, by convention, "links an agent can skip when a shorter context is needed". The proposal expects agents "to view or search `llms.txt` to find the information they need, then follow the relevant links", so the file stays small and the detail lives behind the links.

## The index Tray UI writes

Parts of Tray UI's `llms.txt`, as the build writes it. The lines that end in `…` are cut short here, and the install lines and the notes between the summary and the first section are left out:

```text
# Tray UI

> A design system in plain HTML and CSS: 108 components, 64 blocks, 118 icons and 10 themes, with typed React components and 58 chart examples on Recharts. …

Every page of https://trayui.com is also Markdown: add `.md` to its address. [llms-full.txt](https://trayui.com/llms-full.txt) holds the whole system in one file.

## Docs

- [Installation](https://trayui.com/docs/installation.md): Three files and a font. Link them from a CDN or copy them into your project, then write HTML. There is nothing to build.

## Components

- [All 108 components](https://trayui.com/components.md): each with the sentence that says what it is for
- [Button](https://trayui.com/components/button.md)
```

The text before the first H2 carries the facts an agent needs before any page: the three lines that install the system, the npm packages, that the brands and figures in the examples are invented, and to use only classes and tokens that exist. Then come the sections: Docs, Guides, Components, Blocks, Charts, Articles and Optional. Docs, guides, chart pages and articles each come with a sentence that says what is on the page. Each of the 108 components has a line with its name alone, and the components index, linked first, has a sentence for each. The blocks are three links: the index of all of them and the two groups that have pages of their own, sign-in and sidebars. In the build measured here, the whole file is 186 lines, about 13 KB.

## The full file

The proposal's first version described a tool that expanded an llms.txt into one context file; the second version dropped it. Documentation platforms publish a file of that kind under the name `llms-full.txt`, which the proposal does not mention. Mintlify, for one, generates it for the documentation it hosts, a file that "combines your entire documentation site into a single file". It suits an agent that cannot fetch pages, or a chat where the person attaches a file.

Tray UI's `llms-full.txt` is about 340 KB. It opens with the same introduction as the index, then holds installation, the brand book, the guides, theming, the themes, React, Tailwind and Figma, coming from Tailwind, the agents page, the component index, the guidelines of all 108 components with their markup, the list of blocks, charts in React and the changelog. Each part keeps its own headings, moved down a level or two, so the file has one outline: a component's README starts at H3 under "The guidelines of every component". The index lists the file under Optional, beside the zip of the system.

## A Markdown copy at the same address

The proposal asks for the copy "at the same URL as the original page, either with `.md` appended (`page.html.md`) or with the extension replaced by `.md` (`page.md`)". Tray UI's addresses have no extension, so the copy is the address with `.md` added:

| Page | Its Markdown |
| --- | --- |
| `/components/button` | `/components/button.md` |
| `/docs/installation` | `/docs/installation.md` |
| `/blocks/dashboard-01` | `/blocks/dashboard-01.md` |
| `/docs`, the introduction | `/docs.md` |

For an address without a file name, the proposal asks for `index.md`. Tray UI's home page has no copy; `llms.txt` stands in for it.

Most pages are written in Markdown to begin with, so the copy is the source: a component's README, a guide, an article. The pages that are not get Markdown written from their data. Colours becomes a table of every token with its Light and Dark value, Icons a list of the names, Themes a list of the themes. A block's copy holds what it is for, links to the components it is made of, and its whole page of HTML in a fenced block. A chart page holds the React file of every example on it.

Each copy starts with its title and a line that says where it belongs, so an agent that lands on one page can find the rest:

```text
# Button

> Part of Tray UI 0.2.0, a design system in plain HTML and CSS (MIT licence). Every page: https://trayui.com/llms.txt

A button starts an action; the yellow one is the single most important action in view.
```

## How the build writes them

The build of the site keeps one Markdown text per page while it writes the HTML. When the HTML is done, it writes each text beside its page and rewrites the links in it. In the sources, a page links another by its id, as in `[Select](#c-select)`. In HTML that becomes `/components/select`. In Markdown it becomes `https://trayui.com/components/select.md`: an agent that follows the link gets Markdown again, and a copy saved on its own still has working links. A link to the home page goes to `llms.txt`, and links to the site's files (the zip, `llms-full.txt`) get the site's address too.

Tray UI's build is Python. This is the same step in Node, for a site with two pages, and it writes both kinds of file:

```js
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const SITE = 'https://example.com';
const pages = {
  'c-button': { path: 'components/button', title: 'Button', desc: 'A button starts an action.',
    md: '# Button\n\nA button starts an action.\n\nFor a value from a list, use [Select](#c-select).\n' },
  'c-select': { path: 'components/select', title: 'Select', desc: 'A list of options, one chosen.',
    md: '# Select\n\nA list of options, one chosen.\n\nTo run an action, use a [Button](#c-button).\n' },
};

// A link between pages names a page by its id; in Markdown it becomes the other page's Markdown
const toMd = (text) => text.replace(/\]\(#([a-z0-9-]+)\)/g, (link, id) =>
  pages[id] ? `](${SITE}/${pages[id].path}.md)` : link);

function write(file, text) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

const note = `> Part of Example UI. Every page: ${SITE}/llms.txt`;
for (const p of Object.values(pages)) {
  const [title, ...rest] = p.md.split('\n');
  write(`site/${p.path}.md`, toMd(`${title}\n\n${note}\n${rest.join('\n')}`));
}

write('site/llms.txt',
  '# Example UI\n\n> Components in plain HTML and CSS.\n\n' +
  'Every page is also Markdown: add `.md` to its address.\n\n## Components\n\n' +
  Object.values(pages).map((p) => `- [${p.title}](${SITE}/${p.path}.md): ${p.desc}\n`).join(''));
```

`site/components/button.md` comes out with the note under its title and its link pointing at `https://example.com/components/select.md`. Because the copies come from the same list of pages as the HTML, every page but the home page has one, and a new page gets its copy with no extra step.

## Telling clients where the Markdown is

An agent that already holds a page's address needs a way to find its copy without guessing. The second version of the proposal recommends two link relations: `rel="alternate" type="text/markdown"` for the Markdown version of a page, and `rel="describedby"` for the llms.txt file that covers it. Either can be an HTML `<link>` or an HTTP `Link` header, and the header form "also works for non-HTML resources, such as the markdown files themselves".

Every page of Tray UI but the home page carries the first in its head, and the home page points at the index:

```html
<!-- /components/button -->
<link rel="alternate" type="text/markdown" href="/components/button.md">

<!-- the home page -->
<link rel="alternate" type="text/plain" href="llms.txt" title="llms.txt">
```

People get the same links at the foot of every other page, "This page in Markdown" and "llms.txt", and the home page's footer links `llms.txt`. The site has no `rel="describedby"` and sends no `Link` header; a site starting now can add `<link rel="describedby" href="/llms.txt">` to the same head.

The type the server sends matters too. Tray UI's `_headers` file, which its host reads, gives the two text files `Content-Type: text/plain; charset=utf-8`. The `.md` copies take the host's default, `text/markdown`, with no charset. RFC 7763, which registers that type, says "charset is REQUIRED", and the copies hold characters beyond ASCII, so send `text/markdown; charset=utf-8`.

## Who reads them

What the sources say, and no more:

- **The proposal's author**, in August 2026: "thousands of sites publish an llms.txt file", documentation platforms generate one, and OpenAI, Anthropic and Gemini publish one for their developer docs. The changes page adds that "coding agents use them reliably". He expected the file to be "mainly useful for inference rather than training, and that is how it has been used".
- **Chrome's Lighthouse** has an llms.txt audit among its agentic browsing checks. It flags the page when the server errors while fetching the file; for a site without one, the audit is marked not applicable, "as providing the file is optional at the moment".
- **Google Search**, on its page about AI features: "You don't need to create new machine readable files, AI text files, or markup to appear in these features."

The sources describe the files as something agents read while they work, such as a coding assistant asked to build a page with a library; none of them describes a search engine ranking pages by them. They also grant nothing: the proposal gives llms.txt and `robots.txt` "different purposes", and `robots.txt` still says what automated tools may fetch. Tray UI's `robots.txt` allows every agent and says what it welcomes in a comment: "Search, AI answers, agent fetches and training are welcome."

## llms.txt in Tray UI

The build writes `llms.txt`, `llms-full.txt` and a `.md` beside every page except the home page, each time the site is built, from the same sources as the HTML. [For AI agents](#d-agents) says which to hand an agent: an agent that can fetch needs only the address `https://trayui.com/llms.txt`, and one that cannot needs `llms-full.txt` or the Markdown of the pages the task touches, pasted in. It also has a prompt to start from and the mistakes to check for. Every other page, such as [Button](#c-button) or [Installation](#d-installation), links its own Markdown at the foot.
