# Blocks

A block is one screen-sized composition built only from the components and the layout classes: copy it into a product and fill it. There are 64; each is one file in `blocks/`.

A page links `../tokens.css`, `../components/bundle.css` and `../components/bundle.js`, so it works as it is one folder below those three files. The grey trays (`tray-slot`) in a block stand in for your content.

## Dashboard

| File | What it is |
| --- | --- |
| `blocks/dashboard-01.html` | Dashboard. A dashboard with a sidebar, stat cards, a chart and an orders table. |

## Stats

| File | What it is |
| --- | --- |
| `blocks/stats-01.html` | Stat cards with a period switch. Six stat cards in two groups, each set against the period before, under a switch between 7 days, 30 days and the season. |
| `blocks/stats-02.html` | Stat cards over a season chart. Stat cards and one large chart of the season on the ink card, with the harvest by bed and the goals of the season beneath. |
| `blocks/stats-03.html` | Breakdown by channel. A breakdown of the month: orders by channel beside the best sellers with their share, then orders by city and the share of repeat customers. |

## Tables

| File | What it is |
| --- | --- |
| `blocks/table-01.html` | Table with filters and bulk actions. A table of batches in a card: a filter bar with search, two filters and a date range, rows to select with actions for them, a total and numbered pages. |
| `blocks/table-02.html` | Table with sortable columns and row menus. A table of customers with avatars, columns that sort, a search and a menu on each row, beside a sidebar folded to a rail. |
| `blocks/table-03.html` | Table with status tabs and a details sheet. Deliveries of the day in a table filtered by tabs with counts; each order opens its details in a sheet. |

## Settings

| File | What it is |
| --- | --- |
| `blocks/settings-01.html` | Profile settings. A personal profile in sections: a photo to upload, name and contact, language and time, and one bar that saves every change. |
| `blocks/settings-02.html` | Notifications by channel. Notification settings channel by channel: email, the phone app and text messages, each with its own switches, and quiet hours for the night. |
| `blocks/settings-03.html` | Security and the danger zone. Two-step sign-in, the devices you are signed in on, and deleting the workspace behind a dialog that asks you to type its name. |

## Empty states

| File | What it is |
| --- | --- |
| `blocks/empty-01.html` | First run. The orders page of a workspace on its first day: the first steps to take, a way to bring old orders, and the empty table where new ones will land. |
| `blocks/empty-02.html` | No results. A customer list whose search and filters match nobody: the filters stay in view, the empty table says where the near matches are, and one click clears what is in the way. |
| `blocks/empty-03.html` | No access. A packer opens the reports: a dimmed picture of what the page holds, who can open it, a way to ask for access, and the pages that are open to them. |

## Sidebar

| File | What it is |
| --- | --- |
| `blocks/sidebar-01.html` | Sidebar grouped by section. A simple sidebar with navigation grouped by section. |
| `blocks/sidebar-02.html` | Sidebar with sections that fold. A sidebar with sections that fold. |
| `blocks/sidebar-03.html` | Sidebar with a second level. A sidebar with a second level under its items. |
| `blocks/sidebar-04.html` | Sidebar with a level that folds. A sidebar whose second level folds under each item. |
| `blocks/sidebar-05.html` | Sidebar with menus. A sidebar whose items open their second level as a menu beside them. |
| `blocks/sidebar-06.html` | Sidebar that collapses to icons. A sidebar that collapses to a rail of icons. |
| `blocks/sidebar-07.html` | Inset sidebar. An inset sidebar: the page is a tray, the content is one white panel, with projects as secondary navigation. |
| `blocks/sidebar-08.html` | Two sidebars. Two sidebars side by side: a rail of sections and the list of the chosen one. |
| `blocks/sidebar-09.html` | Sidebar with a file tree. A sidebar with a file tree that folds. |
| `blocks/sidebar-10.html` | Sidebar with a calendar. A sidebar with a calendar and lists of calendars. |
| `blocks/sidebar-11.html` | Sidebar at the end. A sidebar at the end of the page, for the contents of a long document. |
| `blocks/sidebar-12.html` | Sidebar on each side. A sidebar on each side: navigation at the start, details at the end. |
| `blocks/sidebar-13.html` | Sidebar under a site header. A sidebar under a header that spans the product. |
| `blocks/sidebar-14.html` | Sidebar in a dialog. A settings dialog with its own sidebar. |
| `blocks/sidebar-15.html` | Navigation in a popover. A page whose navigation opens in a popover. |

## Login

| File | What it is |
| --- | --- |
| `blocks/login-01.html` | Sign-in form. A simple sign-in form in a card, centred on the page. |
| `blocks/login-02.html` | Sign-in page with a cover. A two-column sign-in page with a cover. |
| `blocks/login-03.html` | Sign-in page on a tray. A sign-in page on a grey ground. |
| `blocks/login-04.html` | Sign-in card with a picture. A sign-in card with the form beside a picture. |
| `blocks/login-05.html` | Email-only sign-in. A sign-in page that asks for the email only. |
| `blocks/login-06.html` | Sign-in with social accounts. A sign-in card with six sign-in providers and a way to the email form. |

## Signup

| File | What it is |
| --- | --- |
| `blocks/signup-01.html` | Sign-up form. A simple sign-up form. |
| `blocks/signup-02.html` | Sign-up page with a cover. A two-column sign-up page with a cover. |
| `blocks/signup-03.html` | Sign-up page on a tray. A sign-up page on a grey ground. |
| `blocks/signup-04.html` | Sign-up card with a picture. A sign-up card with the form beside a picture. |
| `blocks/signup-05.html` | Sign-up with sign-in providers. A sign-up form that offers six sign-in providers first. |
| `blocks/signup-06.html` | Sign-up with social accounts. A sign-up card with six sign-in providers and a way to the email form. |

## Pricing

| File | What it is |
| --- | --- |
| `blocks/pricing-01.html` | Plans at the end of a trial. Three plans side by side with a monthly or yearly switch, and what the trial used against the plan it fits. |
| `blocks/pricing-02.html` | Plans compared feature by feature. Every plan in one table, feature by feature in groups, with the price and a button at the head of each column. |
| `blocks/pricing-03.html` | Pricing by usage. One plan priced by the order: a slider that works out the month's price, what farms like yours pay, and questions that fold. |

## Catalog

| File | What it is |
| --- | --- |
| `blocks/catalog-01.html` | Catalog with filters on top. The shop's header, a filter bar for type, size and price with the count and the sort, a grid of product cards with a badge here and there, pages and the footer. |
| `blocks/catalog-02.html` | Catalog with a filter column. Filters in a column beside the results: checkbox groups, a price limit, an in-stock switch and a way to clear them, with the sort and a grid or list view above products shown as rows. On a phone the column opens from a button. |
| `blocks/catalog-03.html` | The range at a glance. The whole range on one page: a tile for each category with its count, a table that sets the jar sizes side by side with the price of 10 g, and three products people order most. |

## Shop

| File | What it is |
| --- | --- |
| `blocks/shop-01.html` | Product page. One product: a large picture with thumbnails, the rating, the price, a choice of size, the quantity, Add to cart and Save, the delivery, tabs with the details, a few reviews and four more products. |
| `blocks/shop-02.html` | Cart. The cart page of a shop: each line with its picture, size, price, quantity and a way to remove it, the way to free delivery, three things to add, and the summary with a promo code and Check out beside them. |
| `blocks/shop-03.html` | Cart in a sheet. A page of products whose cart opens in a sheet at the side: two lines with their quantity, the way to free delivery, the subtotal and Check out, with the page still in view. |

## Checkout

| File | What it is |
| --- | --- |
| `blocks/checkout-01.html` | Cart. A cart: lines with a quantity each, a meter to free delivery, a gift box, a promo code and the summary. |
| `blocks/checkout-02.html` | One-page checkout. Contact, delivery with a day and a time slot, and the payment method on one page, beside the order summary. |
| `blocks/checkout-03.html` | Order placed. The page after paying: the order number, the delivery, what happens next, the summary, and where the jars come from. |

## Articles

| File | What it is |
| --- | --- |
| `blocks/articles-01.html` | Journal. The front page of a journal: its name, topic tabs, one featured article, a grid of six more, pages, and a letter to sign up for. |
| `blocks/articles-02.html` | Search the articles. A search of the journal: the query typed, topics and a year to narrow it, the number of results, rows with the words marked, and Load more. |
| `blocks/articles-03.html` | Archive. Every article by month: a year switch, a heading per month, a row per article with its day, title and topic, and the topics and authors with their counts at the side. |

## Article

| File | What it is |
| --- | --- |
| `blocks/article-01.html` | Long read with contents. A long read: a large title and standfirst, the byline, a lead picture across the page, the contents at the side, prose with a pull quote and a second figure, then tags and share links. |
| `blocks/article-02.html` | Article with key facts. A practical article beside an ink card of key facts: a callout, a table of how long a jar keeps at each temperature, numbered notes, and a note of what was updated. |
| `blocks/article-03.html` | The end of an article. Where an article ends: its last paragraphs, the author, the previous and next articles, comments with a reply, a form to comment, and three related articles. |

## Blog

| File | What it is |
| --- | --- |
| `blocks/blog-01.html` | Blog home. The farm's journal: a short intro, the latest posts with their date, tags and author, a card about the farm, the tags and a way to subscribe at the side, and pages at the end. |
| `blocks/blog-02.html` | Author page. One author of the journal: a large avatar, the name, the role, a short bio and links, three figures about the writing, the author's posts as a grid of cards, and the other authors. |
| `blocks/blog-03.html` | Posts with a tag. The page of one tag: the other tags to switch to, how many posts it holds, and the posts grouped by year in sections that open and close, the current year open. |

## Wiki

| File | What it is |
| --- | --- |
| `blocks/wiki-01.html` | Wiki page. One page of a team handbook: a tree of pages at the side, the breadcrumb, who edited it last, its contents, numbered steps, an infobox, a callout, a table, related pages and a question about whether it helped. |
| `blocks/wiki-02.html` | Wiki home. The front page of a team handbook: a search at the top, the sections as tiles with how many pages each holds, the pages changed lately and by whom, the most read pages, and a button to start a page. |
| `blocks/wiki-03.html` | Page history. The revisions of one handbook page in a table: two to tick and compare, the date, the author, a summary and the size of each change, then the difference between two revisions, line by line. |
