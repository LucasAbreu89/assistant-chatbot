//  ESTOU CRIANDO O THREAD DENTRO DO ASSISTANT FETCHER!!!


import { useState } from 'react';

const ThreadCreator = ({ setThreadId }) => {
  const [loading, setLoading] = useState(false);
  const [threadDetails, setThreadDetails] = useState(null); // Novo estado para detalhes do thread


  const createNewThread = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/thread', { method: 'POST' });
      const data = await res.json();
      setThreadId(data.id); // Atualize o state na página principal
      setThreadDetails(data); // Atualize os detalhes do thread
      console.log(data.id)
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={createNewThread} disabled={loading}>
        {loading ? 'Creating...' : 'Create New Thread'}
      </button>
      {threadDetails && (
        <div>
          {/* <h3>Thread Details:</h3>
          <pre>{JSON.stringify(threadDetails, null, 2)}</pre> */}
          <h3>ID do Thread:</h3>
          <p>{threadDetails.id}</p>
        </div>
      )}
    </div>
  );
};

export default ThreadCreator;
