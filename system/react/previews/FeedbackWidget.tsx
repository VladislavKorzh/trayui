import * as React from 'react';
import { FeedbackWidget, type FeedbackAnswer } from 'trayui-react';

export function Scales() {
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start' }}>
      <FeedbackWidget
        question="How likely are you to recommend Counter to another farm?"
        lowLabel="Not at all"
        highLabel="Very"
        thanks="Thank you. Oksana reads every answer."
        style={{ flex: '1 1 24rem', inlineSize: 'auto' }}
      />
      <FeedbackWidget
        question="How easy was packing today?"
        scale="1-5"
        lowLabel="Hard"
        highLabel="Easy"
        reasonLabel="What got in the way?"
        defaultRating={4}
        defaultReason="The label printer went offline twice."
        thanks="Thank you. We will look at the printer."
        style={{ flex: '1 1 18rem', inlineSize: 'auto' }}
      />
    </div>
  );
}

/** The answer comes back through onComplete: choose a number, then Send. */
export function Answered() {
  const [answer, setAnswer] = React.useState<FeedbackAnswer | null>(null);
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start' }}>
      <FeedbackWidget question="How was the courier today?" scale="1-5" lowLabel="Late" highLabel="On time" defaultRating={5} onComplete={setAnswer} />
      <p className="tray-demo-note" style={{ flexBasis: '14rem' }}>
        {answer ? `Sent: ${answer.rating}${answer.comment ? `, “${answer.comment}”` : ''}` : 'Nothing sent yet.'}
      </p>
    </div>
  );
}
