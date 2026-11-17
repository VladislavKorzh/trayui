---
category: Conversation
keywords: [trace, agent steps, tool calls, reasoning, activity, chain of thought, worked for, ai steps]
---
# Trace

A trace shows what an agent did on the way to an answer: one line per step, with its state and how long it took.

## Use
```tsx
<Trace
  summary="Worked for 42 seconds, 5 steps"
  steps={[
    { verb: 'Read', text: 'orders-november.csv', icon: 'file', time: '0.4 s' },
    { verb: 'Ran', text: 'the stock check', icon: 'terminal', time: '8.0 s',
      detail: <CodeBlock size="sm" highlight={false} code="autumn batch: 132 left" /> },
    { verb: 'Could not reach', text: "the courier's schedule", status: 'failed', time: '30 s' },
    { verb: 'Writing', text: 'the summary', status: 'running' },
  ]}
/>
```

Each line is a 32px icon tile, a title that starts with a bold verb, and a time. A hairline joins the tiles.

## States
- `done` (default): the step's icon and its time.
- `running`: a Spinner in the tile and the verb in the present ("Writing the summary").
- `failed`: the tile and the verb turn danger. Say what failed in the title.
- Denied or skipped: a plain line with the verb "Denied" or "Skipped".

## Summary
`summary` folds the steps under a disclosure line, "Worked for 42 seconds, 5 steps". Keep it open while the work runs and closed once the answer is there: `defaultOpen={false}`, or control it with `open` and `onOpenChange`. Without `summary` only the list of steps is drawn. In a conversation, put the Trace in the assistant's Message, before the answer.

## Do and don't
- Do write each step as verb plus object: "Read orders.csv", "Searched for chilled delivery".
- Do put a request for permission outside the trace, with Approve and Deny buttons; it is a question, not activity.
- Don't show raw tool names or arguments as the title.
- Don't keep a finished trace open over the answer.
