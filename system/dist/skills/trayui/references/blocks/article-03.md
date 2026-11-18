# The end of an article

Where an article ends: its last paragraphs, the author, the previous and next articles, comments with a reply, a comment form and three related ones.

The bottom of a blog post or article page, where the reader decides what to do next. It takes up the text at its last two sections and goes on with a card about the author, links to the previous and the next article, a comment thread with a reply set inside the comment it answers, a comment form with a character count, and three related articles as cards.

It pairs with [the long read](https://trayui.com/blocks/article-01.md) or [the article with key facts](https://trayui.com/blocks/article-02.md): those two are about the top of the page and the reading, this one about what comes after. The text, the comments and the form keep to one column of at most 42rem. The name and email fields sit side by side from 40rem, and from 56rem the previous and next links share a row, as do the three related cards. Every comment is its own article element, named "Comment by" or "Reply by" and its author, and each Reply button says whom it answers.

It is made of these components: [Navigation Menu](https://trayui.com/components/navigation-menu.md), [Tabs](https://trayui.com/components/tabs.md), [Button](https://trayui.com/components/button.md), [Card](https://trayui.com/components/card.md), [Avatar](https://trayui.com/components/avatar.md), [Item](https://trayui.com/components/item.md), [Message](https://trayui.com/components/message.md), [Bubble](https://trayui.com/components/bubble.md), [Field](https://trayui.com/components/field.md), [Label](https://trayui.com/components/label.md), [Input](https://trayui.com/components/input.md), [Textarea](https://trayui.com/components/textarea.md), [Checkbox](https://trayui.com/components/checkbox.md), [Footer](https://trayui.com/components/footer.md).

Behaviours it uses: `count`, `strip`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The end of an article</title>
<meta name="description" content="Where an article ends: its last paragraphs, the author, the previous and next articles, comments with a reply, a comment form and three related ones.">
<meta name="tray-category" content="Article">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen">
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

  <main class="tray-screen__body tray-screen__body--narrow">
    <article aria-labelledby="title">
      <header class="tray-stack tray-stack--sm">
        <a class="tray-back" href="articles-01.html"><svg class="tray-icon tray-icon--flip" aria-hidden="true"><use href="#tray-i-arrow-left"/></svg>Kitchen</a>
        <h1 class="title" id="title">Six ways to serve a 30&nbsp;g jar</h1>
        <p class="caption tray-muted">Iryna Bondar, <time datetime="2026-11-05">5 November 2026</time>, five minutes to read</p>
      </header>
      <div class="tray-prose">
        <h2 class="subtitle" id="spoon">6. On its own, from a spoon</h2>
        <p>The plainest way is the one we come back to. Chill a small plate, open the jar at the table, and give everyone a spoon of bone, horn or wood; metal leaves a taste. A 30&nbsp;g jar gives two people three spoons each, which is about right.</p>
        <p>Eat it slowly. The first taste is salt, then something like mushrooms after rain, and the pearls hold for a moment before they give.</p>
        <h2 class="subtitle" id="start">Which one to start with</h2>
        <p>If you have never had snail caviar, start with the soft egg, the second of the six. It is warm and gentle, and it shows you the texture without asking you to love it all at once. If you already know you do, go straight to the spoon.</p>
        <p>Whichever you choose, open the jar only when the plates are on the table, and finish it within three days. If something here did not work in your kitchen, tell us below: we read every comment and test the recipe again.</p>
      </div>
    </article>

    <section class="tray-card tray-stack" aria-labelledby="author-name">
      <div class="tray-row">
        <span class="tray-avatar tray-avatar--lg" aria-hidden="true">IB</span>
        <div class="tray-stack tray-stack--sm">
          <h2 class="subtitle" id="author-name">Iryna Bondar</h2>
          <p class="caption tray-muted">Runs the farm kitchen</p>
        </div>
      </div>
      <p class="tray-soft">Iryna cooks for the market stall at weekends and tests every recipe in the journal on the farm's own stove, with a jar from the current batch.</p>
      <div>
        <a class="tray-btn tray-btn--quiet tray-btn--sm" href="#">Read her 10 articles</a>
      </div>
    </section>

    <nav class="tray-bento" aria-label="Previous and next article">
      <a class="tray-item tray-span-6" href="#" rel="prev">
        <span class="tray-item__media"><svg class="tray-icon tray-icon--flip" aria-hidden="true"><use href="#tray-i-arrow-left"/></svg></span>
        <span class="tray-item__body"><span class="tray-item__text">Previous article</span><span class="tray-item__title">Why the snails sleep from December</span></span>
      </a>
      <a class="tray-item tray-span-6" href="#" rel="next">
        <span class="tray-item__body"><span class="tray-item__text">Next article</span><span class="tray-item__title">Our farm shop opens at Farm road 4</span></span>
        <span class="tray-item__media"><svg class="tray-icon tray-icon--flip" aria-hidden="true"><use href="#tray-i-arrow-right"/></svg></span>
      </a>
    </nav>

    <section class="tray-stack tray-stack--lg" aria-labelledby="comments-title">
      <h2 class="subtitle" id="comments-title">4 comments</h2>
      <div class="tray-thread">
        <article class="tray-message tray-message--top" aria-label="Comment by Halyna Shevchenko">
          <span class="tray-avatar tray-avatar--sm" aria-hidden="true">HS</span>
          <div class="tray-message__content">
            <div class="tray-message__head"><b>Halyna Shevchenko</b><time datetime="2026-11-06T08:40">6 November, 08:40</time></div>
            <div class="tray-bubble">We tried the soft egg with one 30&nbsp;g jar for the two of us, and it was exactly enough. Next time I will warm the spoons less: the first pearls went soft.</div>
            <div class="tray-message__actions"><button class="tray-btn tray-btn--ghost tray-btn--sm" type="button" aria-label="Reply to Halyna Shevchenko">Reply</button></div>
            <article class="tray-message tray-message--top" aria-label="Reply by Iryna Bondar">
              <span class="tray-avatar tray-avatar--sm" aria-hidden="true">IB</span>
              <div class="tray-message__content">
                <div class="tray-message__head"><b>Iryna Bondar, author</b><time datetime="2026-11-06T10:15">10:15</time></div>
                <div class="tray-bubble">Thank you, Halyna. A spoon at room warmth is plenty; a hot one starts to cook the pearls within seconds, which is what you saw.</div>
                <div class="tray-message__actions"><button class="tray-btn tray-btn--ghost tray-btn--sm" type="button" aria-label="Reply to Iryna Bondar">Reply</button></div>
              </div>
            </article>
          </div>
        </article>
        <article class="tray-message tray-message--top" aria-label="Comment by Mykola Kovalchuk">
          <span class="tray-avatar tray-avatar--sm" aria-hidden="true">MK</span>
          <div class="tray-message__content">
            <div class="tray-message__head"><b>Mykola Kovalchuk</b><time datetime="2026-11-07T19:02">7 November, 19:02</time></div>
            <div class="tray-bubble">Can it go on blini straight from the pan, or should they cool first? Ours never last long enough to cool.</div>
            <div class="tray-message__actions"><button class="tray-btn tray-btn--ghost tray-btn--sm" type="button" aria-label="Reply to Mykola Kovalchuk">Reply</button></div>
          </div>
        </article>
        <article class="tray-message tray-message--top" aria-label="Comment by Olena Tkachenko">
          <span class="tray-avatar tray-avatar--sm" aria-hidden="true">OT</span>
          <div class="tray-message__content">
            <div class="tray-message__head"><b>Olena Tkachenko</b><time datetime="2026-11-09T12:30">9 November, 12:30</time></div>
            <div class="tray-bubble">The cucumber surprised me most. I would never have put caviar on something so plain, and it was the first plate to empty.</div>
            <div class="tray-message__actions"><button class="tray-btn tray-btn--ghost tray-btn--sm" type="button" aria-label="Reply to Olena Tkachenko">Reply</button></div>
          </div>
        </article>
      </div>
    </section>

    <section class="tray-card" aria-labelledby="comment-title">
      <form class="tray-form" action="/journal/comments" method="post">
        <div class="tray-stack tray-stack--sm">
          <h2 class="subtitle" id="comment-title">Leave a comment</h2>
          <p class="caption tray-soft">A person reads each comment before it appears, usually within a day.</p>
        </div>
        <div class="tray-fields">
          <div class="tray-field">
            <label class="tray-label" for="comment-name">Name</label>
            <input class="tray-input" id="comment-name" name="name" autocomplete="name" required>
          </div>
          <div class="tray-field">
            <label class="tray-label" for="comment-email">Email</label>
            <input class="tray-input" id="comment-email" name="email" type="email" autocomplete="email" aria-describedby="comment-email-hint" required>
            <p class="tray-field__hint" id="comment-email-hint">Never shown. We write only if you ask us to.</p>
          </div>
          <div class="tray-field tray-field--full">
            <label class="tray-label" for="comment-text">Comment</label>
            <textarea class="tray-textarea" id="comment-text" name="comment" rows="5" maxlength="1000" data-tray="count" aria-describedby="comment-text-hint" required></textarea>
            <div class="tray-field__foot"><p class="tray-field__hint" id="comment-text-hint">Plain words; links are removed.</p><span class="tray-field__count"></span></div>
          </div>
        </div>
        <div class="tray-form__foot">
          <label class="tray-check">
            <input type="checkbox" name="replies" checked>
            <span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span>
            <span>Email me when someone replies</span>
          </label>
          <div>
            <button class="tray-btn" type="submit">Post the comment</button>
          </div>
        </div>
      </form>
    </section>
  </main>

  <aside class="tray-container tray-section" aria-labelledby="related-title">
    <div class="tray-stack tray-stack--lg">
      <div class="tray-row tray-row--between">
        <h2 class="title" id="related-title">More from the kitchen</h2>
        <a class="tray-btn tray-btn--link" href="#">All 10 kitchen articles</a>
      </div>
      <div class="tray-bento">
        <a class="tray-card tray-span-4" href="#">
          <div class="tray-stack">
            <p class="caption tray-muted"><time datetime="2026-10-22">22 October 2026</time>, 4 minutes</p>
            <h3 class="subtitle" id="related-1">Caviar on a baked potato, the farm's way</h3>
            <p class="tray-soft">Butter, flaky salt, a spoon of sour cream, and 10&nbsp;g of caviar added at the very end.</p>
          </div>
        </a>
        <a class="tray-card tray-span-4" href="#">
          <div class="tray-stack">
            <p class="caption tray-muted"><time datetime="2026-10-08">8 October 2026</time>, 5 minutes</p>
            <h3 class="subtitle" id="related-2">What to pour with white caviar</h3>
            <p class="tray-soft">Dry, cold and quiet: the drinks we open at the farm table, and the two we leave shut.</p>
          </div>
        </a>
        <a class="tray-card tray-span-4" href="article-02.html">
          <div class="tray-stack">
            <p class="caption tray-muted"><time datetime="2026-09-03">3 September 2026</time>, 6 minutes</p>
            <h3 class="subtitle" id="related-3">How long a jar of caviar keeps</h3>
            <p class="tray-soft">Six weeks sealed, three days open, and never in the freezer: the numbers from our cold room.</p>
          </div>
        </a>
      </div>
    </div>
  </aside>

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
      <p>&copy; 2026 Perly Farm. Every name, date, comment and figure on this page is demo data.</p>
      <ul class="tray-footer__legal" role="list">
        <li><a href="#">Privacy</a></li>
        <li><a href="#">Terms</a></li>
      </ul>
    </div>
  </footer>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
