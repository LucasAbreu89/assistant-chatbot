// AssistantFetcher.js

import { useState, useEffect, useCallback } from 'react';

const AssistantFetcher = ({ setThreadId, setInstructions }) => {
  const [assistant, setAssistant] = useState(null);
  const [loading, setLoading] = useState(false);

  const assistantId = 'asst_TBktcPn6uphZ5ZTNq9nQAvLL';

  const fetchAssistant = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assistant?assistantId=${assistantId}`);
      const data = await res.json();
      setAssistant(data.assistant);
      if (data.assistant && data.assistant.instructions) {
        setInstructions(data.assistant.instructions);
      } else {
        console.log('No instructions received from assistant data');
      }
      // console.log(data.assistant.instructions);
      console.log("ID do Assistente:", data.assistant.id);
      createThread(); // Chama createThread após definir as instruções
    } catch (error) {
      console.error("Error fetching assistant:", error);
    } finally {
      setLoading(false);
    }
  }, [assistantId, setInstructions]);

  useEffect(() => {
    fetchAssistant();
  }, [fetchAssistant]);

  const createThread = async () => {
    try {
      const res = await fetch('/api/thread', { method: 'POST' });
      const data = await res.json();
      setThreadId(data.id);
      console.log("Thread ID:", data.id); // Adicionar esta linha
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  return (
    <div>
      {loading ? <p>Loading...</p> : null /* Removida a exibição do ID do assistente */}
    </div>
  );
};

export default AssistantFetcher;
