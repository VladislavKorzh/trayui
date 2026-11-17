---
category: Display
keywords: [badge, tag, status, pill, count]
---
# Badge

A badge is a short word or a number on a small chip: a status, a tag, a count.

## Use
```tsx
<Badge>To pack</Badge>
<Badge tone="ink">With the courier</Badge>
<Badge tone="success" icon="circle-check">Paid</Badge>
<Badge tone="danger" icon="circle-x">Failed</Badge>
<Badge tone="accent">New</Badge>
<Badge tone="off">Invited</Badge>
<Badge count>12</Badge>
```

## Do and don't
- Do give a status a word and, for success and danger, an icon: colour never stands alone.
- Do keep it to one or two words.
- Don't use more than one yellow badge in view.
- Don't make a badge clickable; use a Button or a Toggle.
