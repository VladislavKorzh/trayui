# Security

Tray UI's script runs on other people's pages, so a flaw in it can become a flaw in theirs. Please report one privately.

## Report a vulnerability

Use [GitHub's private vulnerability reporting](https://github.com/VladislavKorzh/trayui/security/advisories/new): open the repository's **Security** tab and choose **Report a vulnerability**. Do not open a public issue.

Say what the problem is, which file and version it is in, and how to reproduce it: a page or a snippet of markup is best. The aim is to answer within a week. Once a fix is released, the advisory is published with credit to you, unless you would rather not be named.

## What is in scope

- `components/bundle.js`: for example, markup or `data-` attributes that let a page's content run script, or a behaviour that writes untrusted text as HTML.
- `trayui-react`.
- The `trayui` command (`npx trayui`), which writes files into a project, runs its package manager and reads the registry, and the markup checker (`cli/check.mjs`) that it and the skill run.
- The registry at `https://trayui.com/r/` and the agent skill, as they reach a project.
- The tools in `system/tools` that build the files people link.

The documentation site's own pages and the example content in previews and blocks are out of scope, unless they show a flaw in one of the above.

## Supported versions

Fixes go into the latest release. Until 1.0, that is the only supported version.
