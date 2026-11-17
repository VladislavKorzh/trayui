---
category: Actions
keywords: [toggle group, segmented control, segments, tabs switch, view switcher, jar size, period picker]
---
# Toggle Group

A toggle group is the segmented control: a tray of segments where the selected one is solid ink.

## Use
```tsx
<ToggleGroup aria-label="Jar size" defaultValue="50" items={[
  { value: '30', label: '30 g' }, { value: '50', label: '50 g' }, { value: '100', label: '100 g' },
]} />

<ToggleGroup aria-label="View" size="sm" value={view} onChange={setView} items={[
  { value: 'list', label: 'List', icon: 'list' }, { value: 'grid', label: 'Grid', icon: 'layout-grid' },
]} />

<ToggleGroup aria-label="Text style" size="sm" iconOnly multiple values={styles} onValuesChange={setStyles} items={[
  { value: 'bold', label: 'Bold', icon: 'bold' }, { value: 'italic', label: 'Italic', icon: 'italic' },
]} />

<ToggleGroup aria-label="Period" fill defaultValue="week" items={periods} />   {/* equal columns, full width */}
```

## Variants
`size="sm"` has 44px segments in nav type, for toolbars. `fill` spreads the segments in equal columns across the full width. `iconOnly` makes square segments with the icon alone; each label becomes the segment's aria-label.

By default exactly one segment is on (`value`, `defaultValue`, `onChange`); with no default the first segment is chosen, since a single-choice group is never left empty. `multiple` lets several be on at once (`values`, `defaultValues`, `onValuesChange`). The segments are real radios or checkboxes: the arrow keys and form submission work, under `name`.

## Do and don't
- Do keep every label to one or two words, and two to five segments; more, or long labels, belong in a Select or a Radio Group.
- Do give the group an `aria-label`.
- Don't use it for navigation between pages; that is Tabs.
