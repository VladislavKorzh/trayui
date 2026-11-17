# Footer

The footer ends every public page: the name and a line about the product, the site's links in columns, and a last row for the legal lines.

## Markup
```html
<footer class="tray-footer tray-container">
  <div class="tray-footer__top">
    <div class="tray-footer__brand">
      <a class="tray-wordmark" href="/">Counter</a>
      <p>The order desk for small farms.</p>
    </div>
    <nav class="tray-footer__col" aria-label="Product">
      <h3>Product</h3>
      <a href="/features">Features</a><a href="/pricing">Pricing</a>
    </nav>
    …more columns…
  </div>
  <div class="tray-footer__bottom">
    <p>&copy; 2026 Counter</p>
    <ul class="tray-footer__legal"><li><a href="/privacy">Privacy</a></li><li><a href="/terms">Terms</a></li></ul>
  </div>
</footer>
```
Up to four link columns beside the brand block from 56rem up; two columns of links below that, with the brand block above them. Each column is a `<nav>` with its own label. The bottom row holds the copyright line at the start edge and the legal links at the end edge; a theme toggle or a language select may sit there too.

## Do and don't
- Do keep the links to pages a visitor looks for at the end: pricing, help, contact, the legal ones.
- Do give each column a short heading in muted ink.
- Don't repeat the whole navigation, and don't add a second call to action here.
- Don't set the footer on a coloured card. It sits on the page, over a hairline.
