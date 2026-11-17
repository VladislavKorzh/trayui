---
category: Conversation
keywords: [questionnaire, survey, quiz, wizard, multi-step form, clarifying questions, choices, follow-up]
---
# Questionnaire

A questionnaire asks a few questions one at a time, when an assistant or a flow needs answers before it can go on.

## Use
```tsx
<Questionnaire
  onComplete={(answers) => save(answers)}                 // [{ question, answer: string[] }]
  questions={[
    { question: 'When should it arrive?', type: 'choice', options: [
      { value: 'Today, 14:00 to 18:00', label: 'Today', description: 'Between 14:00 and 18:00', defaultChecked: true },
      { value: 'Another day', description: 'Tell us which', other: true, otherPlaceholder: 'For example, Friday after six' },
    ] },
    { question: 'What should go in the box?', type: 'multiple', options: [{ value: 'A gift box' }, { value: 'A handwritten note' }] },
    { question: 'Anything the courier should know?', type: 'text', optional: true, hint: 'You can leave this empty.' },
  ]}
/>
```

## Behaviour
Each question is one step. The questionnaire writes "Question 2 of 3", fills the step pills, and keeps Next disabled until the question is answered, unless the question is `optional`. Back returns to the previous question with its answer kept. The last Next reads "Finish": the summary appears with every answer listed ("Skipped" for an empty optional one), and `onComplete` is called with the answers. "Change the answers" starts again from the first question.

## Answers
- `choice`: one of several, as choice cards with radios. An option with `other` adds "Something else" with a text field; what is typed there becomes the answer.
- `multiple`: several, as checkboxes.
- `text`: free text, usually an optional last step.

An option's `value` is what the summary and `onComplete` report; its `label` is what the card shows.

## Do and don't
- Do ask only what changes what happens next, and three to five questions at most.
- Do offer the likely answers as choices and keep typing for the exception.
- Don't ask what you could have inferred from what they already said.
- Don't hide how many questions there are.
