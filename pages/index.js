// Home.js
import { AppProps } from "next/app"

import { useState } from 'react';
import AssistantFetcher from '../components/AssistantFetcher';
import MessageCreator from '../components/MessageCreator';

export default function Home() {
  const [threadId, setThreadId] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const assistantId = 'asst_TBktcPn6uphZ5ZTNq9nQAvLL';

  return (
    <div>
      <AssistantFetcher setThreadId={setThreadId} setInstructions={setInstructions} />
      {threadId && <MessageCreator threadId={threadId} assistantId={assistantId} instructions={instructions} />}
    </div>
  );
}

