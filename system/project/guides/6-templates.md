# Templates

A template is one complete page of a product, with realistic content, built only from the components and the layout classes. There are 10; each is one file in `templates/`.

A page links `../tokens.css`, `../components/bundle.css` and `../components/bundle.js`, so it works as it is one folder below those three files. Its names, figures and quotes are invented: replace them, never ship them.

## Public pages

| File | What it is |
| --- | --- |
| `templates/landing.html` | Landing page. The home page of a product: what it is, how it works, proof, prices and one call to action. |
| `templates/pricing.html` | Pricing page. Plans with a monthly and yearly switch, a full comparison, and questions about billing. |
| `templates/article.html` | Help article. A help centre article: a readable column, its contents at the side, and what to read next. |

## Product

| File | What it is |
| --- | --- |
| `templates/dashboard.html` | Home. The first screen of a product: what needs doing today, the numbers, and what happened. |
| `templates/orders.html` | Orders. A list page: tabs by status, a filter bar, a data table and paging. |
| `templates/order.html` | Order. One record in full: its progress, what is in it, the customer, and everything that happened. |
| `templates/inbox.html` | Inbox. A conversation screen: a list of conversations, the open thread with a reply box, and the customer at the side. |

## Account

| File | What it is |
| --- | --- |
| `templates/settings.html` | Settings. Workspace settings in sections: profile, team, notifications, API keys and the danger zone. |
| `templates/billing.html` | Billing. The plan, this month's usage, the payment method and past invoices. |
| `templates/onboarding.html` | Set up a workspace. A first-run wizard: four steps, one question at a time, with a way back and a way out. |
