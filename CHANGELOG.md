# Changelog

What changed in each version of Tray UI.

## 0.1.0, November 2026

The first public version.

- **Components.** 108 components in plain HTML and CSS, in fifteen groups. The base set covers actions, forms, navigation, overlays, feedback, data, layout, display and conversation. The application set covers the frame of a product: app shell, top bar, page header, metrics, billing, account, onboarding and the parts of a public page. Media covers a lightbox for pictures and a video player.
- **One small script.** `components/bundle.js` assigns `window.TrayUI` and wires every element that carries `data-tray`: menus, dialogs, tabs, a calendar, a data table, toasts and the rest. It loads nothing, and most components need none of it.
- **Blocks.** 64 screens built only from the components: a dashboard, stat screens, tables, settings, empty states, fifteen sidebars, sign-in and sign-up pages, pricing, catalogues, a shop, a checkout, articles, a blog and a wiki. Each is one HTML file that opens as it is.
- **Tokens and themes.** 116 tokens for colour, type, space, shape and motion, in `tokens.css`. There are 10 themes: Light, Dark, Linen, Mint, Sky, Rose, Lilac, Midnight, Forest and Espresso. Each holds the system's 66 contrast rules, and the site's theme maker derives a new one from four colours.
- **Icons.** 118 icons from Lucide, built into the script as a sprite, under Lucide's own names. Any other Lucide icon fits beside them.
- **React.** `trayui-react`: the components as typed React components over the same stylesheet and behaviours. It also has charts on Recharts, from `trayui-react/charts`, with 58 examples to copy.
- **Tailwind and Figma.** The tokens as a Tailwind 4 theme, a Tailwind 3 preset, and Figma variables with a mode for each theme.
- **Accessibility.** The accessibility guide sets the rules the components follow: names, focus, keyboard and contrast. Each grey moves a step towards the ink when more contrast is asked for, forced colours turn fills into edges, and a printed page is the light theme with the navigation left out.
- **Motion.** Menus and popovers open from their trigger, dialogs and sheets rise and settle, and toasts sink out. The pill of a segmented control slides to the choice, and a tick draws itself. For a visitor who asks for reduced motion, overlays fade in a tenth of a second and the rest changes at once.
- **For agents.** `llms.txt` holds the rules, the guides and the markup of every component in one plain file.
