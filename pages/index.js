// Home.js
import { AppProps } from "next/app"

import { useState } from 'react';
import AssistantFetcher from '../components/AssistantFetcher';
import MessageCreator from '../components/MessageCreator';

export default function Home() {
  const [threadId, setThreadId] = useState(null);
  const assistantId = 'asst_TBktcPn6uphZ5ZTNq9nQAvLL';

  return (
    <div>
      <h1 className='bg-red-500'>Welcome to the Assistant Bot</h1> {/* Título alterado */}
      <AssistantFetcher setThreadId={setThreadId} />
      {threadId && <MessageCreator threadId={threadId} assistantId={assistantId} />}
    </div>
  );
}
