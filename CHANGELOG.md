# Changelog

What changed in each version of Tray UI, the design system in plain HTML and CSS: its components, blocks, themes and tools, newest first.

## Not released yet

- **The site moves between pages without a jump.** A link fetches its page when the pointer rests on it, when it is focused and when it is pressed. A page that takes longer than 300 ms shows a skeleton in its own shape, and fades in over it; a page that comes at once is drawn at once, with no flicker. The pill of the header slides to the section you open.
  - The playgrounds and the theme maker come drawn in their pages, and each chart's place holds a skeleton of its card, so nothing moves when their scripts arrive. A block's frame stays grey until the page in it has loaded.
- **Templates are back, open as the blocks are.** Ten whole pages of a product (a landing page, pricing, a help article, a dashboard, orders, one order, an inbox, settings, billing and a first-run wizard), each one HTML file under the MIT licence. The site shows each live at desktop, tablet and phone width, with its code to copy, and the download and the package `trayui` hold them in `templates/`, beside the blocks.
- **The home page offers three ways in.** Its yellow card copies a prompt that has an agent set the system up (it reads llms.txt, runs `npx trayui init` and `npx trayui skill`, links the files and checks its pages), the CLI's command, or the three lines that link the files. The prompt is also on the agents page, `/docs/agents`, with what each line does.
- **The agent skill has a page of its own** in the docs, `/docs/skill`: how to install it in Claude Code, claude.ai or a project, what it holds, and the checker.
- **The docs:**
  - The behaviour guide lists every behaviour, `lightbox` and `player` included, and `TrayUI.rescue(el, to)`, which moves focus out of what your script is about to hide.
  - Video Player: the figure carries `data-playing` while the film plays, a hook for your own styles.
  - The `z-overlay` token says what it is for: an overlay of your own that is not a `<dialog>`. The system's dialogs, drawers and sheets open in the top layer and need none.
  - Articles that had fallen behind the code are corrected: where menus are placed, what a menu item reports, the shadcn registry, the 0.3.0 install lines.
- **The repository is open**, at https://github.com/VladislavKorzh/trayui. The site links it from its header, with its stars, and from the source of each component's page; jsDelivr serves the files from npm as before. Report a vulnerability privately from its Security tab, as `SECURITY.md` says.
- **The packages:** `npx trayui --help` lists every option, and the README of `trayui-react` links the site, not files the package does not hold.

## 0.3.0, November 2026

Both packages, `trayui` and `trayui-react`, are 0.3.0. A CLI, a registry and a skill bring the system into a project; tests for every component, and the bugs they found; React that works in Next.js. Each change was checked in Chrome and its accessibility tree; none was tested in a screen reader.

- **A CLI, a registry and a skill.**
  - `npx trayui init` and `npx trayui add <items>` put the three files, the font, components and blocks into a project: a plain folder with no `package.json`, a Vite app or a Next.js app, in HTML or as React source you own (`--react`). It keeps a record of what it wrote, so `trayui diff` shows your edits and `trayui add` never overwrites one without `--overwrite`. `trayui check` checks markup against the system's classes, behaviours and rules.
  - The same components and blocks are a registry in shadcn's format at `https://trayui.com/r/`, so `npx shadcn add https://trayui.com/r/<item>.json` installs them too. Every block exists in React now.
  - A skill teaches an AI agent to build with Tray UI, with the markup checker beside it: `npx trayui skill`, the `trayui` package's `skills/trayui`, or the plugin at `https://trayui.com/skills/marketplace.json`.
- **Menus have a name.** A dropdown menu is named by the button that opens it (`aria-labelledby`), unless it has a name of its own. Shift+Tab from an item now closes the menu and returns focus to the button, as Tab closes it.
- **A plan comparison reads its prices.** Switching it between monthly and yearly reads the new price of each plan, as the pricing cards already do.
- **Escape hides a tooltip wherever focus is.** A bubble the pointer showed goes too, and inside a dialog that Escape hides only the bubble; the next one closes the dialog. Words that the control's name already holds ("Orders" on a link named "Orders, 12 to pack") are no longer read again as its description.
- **Lists and fields:**
  - Select: Shift+Tab from an option closes the list and returns to the trigger, as in a menu. A letter goes to the next option that starts with it, so pressing it again walks on, and passes over options that are off.
  - Command filters by the names of its options, no longer by their shortcut keys ("go" found Orders by G O), and `detail.value` falls back to the name. A hidden status line says how many options are left, or that nothing matches, when those words change.
  - Combobox keeps the two lines of an option apart when it filters ("kp" no longer matches Anna Melnyk over Packing), and says the no-match sentence once, not at every key.
  - Calendar and Date picker: Home and End go to the start and the end of the week, Page Up and Page Down by a month, and Shift with them by a year. The month buttons say which month they turned to.
  - Input OTP keeps only what its cells take, digits or else letters and digits, so "123-456" fills six cells and no cell holds a hyphen. Its cells keep their order in a right-to-left page, and the arrow keys go by the side of the screen.
  - Tag input says a pasted list in one message, every value of it, and the limit once.
  - Slider: the value is read once, from the slider itself. The behaviour makes its `<output>` `aria-hidden`, since an `<output>` is a status region that read it a second time.
  - Reveal turns a shown password back into a password field when its form is sent and when the page comes back from the back-forward cache.
- **Data table:** a sort button without an icon sorts; it stopped with an error.
- **Tabs:** the tab shown at load no longer fires `tray:change`, and a tab with `aria-current="false"` is no longer drawn as the current one.
- **Pricing:** the status line that reads the new prices is there from the start, so the first change is heard.
- **Carousel:** with several slides in view, the count reaches the last slide as Next turns off ("5 / 5", not "3 / 5").
- **Tour:** Back on the first step does nothing; it ended the tour as finished. Escape ends the tour from anywhere in its area, also from a control that a step covers.
- **Chart:** the figure is named by its caption. On a touch screen a tap keeps the values shown until the next tap elsewhere, and a tap on a radar shows its spoke.
- **Styles:**
  - Forced colours: the focus ring of a slider's knob shows again in Chrome, which dropped the rule it shared with Firefox's knob. A rule for the veil of a dialog that never applied is gone: the browser already keeps the veil.
  - Print: a chosen tab or segment prints with its ink fill, so its light text is not lost on white paper.
  - Reduced motion: the button inside an input group no longer gives under a press, and a message scroller's Latest button no longer jumps sideways when pressed.
  - Reactions that wrap onto two rows stand 12px apart, so their 44px targets no longer take each other's presses.
  - Right to left: the mirrored parts follow the direction they are laid out in (`:dir(rtl)`), so a `dir="ltr"` region inside a right-to-left page is not mirrored, and a Resizable handle dragged there follows the pointer.
  - The app shell, the settings and the page layouts change at 56rem (`bp-bento`), as the bento, the hero and the footer do: at exactly 56rem, 896px, they all have their wide layout, where the shell had its narrow one.
  - A page with a sticky top bar or an app header keeps a scroll padding the height of the bar, so the control that takes focus is not hidden under it (WCAG 2.4.11).
  - The show and copy buttons of an API key are 44px to a finger.
  - More contrast: the edges on the yellow card take its darker grey, and a hairline on a raised panel holds 3:1 in the dark themes.
- **Blocks:**
  - Wide tables can be reached and scrolled from the keyboard: their wrap is a named region with `tabindex="0"`. This is in the catalogue, stats, dashboard, wiki and table blocks.
  - The plan comparison puts each group of rows in its own `<tbody>`, so a screen reader reads a group's heading only with its own rows.
  - The dashboard's collapsed sidebar names its items and its workspace button, and shows a tooltip on each item.
  - The dashboard and the batches table read their selection and page counts aloud as they change.
  - The blog hides the "…" in its page numbers from screen readers.
  - The social sign-up page links to sign in.
  - The search button of the top bar no longer carries `aria-keyshortcuts="/"`: nothing binds the key.
  - Checkout: the meter to free delivery says its amount, a refused promo code sends focus back to the field with the reason, and a total that changes is read with its word ("Total $250.20"). The delivery step disables the fields it hides, so they are not sent.
  - The page without access keeps focus on the page when "Ask for access" turns off: it moves to the note under it.
  - Settings: the note of unsaved changes is read only when its words change, and the line under each setting is read with its control.
  - A page step that is off stays a link that is off (`role="link"`, `aria-disabled`), so it keeps its name.
  - Password fields that can be shown turn spell checking and capitals off.
  - Lists without markers keep `role="list"`, so Safari still calls them lists: steps, item lists, the ticks of a plan, the tasks of a checklist, notifications, the key of an uptime row, the footer's links, a trace, a gallery, a feed and the lines of a summary.
- **Examples:**
  - The 100 g jar costs $112 in the checkout, as it does in the shop.
  - The blog's post counts match its posts.
  - Three block descriptions now say only what the block shows.
  - The dashboard says that its chart covers 14 days, the pricing pages that yearly saves about two months, 16 to 20%, as their prices do, and the usage pricing reads "1,000 orders" as it shows it.
  - Every step of the Tour preview can be skipped; the Navigation Menu preview puts its links in a named `<nav>`; the Data Table preview names its scrolling wrap and reads its counts; the Auth Form preview ties the email to its error.
- **Docs:**
  - Auth Form describes the reveal button as it works, and says that an alert already in the page as it loads is not announced.
  - Toast describes where focus goes when a toast is dismissed exactly as it happens.
  - Alert Dialog says what `data-static` does: in Chrome the first two presses of Escape do nothing and the third closes the dialog, a limit of the browser.
  - Typography says what zoom does to the fluid headings: inside their range they grow by their rem part alone, about 4px at 200%.
  - Direction says what mirrors: the time axis of a chart and the video's bar do, the cells of a code do not.
  - Input OTP no longer advises sending the code as soon as the last digit lands without saying so beside the cells (WCAG 3.2.2).
  - Select and Date picker give their names as a screen reader hears them, with no comma ("Jar size 50 g"); Chart lists `labelHead`, `totalLabel` and `locale`, and says which data colours are under 3:1 on which ground; Sidebar and the blocks agree on `aria-current` in a second level; Checkout Summary, Pagination, Empty, Settings Section and File Upload describe their markup as it is.
  - Checkbox and Select give the whole markup to copy: the box with its drawn tick, and every option and attribute the behaviour expects, with what it adds.
  - The Tailwind page is corrected: it links `tokens.css` as a file of its own, writes `min-[544px]:` for Tailwind 3, and has notes on cascade layers and on `dark:`.
  - The brand book and the `size-hit` token no longer say that every target reaches 44px: they name the few that do not, as the accessibility guide does.
- **The site:**
  - The Articles go by pages.
  - A link to an article shows the article's own picture in its card.
  - The site follows the device's light or dark setting until a theme is chosen.
  - Ctrl+Shift+K and Caps Lock open its search.
  - Its `.md` pages are sent as UTF-8.
- **trayui-react** no longer ships `dist/all.*`, and its build imports the packed package in Node.
- **A test for every component.** `python3 system/tools/test_components.py` holds each of the 108 components to what its README promises, in Chrome: the accessibility tree (roles, names, descriptions, states), every key and where focus goes, the events and their `detail`, an axe-core scan against WCAG 2.2 A and AA in Light and Dark, the layout at 390 and 1440px (no sideways scroll, no text cut, targets of 24px and the 44px the guide promises), reduced motion, forced colours and right to left where the README speaks of them, and the React twin against the HTML. It scans every block too, and CI runs it. These are what it found and what changed:
  - **Floating panels stay in the window.** A menu, a list, a popover or a hover card that would leave the window sideways on a narrow screen moves back inside it, 8px from its edge. Menubar and Hover Card passed the edge of a phone.
  - Tooltip: a bubble whose words only repeat the control's name, with no keys, is hidden from screen readers; it was a tooltip without a name.
  - Menus: `detail.value` of a menu, context menu, menubar, user menu or workspace switcher item without `data-value` is its words alone ("Duplicate", not "DuplicateCtrl D"; "Perly Farm", not "PFPerly Farm").
  - Dialog: a `data-tray="open"` button says it opens a dialog (`aria-haspopup="dialog"`).
  - Forced colours: the option or the menu item under the keyboard is drawn in `Highlight`, as the guide says; it only had a ring.
  - Combobox: while nothing matches, the list is hidden from screen readers and the field says it is collapsed, so there is no list without options; the status line says there is no match. Command hides its no-match sentence the same way.
  - Input OTP fits a phone: its cells narrow instead of scrolling the page sideways.
  - Navigation Menu: below 76rem its links scroll sideways in their strip, as its page says, and the panel opens from the header, so the strip does not cut it.
  - Sidebar: in a `tray-shell` the content goes under the sidebar on a phone; it scrolled the page sideways.
  - Progress: the sliding segment of a busy bar stops under reduced motion, as promised; a rule that came too early let it run.
  - Carousel: focus stays on a button when one step crosses the whole track (from the end back to the start on a wide window); it fell to the page.
  - Resizable: the size it starts at fires no `tray:change`.
  - Chart: on a narrow card the labels under the plot thin out to every second or third, so none is cut ("Ja", "Fe").
  - Workspace Switcher keeps its name in a collapsed sidebar: its words are hidden from sight only.
  - Page Header: a strip of tabs too wide for a phone scrolls inside the header, not the page.
  - Trace: the output of a step sits inside its step, so five steps are read as five, and it scrolls inside the trace on a phone. A code block in a message keeps to the message's width.
  - Message Scroller follows text streamed into a message already there, and counts on Latest only new messages at the end, not streamed words or older messages loaded above.
  - Questionnaire keeps the answers when its pills are drawn already filled (a page rendered on the server).
  - API Keys: the show and copy buttons are both 44px to a finger (4px apart); each Revoke button names its key.
  - Auth Form: the card is 27rem wide at most, as promised, also where it may grow.
- **Examples, found by the tests:**
  - Avatars: one beside its name is `aria-hidden`, one alone is an image named by the person (Avatar, Sidebar, Hover Card, Message, Message Scroller), and those inside a named group are `aria-hidden`, so "Packing team, 6 people" is not followed by "AM BS OF +3"; an avatar button ends its name with the initials it shows, "Account: Oksana Franko, OF" (Top Bar, User Menu, App Shell). Your own messages say "You:" to a screen reader.
  - Badge counts say what they count; Usage Meter's meters say their words (`aria-valuetext`); finished steps of the vertical Stepper say ", done"; Label's "Full name" is required; Input Group's field is named "Weight in kg"; Upgrade Prompt's notices are `role="status"`; Plan Comparison's table can be scrolled from the keyboard on a phone.
  - The App Shell preview has its phone menu button and folds its top bar, as its page says; the Top Bar preview folds too.
  - Every preview fits a 390px screen: Activity Feed, Description List, File Upload, Onboarding Checklist, Popover, Radio Group, Switch, Tag Input, Usage Meter and Tour no longer scroll sideways.
- **Docs, found by the tests:**
  - Chart: the example waits for `DOMContentLoaded`, so it works with the bundle loaded with `defer`, as the guide loads it.
  - Avatar says how to name an avatar button: with the initials it shows (WCAG 2.5.3, Label in Name). Top Bar and User Menu say the same.
  - Combobox, Command, Tooltip, Dialog, Resizable, Trace, API Keys, Navigation Menu, Workspace Switcher, Usage Meter, Upgrade Prompt, Plan Comparison and Message describe what they do now.
- **Blocks, found by the tests** (which now scan all 64 with axe-core in Light and Dark at 390 and 1440px): every name holds the words its control shows, in their order (WCAG 2.5.3, Label in Name).
  - The account button ends its name with the initials it shows ("Account: Oksana Franko, OF"), in 16 blocks.
  - The workspace and account switchers are named by their words ("Perly Farm Shop plan"), with no `aria-label` that left out the second line, in 13 blocks.
  - A sidebar item with a count and the cart say what the count counts inside the badge, for a screen reader alone ("Orders 12 to pack", "Cart 2 items"), and lose the `aria-label` that put a comma between the words; the cart of the shop pages keeps it so as its count changes.
  - The cart's add buttons start their names with what they show ("Add for $14: a second mother-of-pearl spoon").
  - The cards of the blog, the journal and the long read are one link named by all the text inside it, as Card says, not by their title alone.
- **trayui-react in server-rendered apps, such as Next.js's App Router:**
  - A Server Component imports and renders the components as they are. Every file that needs the browser (state, effects, an event handler, a behaviour) starts with `'use client'`; the components that need nothing of it, such as Badge, Button, Card, Table and Typography, render on the server with no script. With 0.2.1 Next.js stopped at the build: "useRef is not a function".
  - The page the server sends is the page React hydrates: on import the runtime only adds the icon sprite, and each component wires its own behaviour in an effect. A server-rendered Tooltip gave React error #418, and the icon sprite was lost with the page React drew again. A render that takes the sprite away no longer leaves the icons blank: the next component to wire itself puts it back.
  - An element that a Server Component passes, such as a dialog's `trigger`, an `icon` or a setting's `control`, may reach the browser after the component that holds it, on a large page: the components wait for it. A Dialog with a trigger stopped with "Element type is invalid".
  - The Date picker writes its day or period in words on the server too, so the server's page and the browser's agree.
  - `useBehaviour`, `useTrayEvent` and `runtime` are exported, to wire markup written by hand, such as a block pasted into a component.
  - Copied into an app, the components type-check with React 19's types and with Next.js's loose settings (Button's link, the trigger of a dialog).
  - StrictMode: a pricing table no longer reads its prices aloud and fires `tray:change` as it mounts, and a slider or a counted text area no longer repaints for nothing.
  - React 18 on a server no longer warns about layout effects (Checkbox, Tag Input, Upgrade Prompt).
  - `npm run check` now checks that a server can import every component and render every preview, and the build that the packed files keep `'use client'` and that the runtime wires nothing on import.
- **trayui-react, the twins of the HTML fixes:**
  - Lists without markers keep `role="list"`: Stepper, the ticks of a plan, the tasks of a checklist, notifications, the key of an uptime row, the footer's legal links, a trace and the Lightbox gallery. The Item, Uptime, Feature Grid, Hero and Scroll Area examples and guides put it on their lists.
  - Pagination: a step that is off stays a link that is off (`role="link"`, `aria-disabled`).
  - A password that can be shown (`InputGroup reveal`, and so Auth Form) turns spell checking and capitals off, and is a password field again when its form is sent and when the page comes back from the back-forward cache.
  - Navigation Menu puts its strip of links in a `<nav>` named "Main" (`label` changes it).
  - Tour: every step has Skip; from the second step on, Back stands beside Next.
  - The app shell leaves its layout to its styles, which change at 56rem; the top bar had its own test of the width, one pixel off. Its phone button is "Open the navigation" and reports `aria-expanded`.
  - Trace: the output of a step sits inside its step, so five steps are read as five.
  - Wide tables can be reached and scrolled from the keyboard: Table takes `wide`, and the wraps of Data Table and Plan Comparison are named regions with `tabindex="0"`. Data Table reads its selection and page counts as they change.
  - Progress and Usage Meter say their words as the value (`aria-valuetext`, "68%: 132 of 412 jars left").
  - A chart's figure is named by its caption.
  - The account button of Top Bar and User Menu ends its name with the initials it shows ("Account: Oksana Franko, OF").
  - Your own messages start with "You:" for a screen reader (`ownLabel`).
  - Auth Form: a field the form's error is about points at the alert's title, and the alert can take focus, for a page that answers with it. Alert takes `titleId`.
  - Top Bar: the search is named by its words, and `fold` folds the bar for a phone, as the HTML does: the breadcrumb keeps only the current page (Breadcrumb takes `fold` too) and the search only its icon.
  - Examples: an avatar group is a named group, count badges say what they count, the Hero's bar is one picture with its words, a "Change" button names what it changes, "Weight in kg" is the field's name, and fields not marked optional are required.
  - Chart: the drawing is one image named by its summary and the only stop for Tab, as in the HTML; the arrow keys, Home and End walk its points, the tooltip follows, and a polite live region beside it says each point ("May: 22 kg"). Recharts' own unnamed stop for Tab is gone. `ChartContainer` takes `walk` to do the same for a chart of your own.
  - Found by the component tests: the new-key warning of API Keys is a plain alert, read with its dialog; the shell's collapse button hides below 56rem (`tray-app__collapse`); Workspace Switcher is named by its words, "Perly Farm Shop plan" (WCAG 2.5.3); a Data Table row's checkbox is "Select order PL-20418" (`itemLabel`); a pricing table fires `tray:change` once a change; the Lightbox's strip is named "Pictures" (`trackLabel`); Plan Comparison and Notification Preferences take a hidden `caption`; the checklist's bar is named "Setup" (`progressName`); in a collapsed sidebar an item keeps its count in its name ("Orders 12"); a Field's label names an Input OTP, as a span its group is labelled by.
  - Examples: each receipt's download button names its date, the Drawer's quantity stepper counts, and the Popover and Description List examples fit a 390px screen.
  - Docs: Alert Dialog says what `closeOnEscape={false}` does (in Chrome the third press of Escape closes it, as the safe choice); Tour, Navigation Menu, Input Group, Auth Form, Progress, Badge, Avatar, Table, Data Table and Plan Comparison describe their markup and names as they are.
- **The theme maker** steps the yellow card's greys in more contrast too (`paper-hairline`, `paper-track`), and a rule that would fall under 3:1 on one of its grounds takes the next step towards the ink, as the system's own themes do. A theme made on the site now holds 3:1 there, unless its accent is too dark for the yellow card's text, which its report already flags.

## trayui-react 0.2.1, November 2026

- The package's imports name their files (`./components/Button.js`), so it loads in Node and in webpack and Next.js, which follow the standard for ES modules; 0.2.0 loaded only where the bundler guessed the extension.
- Its page on npm says how to install it.

## 0.2.0, November 2026

Accessibility, after every component was given a section on it. Each change below was checked in Chrome and its accessibility tree; none was tested in a screen reader.

- **Focus stays on the page.** A control that hides or turns off while it has focus (a step button at its limit, the end of a carousel, a toast dismissed, a chip removed, a banner closed, a tour skipped) now hands focus to the control beside it. `TrayUI.rescue(el, to)` does it, and is there for your own scripts.
- **Menus and lists close on Tab**, as they close on Escape. Submenus are menus of their own: they open on the right arrow, Enter or Space, and the left arrow closes them. A menubar is one Tab stop, with arrows between its menus.
- **Changed for whoever listens:** a checkbox or radio item in a menu fires `tray:change` with `{ value, checked }`, no longer `tray:select`; Tag input puts `aria-invalid` on its text field, not on the tray; Input OTP spreads a whole code typed, pasted or filled in over its cells; Reveal keeps the name "Show password" and says its state with `aria-pressed`; a Calendar's month buttons take their names from `data-prev-label` and `data-next-label`.
- **Easier to hear:** toasts in a live region, the value of a Select and the date of a Date picker in their names, a slider's unit, the count of a reaction, the unread count of the bell, a price that changes, a copy that failed, a task that is done.
- **Easier to see and to hit:** a focused field that is invalid keeps its focus ring; extra small buttons and toggles, a chip's remove, reactions, footer links and the checkboxes of a matrix reach 44px; a tooltip stays while the pointer moves onto it.
- **Less motion when asked for:** presses, turning icons, filling bars and a folding sidebar change at once.
- **Type that grows with zoom:** the five heading sizes have a part in rem, so browser zoom enlarges them inside their range.
- **On npm.** `trayui` holds the three files, the font, the blocks and the tokens for Tailwind and Figma, and jsDelivr serves each of its releases (`https://cdn.jsdelivr.net/npm/trayui@0.2.0/tokens.css`). `trayui-react` is the React package.

## 0.1.0, November 2026

The first public version.

- **Components.** 108 components in plain HTML and CSS, in fifteen groups. The base set covers actions, forms, navigation, overlays, feedback, data, layout, display and conversation. The application set covers the frame of a product: app shell, top bar, page header, metrics, billing, account, onboarding and the parts of a public page. Media covers a lightbox for pictures and a video player.
- **One small script.** `components/bundle.js` assigns `window.TrayUI` and wires every element that carries `data-tray`: menus, dialogs, tabs, a calendar, a data table, toasts and the rest. It loads nothing, and most components need none of it.
- **Blocks.** 64 screens built only from the components: a dashboard, stat screens, tables, settings, empty states, fifteen sidebars, sign-in and sign-up pages, pricing, catalogues, a shop, a checkout, articles, a blog and a wiki. Each is one HTML file that opens as it is.
- **Tokens and themes.** 116 tokens for colour, type, space, shape and motion, in `tokens.css`. There are 10 themes: Light, Dark, Linen, Mint, Sky, Rose, Lilac, Midnight, Forest and Espresso. Each holds the system's 32 contrast rules (66 pairs), and the site's theme maker derives a new one from four colours.
- **Icons.** 118 icons from Lucide, built into the script as a sprite, under Lucide's own names. Any other Lucide icon fits beside them.
- **React.** `trayui-react`: the components as typed React components over the same stylesheet and behaviours. It also has charts on Recharts, from `trayui-react/charts`, with 58 examples to copy.
- **Tailwind and Figma.** The tokens as a Tailwind 4 theme, a Tailwind 3 preset, and Figma variables with a mode for each theme.
- **Accessibility.** The accessibility guide sets the rules the components follow: names, focus, keyboard and contrast. Each grey moves a step towards the ink when more contrast is asked for, forced colours turn fills into edges, and a printed page is the light theme with the navigation left out.
- **Motion.** Menus and popovers open from their trigger, dialogs and sheets rise and settle, and toasts sink out. The pill of a segmented control slides to the choice, and a tick draws itself. For a visitor who asks for reduced motion, overlays fade in a tenth of a second and the rest changes at once.
- **For agents.** `llms.txt` holds the rules, the guides and the markup of every component in one plain file.
