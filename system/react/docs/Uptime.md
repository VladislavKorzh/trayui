---
category: Metrics
keywords: [uptime, status, status page, availability, incidents, service health, sla, outage]
---
# Uptime

Uptime shows whether a service is working now and how it did over the last 90 days: its state in words, a bar per day, and the share of time it was up.

## Use
```tsx
<div className="tray-stack" style={{ gap: 'var(--space-8)' }}>
  <Uptime name="Order API" share="99.94% up" incidents={{ 12: 'degraded', 47: 'down' }} />   {/* days ago: what happened */}
  <Uptime name="Courier tracking" state="slow" stateText="Slow since 09:40"
          share="99.71% up" incidents={{ 0: 'degraded' }} legend />                          {/* the key, once, under the last */}
  <ul className="tray-items tray-items--ruled" role="list">                                                   {/* the incidents, in words */}
    <Item size="sm" title="Order API was down for 18 minutes" text="29 September, 03:10 to 03:28. A database update ran long." />
  </ul>
</div>
```

## Parts
- The head: the service's name and its state now, with an icon and a word: 'working' ("Working", in success green), 'slow' ("Slow"), 'down' ("Down", in danger red). `stateText` says more: "Slow since 09:40".
- The bars: one per day, oldest first, drawn by the system's `uptime` behaviour. A normal day is a quiet grey bar, a slow day a short ink bar, an outage a full ink bar: shape and lightness tell them apart, not hue. `incidents` counts days back from today (0 is today).
- The foot: how far back the bars go, the share of time it was up, and "Today".
- `legend` adds the key under the foot. Show it once per page.

The bars are hidden from screen readers, so the state, the share and a list of incidents must be in the text.

## Do and don't
- Do list the incidents under the bars with their date and length.
- Do show the same number of days for every service on the page.
- Don't colour the bars green and red: a wall of colour hides the two days that matter.
- Don't round 99.94% up to 100%.
