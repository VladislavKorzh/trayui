import * as React from 'react';
import { Questionnaire, type QuestionnaireAnswer } from 'trayui-react';

export function Delivery() {
  return (
    <div className="tray-row" style={{ justifyContent: 'center' }}>
      <Questionnaire
        questions={[
          {
            question: 'When should it arrive?',
            type: 'choice',
            options: [
              { value: 'Today, 14:00 to 18:00', label: 'Today', description: 'Between 14:00 and 18:00', defaultChecked: true },
              { value: 'Tomorrow morning', description: 'Between 10:00 and 14:00' },
              { value: 'Another day', description: 'Tell us which', other: true, otherLabel: 'Which day', otherPlaceholder: 'For example, Friday after six' },
            ],
          },
          {
            question: 'What should go in the box?',
            type: 'multiple',
            options: [
              { value: 'A gift box' },
              { value: 'A handwritten note' },
              { value: 'A serving card', label: 'A card on how to serve it' },
            ],
          },
          {
            question: 'Anything the courier should know?',
            type: 'text',
            optional: true,
            label: 'Note for the courier',
            placeholder: 'Door codes, landmarks, a safe place',
            hint: 'You can leave this empty.',
          },
        ]}
      />
    </div>
  );
}

export function SeveralAnswers() {
  const [answers, setAnswers] = React.useState<QuestionnaireAnswer[] | null>(null);
  return (
    <div className="tray-stack" style={{ maxWidth: 544 }}>
      <Questionnaire
        onComplete={setAnswers}
        doneTitle="Your jars are set aside"
        questions={[
          {
            question: 'Which sizes should we set aside?',
            type: 'multiple',
            options: [
              { value: '30 g jar', defaultChecked: true },
              { value: '50 g jar', defaultChecked: true },
              { value: '100 g jar' },
            ],
          },
          {
            question: 'How should we reach you?',
            type: 'choice',
            options: [
              { value: 'By phone', description: 'We call once, between 10:00 and 18:00' },
              { value: 'In this chat', description: 'You get a message when the jars are packed' },
            ],
          },
        ]}
      />
      <p className="caption tray-muted" aria-live="polite">
        {answers ? `onComplete: ${answers.map((a) => a.answer.join(', ') || 'skipped').join(' / ')}` : 'onComplete reports the answers after the last question.'}
      </p>
    </div>
  );
}
