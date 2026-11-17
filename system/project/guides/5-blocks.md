# Blocks

A block is one screen-sized composition built only from the components and the layout classes: copy it into a product and fill it. There are 64; each is one file in `blocks/`.

A page links `../tokens.css`, `../components/bundle.css` and `../components/bundle.js`, so it works as it is one folder below those three files. The grey trays (`tray-slot`) in a block stand in for your content.

## Dashboard

| File | What it is |
| --- | --- |
| `blocks/dashboard-01.html` | Dashboard. An app's home: a sidebar with a workspace switcher, four stat cards, a chart of orders per day and a table of the latest orders to select and sort. |

## Stats

| File | What it is |
| --- | --- |
| `blocks/stats-01.html` | Stat cards with a period switch. Six stat cards in two groups under a switch between 7 days, 30 days and the season, each set against the period before, the season against last year. |
| `blocks/stats-02.html` | Stat cards over a season chart. Stat cards and one large chart of the season on the ink card, with the harvest by bed and the goals of the season beneath. |
| `blocks/stats-03.html` | Breakdown by channel. A breakdown of the month: orders by channel beside the best sellers with their share, then orders by city and the share of repeat customers. |

## Tables

| File | What it is |
| --- | --- |
| `blocks/table-01.html` | Table with filters and bulk actions. A table of batches in a card: a filter bar with search, two filters and a date range, rows to select with actions, a total and numbered pages. |
| `blocks/table-02.html` | Table with sortable columns and row menus. A table of customers with avatars, columns that sort, a search and a menu on each row, beside a sidebar folded to a rail. |
| `blocks/table-03.html` | Table with status tabs and a details sheet. Deliveries of the day in a table filtered by tabs with counts; each order opens its details in a sheet. |

## Settings

| File | What it is |
| --- | --- |
| `blocks/settings-01.html` | Profile settings. A personal profile in sections: a photo to upload, name and contact, language and time, and one bar that saves every change. |
| `blocks/settings-02.html` | Notifications by channel. Notification settings channel by channel: switches for email and the phone app, a phone number to add for text messages, and quiet hours for the night. |
| `blocks/settings-03.html` | Security and the danger zone. Two-step sign-in, the devices you are signed in on, and deleting the workspace behind a dialog that asks you to type its name. |

## Empty states

| File | What it is |
| --- | --- |
| `blocks/empty-01.html` | First run. The orders page of a workspace on its first day: the first steps to take, a way to bring old orders, and the empty table where new ones will land. |
| `blocks/empty-02.html` | No results. A customer list whose search and filters match nobody: the filters stay in view, and the empty table names the near matches and clears the filters. |
| `blocks/empty-03.html` | No access. A packer opens the reports: a dimmed picture of what the page holds, who can open it, a way to ask for access, and the pages that are open to them. |

## Sidebar

| File | What it is |
| --- | --- |
| `blocks/sidebar-01.html` | Sidebar grouped by section. The base app sidebar: a wordmark, main items with a count, two labelled sections and the user at the foot. Start here for one level of navigation. |
| `blocks/sidebar-02.html` | Sidebar with sections that fold. The base sidebar with labelled sections that fold under their headings, one open and one closed; for when there are many sections and people use few. |
| `blocks/sidebar-03.html` | Sidebar with a second level. A sidebar with a second level always open under its items, such as the statuses under Orders; for a short second level used every day. |
| `blocks/sidebar-04.html` | Sidebar with a level that folds. A sidebar whose items fold open to show their second level, Orders open and the rest closed; for when the second level is too long to keep open. |
| `blocks/sidebar-05.html` | Sidebar with menus. A sidebar whose items open their second level in a menu beside them, so the list stays short; for when people go straight to a page under an item. |
| `blocks/sidebar-06.html` | Sidebar that collapses to icons. A sidebar that a button in the top bar folds to a rail of icons with tooltips, with a workspace switcher, a meter of orders and an account menu. |
| `blocks/sidebar-07.html` | Inset sidebar. An inset sidebar on a grey ground, the page in one white panel: a workspace switcher, the main items, a list of recent batches and an account menu. |
| `blocks/sidebar-08.html` | Two sidebars. Two sidebars: a rail of section icons beside an inbox of messages with a search and an Unread switch; for when a section is a list to pick from. |
| `blocks/sidebar-09.html` | Sidebar with a file tree. A sidebar for files: the changed files marked as modified, added or deleted, then a tree of folders that fold, with the open file in the breadcrumb. |
| `blocks/sidebar-10.html` | Sidebar with a calendar. A wide sidebar for a calendar: a month to pick the day, your own and the shared calendars as checkboxes in groups that fold, and a button to add one. |
| `blocks/sidebar-11.html` | Sidebar at the end. A sidebar at the end of the page with the contents of a long guide: headings, sub-headings, the current place marked and a link back to the top. |
| `blocks/sidebar-12.html` | Sidebar on each side. Navigation at the start of the page and details at the end: one order's customer, items, total and next deliveries, with a button to pack it. |
| `blocks/sidebar-13.html` | Sidebar under a site header. A sidebar under a header that spans the whole product and holds the wordmark, the breadcrumb, a search, notifications and the account. |
| `blocks/sidebar-14.html` | Sidebar in a dialog. A settings dialog open over the app, with a sidebar of its own: six sections down the side and the notification switches of the chosen one. |
| `blocks/sidebar-15.html` | Navigation in a popover. A page with no sidebar: a Menu button in the header opens the navigation in a popover; for small products or pages that need the full width. |

## Login

| File | What it is |
| --- | --- |
| `blocks/login-01.html` | Sign-in form. The plainest sign-in: a card centred on the page with email, a password you can show, a link for a forgotten one and six other accounts to use. |
| `blocks/login-02.html` | Sign-in page with a cover. The sign-in form in one half of the page, a cover in the other with a headline and a meter of the day's orders; for a sign-in that shows the product. |
| `blocks/login-03.html` | Sign-in page on a tray. A white sign-in panel on a grey ground, with Google and Apple shown and four more accounts in a menu, and the terms and privacy notice below. |
| `blocks/login-04.html` | Sign-in card with a picture. A wide card with the sign-in form beside a dark panel that follows one order, with the time of each step, from its arrival to the courier. |
| `blocks/login-05.html` | Email-only sign-in. Sign-in without a password: a link to the email that works for 15 minutes, six other accounts and a passkey; for a product that signs in by link. |
| `blocks/login-06.html` | Sign-in with social accounts. A sign-in card of six full-width account buttons and a link to use your email instead; for when most people use an account they already have. |

## Signup

| File | What it is |
| --- | --- |
| `blocks/signup-01.html` | Sign-up form. The plainest sign-up: a card centred on the page with work email, a password of at least 12 characters, six other accounts and a line on the terms. |
| `blocks/signup-02.html` | Sign-up page with a cover. The sign-up form in one half of the page and a cover in the other, listing three things a new account gets, from 14 free days to exporting your data. |
| `blocks/signup-03.html` | Sign-up page on a tray. A white sign-up panel on a grey ground, with Google and Apple shown and four more accounts in a menu, and the terms and privacy notice below. |
| `blocks/signup-04.html` | Sign-up card with a picture. A wide card with the sign-up form beside a panel of three first steps, from adding the products to packing the first order. |
| `blocks/signup-05.html` | Sign-up with sign-in providers. Sign-up that leads with six accounts, with the email and password right below on the same page; for when people should see both ways at once. |
| `blocks/signup-06.html` | Sign-up with social accounts. A sign-up card of six full-width account buttons and a link to use your email instead; for when the email form can live on a page of its own. |

## Pricing

| File | What it is |
| --- | --- |
| `blocks/pricing-01.html` | Plans at the end of a trial. Three plans side by side with a monthly or yearly switch, and what the trial used against the plan it fits. |
| `blocks/pricing-02.html` | Plans compared feature by feature. Every plan in one table, feature by feature in groups, with the price and a button at the head of each column. |
| `blocks/pricing-03.html` | Pricing by usage. One plan priced by the order: a slider that works out the month's price, what farms like yours pay, and questions that fold. |

## Catalog

| File | What it is |
| --- | --- |
| `blocks/catalog-01.html` | Catalog with filters on top. Products in a grid of cards under a filter bar for type, size and price, with the count, the sort and pages; for a range that three filters cover. |
| `blocks/catalog-02.html` | Catalog with a filter column. Products as rows beside a column of filters: checkboxes, a price limit and an in-stock switch. On a phone or a tablet the column opens from a button. |
| `blocks/catalog-03.html` | The range at a glance. The whole range on one page: a tile per category with its count, a table of jar sizes with the price of 10 g, and the three products ordered most. |

## Shop

| File | What it is |
| --- | --- |
| `blocks/shop-01.html` | Product page. A product page: pictures with thumbnails, the rating, sizes, the quantity, Add to cart, the delivery, tabs of details, reviews and four more products. |
| `blocks/shop-02.html` | Cart page with product lines. A cart inside the shop's header and footer: lines with a picture, quantity and Remove, the way to free delivery, three things to add and the summary. |
| `blocks/shop-03.html` | Cart in a sheet. Gifts on a page whose cart opens in a sheet at the side: lines with a quantity, the way to free delivery, the subtotal and Check out. |

## Checkout

| File | What it is |
| --- | --- |
| `blocks/checkout-01.html` | Cart. The first step of a checkout, under a stepper: jars with a quantity, a meter to free delivery, a gift box with a note, a promo code and the summary. |
| `blocks/checkout-02.html` | One-page checkout. Contact, delivery with a day and a time slot, and the payment method on one page, beside the order summary. |
| `blocks/checkout-03.html` | Order placed. The page after paying: the order number, the delivery, what happens next, the summary, and where the jars come from. |

## Articles

| File | What it is |
| --- | --- |
| `blocks/articles-01.html` | Journal. The front page of a journal: its name, topic tabs, one featured article, a grid of six more, pages, and a letter to sign up for. |
| `blocks/articles-02.html` | Search the articles. A search of the journal: the query typed, topics and a year to narrow it, the number of results, rows with the words marked, and Load more. |
| `blocks/articles-03.html` | Archive. Every article by month: tabs for the year, a row per article with its day, title and topic, and the topics and authors with their counts at the side. |

## Article

| File | What it is |
| --- | --- |
| `blocks/article-01.html` | Long read with contents. A long read: standfirst, byline, a wide lead picture, the contents at the side, prose with a pull quote and figures, then tags and share links. |
| `blocks/article-02.html` | Article with key facts. A how-to article beside an ink card of key facts: a callout, a table of how long a jar keeps, numbered notes and a note of what was updated. |
| `blocks/article-03.html` | The end of an article. Where an article ends: its last paragraphs, the author, the previous and next articles, comments with a reply, a comment form and three related ones. |

## Blog

| File | What it is |
| --- | --- |
| `blocks/blog-01.html` | Blog home. A blog home: the latest posts with their date, author and tags, pages at the end, and an about card, the tags and a subscribe form at the side. |
| `blocks/blog-02.html` | Author page. One author's page: avatar, role, a short bio and links, three figures about their writing, their posts as cards with pages, and the other authors. |
| `blocks/blog-03.html` | Posts with a tag. One tag's page: tabs to switch tags, its posts by year in sections that fold, the current year open, and the season's figure and authors at the side. |

## Wiki

| File | What it is |
| --- | --- |
| `blocks/wiki-01.html` | Wiki page. A handbook page beside a tree of pages: who edited it last, an infobox, numbered steps, a callout, a table and a question on whether it helped. |
| `blocks/wiki-02.html` | Wiki home. A handbook's front page: a search, the sections as tiles with their page counts, recent changes, the most read pages and those due for a review. |
| `blocks/wiki-03.html` | Page history. The history of a handbook page: revisions with the date, author, summary and size of each, two ticked to compare, and the difference line by line. |
