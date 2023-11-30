// components/AssistantRunner.js
import { useState } from 'react';
import RunStatusChecker from './RunStatusChecker';

const AssistantRunner = ({ threadId, assistantId }) => {
  const [runResult, setRunResult] = useState(null);
  const [runId, setRunId] = useState(null); // Adicionado para gerenciar o runId
  const [loading, setLoading] = useState(false);

  const runAssistant = async () => {
    setLoading(true);
    const instructions = "be polite"; 

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadId, assistantId, instructions }),
      });
      const data = await res.json();
      setRunResult(data);
      setRunId(data.id); // Definindo o runId baseado na resposta
    } catch (error) {
      console.error("Error running assistant:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <button onClick={runAssistant} disabled={loading}>
        {loading ? 'Running...' : 'Run Assistant'}
      </button>

      {runResult && (
        <div>
          <h3>Resultados do Assistente:</h3>
          <p>ID do Assistente: {runResult.assistant_id}</p>
          <p>ID do Thread: {runResult.thread_id}</p>
          <p>Status: {runResult.status}</p>
        </div>
      )}

      {runId && <RunStatusChecker threadId={threadId} runId={runId} />}
    </div>
  );
};

export default AssistantRunner;
