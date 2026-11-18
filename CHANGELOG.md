# Changelog

What changed in each version of Tray UI, the design system in plain HTML and CSS: its components, blocks, themes and tools, newest first.

## Not released yet

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
