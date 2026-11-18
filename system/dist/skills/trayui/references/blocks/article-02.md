# Article with key facts

A how-to article beside an ink card of key facts: a callout, a table of how long a jar keeps, numbered notes and a note of what was updated.

A help or how-to article for a reader who wants a number quickly, such as how long something keeps or when a shop opens. The text answers in order, with a warning callout, a table with a caption and a header on every row, numbered notes, and a dated line at the end on what was added. Badges above the title give the topic and the date of the last update, and an ink card at the side repeats the answers as terms and values for the reader who only scans.

Pick it over [the long read](https://trayui.com/blocks/article-01.md) when people arrive with a question rather than time: it has no lead picture and no contents, and the facts card takes their place. From 64rem the card is a 20rem column that stays in view; below that it moves under the article, after the notes. Each note number in the text is a link named "Note 1", and each note ends with a Back link to the place it was cited.

It is made of these components: [Navigation Menu](https://trayui.com/components/navigation-menu.md), [Tabs](https://trayui.com/components/tabs.md), [Button](https://trayui.com/components/button.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md), [Badge](https://trayui.com/components/badge.md), [Alert](https://trayui.com/components/alert.md), [Table](https://trayui.com/components/table.md), [Item](https://trayui.com/components/item.md), [Card](https://trayui.com/components/card.md), [Description List](https://trayui.com/components/description-list.md), [Footer](https://trayui.com/components/footer.md).

Behaviours it uses: `strip`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Article with key facts</title>
<meta name="description" content="A how-to article beside an ink card of key facts: a callout, a table of how long a jar keeps, numbered notes and a note of what was updated.">
<meta name="tray-category" content="Article">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<header class="tray-nav tray-container">
  <a class="tray-wordmark" href="#">Perly Farm</a>
  <nav class="tray-nav__strip" aria-label="Main">
    <ul class="tray-nav__links tray-tabs" data-tray="strip">
      <li><a class="tray-tab" href="#">Caviar</a></li>
      <li><a class="tray-tab" href="#">The farm</a></li>
      <li><a class="tray-tab" href="articles-01.html" aria-current="true">Journal</a></li>
      <li><a class="tray-tab" href="#">Visit us</a></li>
    </ul>
  </nav>
  <div class="tray-nav__actions">
    <a class="tray-btn tray-btn--sm" href="#">Order a jar</a>
  </div>
</header>

<main class="tray-container">
  <nav aria-label="Breadcrumb">
    <ol class="tray-crumbs">
      <li><a href="articles-01.html">Journal</a></li>
      <li><a href="#">Kitchen</a></li>
      <li><span aria-current="page">How long a jar keeps</span></li>
    </ol>
  </nav>

  <div class="tray-with-aside" style="padding-block: var(--space-6) var(--space-12)">
    <article aria-labelledby="title">
      <header class="tray-section__head">
        <div class="tray-row tray-row--sm">
          <span class="tray-badge">Kitchen</span>
          <span class="tray-badge"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-rotate-cw"/></svg>Updated 14 November 2026</span>
        </div>
        <h1 class="title" id="title">How long a jar of caviar keeps</h1>
        <p class="lead tray-soft">Sealed and cold, a jar keeps six weeks. Here is what shortens that, what stretches it, and how to tell when a jar is past its best.</p>
        <p class="caption tray-muted">By Iryna Bondar, who runs the farm kitchen. First published on <time datetime="2026-09-03">3 September 2026</time>, six minutes to read.</p>
      </header>

      <div class="tray-prose">
        <p>Snail caviar is a fresh food, salted only enough to keep. It has none of the long life of a tin of fish roe, and it forgives a warm kitchen far less. Most questions we hear at the market are some version of how long it will last, so here is the whole answer, with the numbers from our own cold room.</p>

        <h2 class="subtitle" id="sealed">Before you open it</h2>
        <p>A sealed jar keeps six weeks from the day it was packed, as long as it stays at 4&nbsp;&deg;C or below.<sup><a href="#note-1" id="ref-1" aria-label="Note 1">1</a></sup> The date on the lid already counts those weeks for you. Colder is better: on the bottom shelf, at the back, where most fridges sit at 1 or 2&nbsp;&deg;C, a jar keeps closer to eight weeks.<sup><a href="#note-2" id="ref-2" aria-label="Note 2">2</a></sup></p>
        <div class="tray-alert" role="note">
          <span class="tray-alert__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-triangle-alert"/></svg></span>
          <div class="tray-alert__body">
            <p class="tray-alert__title">Do not freeze the jar</p>
            <p class="tray-alert__text">Ice bursts the thin shell of each pearl, and a thawed jar turns to grey paste within a day. If you will not open it within six weeks, give it to someone who will.</p>
          </div>
        </div>

        <h2 class="subtitle" id="temperatures">At each temperature</h2>
        <p>These are the times we measured. They assume the jar went straight from the courier's chilled box into the fridge.</p>
        <div class="tray-table-wrap">
          <table class="tray-table">
            <caption>How long a jar keeps</caption>
            <thead>
              <tr>
                <th scope="col">Where</th>
                <th scope="col" data-num>Temperature</th>
                <th scope="col" data-num>Sealed</th>
                <th scope="col" data-num>Opened</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Bottom shelf, at the back</th><td data-num>0 to 2&nbsp;&deg;C</td><td data-num>8 weeks</td><td data-num>4 days</td></tr>
              <tr><th scope="row">Middle shelf</th><td data-num>3 to 4&nbsp;&deg;C</td><td data-num>6 weeks</td><td data-num>3 days</td></tr>
              <tr><th scope="row">Fridge door<sup><a href="#note-3" id="ref-3" aria-label="Note 3">3</a></sup></th><td data-num>6 to 8&nbsp;&deg;C</td><td data-num>2 weeks</td><td data-num>1 day</td></tr>
              <tr><th scope="row">Cool bag with ice packs</th><td data-num>4 to 6&nbsp;&deg;C</td><td data-num>2 days</td><td data-num>12 hours</td></tr>
              <tr><th scope="row">Kitchen table</th><td data-num>20&nbsp;&deg;C</td><td data-num>4 hours</td><td data-num>1 hour</td></tr>
            </tbody>
          </table>
        </div>
        <p>The door of a fridge warms every time it opens, which is why it does so badly. Keep the butter there and the caviar at the back.</p>

        <h2 class="subtitle" id="opened">Once it is open</h2>
        <p>Air and spoons are what spoil an open jar. Press the lid back on as soon as you have served, and take caviar from the top with a clean, dry spoon: one that has touched bread or butter carries enough with it to sour the jar in a day.</p>
        <p>An opened jar keeps three days on the middle shelf. If the pearls stick together, smell sharp or sit in a cloudy liquid, the jar is done. Do not taste it to check.</p>

        <h2 class="subtitle" id="serving">At the table</h2>
        <p>Caviar tastes of most at 4 to 6&nbsp;&deg;C, so take the jar out ten minutes before you serve it, and set it on a bowl of crushed ice if the meal is long. Whatever is left after two hours at the table should not go back in the fridge.</p>

        <h2 class="action" id="notes-title">Notes</h2>
        <ol class="tray-list-plain caption tray-soft" aria-labelledby="notes-title">
          <li id="note-1">The date on the lid assumes 4&nbsp;&deg;C, the middle shelf of most fridges. We print it on the day the jar is sealed. <a href="#ref-1" aria-label="Back to note 1 in the text">Back</a></li>
          <li id="note-2">Measured with a temperature logger inside a sealed jar over batches 12 to 14, opening one test jar a week to taste. <a href="#ref-2" aria-label="Back to note 2 in the text">Back</a></li>
          <li id="note-3">Measured in three household fridges in July, with the door opened about twenty times a day. <a href="#ref-3" aria-label="Back to note 3 in the text">Back</a></li>
        </ol>
        <div class="tray-item">
          <span class="tray-item__media"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-rotate-cw"/></svg></span>
          <span class="tray-item__body">
            <span class="tray-item__title">Updated on <time datetime="2026-11-14">14 November 2026</time></span>
            <span class="tray-item__text">We added the rows for the fridge door and a cool bag, which readers asked about at the market.</span>
          </span>
        </div>
      </div>
    </article>

    <aside class="tray-with-aside__aside" aria-labelledby="facts-title">
      <section class="tray-card tray-card--inverse tray-stack">
        <div class="tray-stack tray-stack--sm">
          <h2 class="subtitle" id="facts-title">Key facts</h2>
          <p class="caption tray-soft">For a sealed jar from the farm, kept in a home fridge.</p>
        </div>
        <dl class="tray-dl tray-dl--stack">
          <div><dt>Sealed, in the fridge</dt><dd>Up to 6 weeks at 4&nbsp;&deg;C</dd></div>
          <div><dt>Once opened</dt><dd>3 days, lid on</dd></div>
          <div><dt>Best shelf</dt><dd>Bottom, at the back</dd></div>
          <div><dt>Served at</dt><dd>4 to 6&nbsp;&deg;C, 10 minutes out</dd></div>
          <div><dt>Freezing</dt><dd>No, the pearls burst</dd></div>
          <div><dt>On sale now</dt><dd>Batch 14, sealed 28 October</dd></div>
        </dl>
        <div>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="#">See the jars and prices</a>
        </div>
      </section>
    </aside>
  </div>
</main>

<footer class="tray-footer tray-container">
  <div class="tray-footer__top">
    <div class="tray-footer__brand">
      <a class="tray-wordmark" href="#">Perly Farm</a>
      <p>Snail caviar from a small farm near Kyiv. The farm shop at Farm road 4 opens Thursday to Sunday, 10:00 to 18:00.</p>
    </div>
    <nav class="tray-footer__col" aria-label="Caviar">
      <h3>Caviar</h3>
      <a href="#">Jars and prices</a>
      <a href="#">Gift boxes</a>
      <a href="#">Delivery</a>
    </nav>
    <nav class="tray-footer__col" aria-label="Journal">
      <h3>Journal</h3>
      <a href="#">Farming</a>
      <a href="#">Kitchen</a>
      <a href="#">News</a>
      <a href="articles-03.html">Archive</a>
    </nav>
    <nav class="tray-footer__col" aria-label="The farm">
      <h3>The farm</h3>
      <a href="#">Our story</a>
      <a href="#">Visit us</a>
      <a href="#">Work with us</a>
    </nav>
    <nav class="tray-footer__col" aria-label="Help">
      <h3>Help</h3>
      <a href="article-02.html">Storing a jar</a>
      <a href="#">Returns</a>
      <a href="#">Contact</a>
    </nav>
  </div>
  <div class="tray-footer__bottom">
    <p>&copy; 2026 Perly Farm. Every name, date and figure on this page is demo data.</p>
    <ul class="tray-footer__legal" role="list">
      <li><a href="#">Privacy</a></li>
      <li><a href="#">Terms</a></li>
    </ul>
  </div>
</footer>
<script src="../components/bundle.js"></script>
</body>
</html>
```
