---
category: Billing
keywords: [upgrade prompt, upsell, paywall, upgrade, locked feature, plan limit, premium, feature gate]
---
# Upgrade Prompt

An upgrade prompt stands where a feature would be when the plan does not have it: what the feature does, which plan has it, and one button to get it.

## Use
```tsx
<UpgradePrompt                                             /* in place of a whole section */
  title="Courier tracking is part of Shop"
  description="See where every box is and tell the customer before they ask."
  action={{ label: 'Upgrade to Shop', href: '/billing/plans' }}
  secondaryAction={{ label: 'Compare plans', href: '/plans' }}
/>

<UpgradePrompt variant="alert" icon="zap"                  /* one line inside a page, when a limit was reached */
  title="You have used all 50 orders this month"
  description="New orders wait until 1 December, or move to Shop for 1,000 a month."
  action={{ label: 'Upgrade to Shop', href: '/billing/plans' }} />

<UpgradePrompt variant="alert" tone="neutral"              /* for a team member who cannot upgrade */
  title="Roles are part of Market" description="Ask Oksana Franko, the owner of this workspace, to change the plan." />

<UpgradePrompt variant="locked" icon="chart-column" title="Reports are part of Shop"
  description="Orders and revenue by product, city and courier." action={{ label: 'Upgrade to Shop', href: '/billing/plans' }}>
  <Table columns={columns} rows={sampleReports} />         {/* a picture of the feature, dimmed */}
</UpgradePrompt>
```

## Variants
- `card`: a tray with the icon tile, the title, a sentence, the yellow button and a "Compare plans" link. In place of a whole section the plan lacks.
- `alert`: the Alert. `tone="accent"` (yellow, an ink button) for a limit the person can lift now; `tone="neutral"` with no action tells someone who cannot upgrade whom to ask.
- `locked`: a raised prompt floats over a dimmed picture of the feature. The picture is inert and hidden from screen readers: it is a picture of the feature, not the feature.

## Do and don't
- Do name the plan and say what the person gets, in their words.
- Do offer a way to compare plans beside the button.
- Don't show the prompt where the person cannot upgrade. Tell a team member to ask the owner instead.
- Don't interrupt a task with it. It waits where the feature lives.
