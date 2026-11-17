# For AI agents

The system is written to be read by an agent as well as by a person: short rules, exact names, and markup that can be copied.

## One file to read

[llms.txt](llms.txt) holds the whole system as plain text: the rules of the brand book, the guides (grounds, behaviour, accessibility, page layouts), the index of components, and the guidelines of every component with its markup. Give it to an agent before asking it to build with Tray UI.

## What to tell the agent

- Link the three files; write plain HTML with `tray-` classes; attach behaviour with `data-tray`.
- Start a screen from the nearest block or template, not from an empty page.
- Follow the brand book: one yellow per view, depth by fill, selected is solid ink, sentence case, buttons that start with a verb.
- Use only classes that exist. If a layout needs a value that no class gives, use a token (`var(--space-6)`), never a literal colour or size.
- Check the result at 1280, 768 and 390 pixels in a light and a dark theme.
