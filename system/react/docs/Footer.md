---
category: Marketing
keywords: [footer, site footer, page footer, links, sitemap, legal, copyright]
---
# Footer

The footer ends every public page: the name and a line about the product, the site's links in columns, and a last row for the legal lines.

## Use
```tsx
<Footer
  contained                                  // centred in the page's container
  brand="Counter"
  tagline="The order desk for small farms."
  columns={[
    { title: 'Product', links: [{ label: 'Features', href: '/features' }, { label: 'Pricing', href: '/pricing' }] },
    { title: 'Help', links: [{ label: 'Getting started', href: '/start' }, { label: 'Contact us', href: '/contact' }] },
  ]}
  copyright="© 2026 Counter"
  legal={[{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }]}
/>
```

## Layout
From 56rem up, up to four link columns stand beside the brand block; below that, the brand block sits above two columns of links. Each column is a `<nav>` named by its heading. The headings are `<h3>`; `headingLevel={2}` makes them `<h2>` on a page with only an `<h1>`, so the outline skips no level. They look the same at every level. The bottom row holds the copyright line at the start edge and the legal links at the end edge, over a hairline; a theme toggle or a language select may join them through `extra`.

## Do and don't
- Do keep the links to pages a visitor looks for at the end: pricing, help, contact, the legal ones.
- Do give each column a short heading; it is set in muted ink.
- Don't repeat the whole navigation, and don't add a second call to action here.
- Don't set the footer on a coloured card. It sits on the page, over a hairline.
