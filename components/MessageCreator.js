// MessageCreator.js

import { useState } from 'react';

const MessageCreator = ({ threadId, assistantId }) => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState(null);
  const [runId, setRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createNewMessage();
    }
  };
  const getMessageType = (role) => {
    return role === 'user' ? 'User:' : 'Assistant:';
  };

  const createNewMessage = async () => {
    setLoading(true);
    try {
      // Envia a mensagem
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, content }),
      });
      const data = await res.json();
      setMessage(data.message);

      // Executa o assistente
      await runAssistant();

      // Limpa a caixa de texto
      setContent('');
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };


  const runAssistant = async () => {
    const instructions = "be polite"; // Ou alguma lógica para definir as instruções
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, assistantId, instructions }),
      });
      const data = await res.json();
      setRunId(data.id);
      await checkRunStatus(data.id);
    } catch (error) {
      console.error("Error running assistant:", error);
    }
  };

  const checkRunStatus = async (runId) => {
    try {
      const res = await fetch('/api/checkRun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, runId }),
      });
      const data = await res.json();
      if (data.status === 'completed') {
        // Buscar e exibir as mensagens assim que o status estiver 'completed'
        await fetchMessages();
      } else {
        // Recheck the status after a delay
        setTimeout(() => checkRunStatus(runId), 1000);
      }
    } catch (error) {
      console.error("Error checking run status:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?threadId=${threadId}`);
      const data = await res.json();
      if (data.messages && Array.isArray(data.messages.data)) {
        setMessages(data.messages.data);
        console.log(data.messages.data);
      } else {
        console.error("Formato de resposta inesperado:", data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      // Adicionando um atraso de 1 segundo antes de definir loading como false
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };



  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="w-[800px] p-4 bg-gray-700 rounded-lg shadow-md mx-auto"> {/* Alterado para fundo cinza escuro */}
        <div className="mb-4 overflow-y-auto h-[400px]" >
          {messages && Array.isArray(messages) && (
            [...messages].reverse().map((message) => (
              <div key={message.id} className={`p-5 my-5 mr-4 rounded-lg ${message.role === 'user' ? 'bg-gray-200' : 'bg-gray-300'} text-black`}> {/* Alterado para cinza claro para mensagens do usuário e cinza médio para o bot */}
                <p><strong>{getMessageType(message.role)}</strong></p> {/* Movido para uma linha separada */}
                <p>{message.content[0].text.value}</p>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-center items-center pt-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        <div>
          <textarea
            className="w-full p-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:shadow-outline"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem"
          />
          <button
            className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:shadow-outline"
            onClick={createNewMessage}
            disabled={!content || loading}
          >
            {loading ? 'Enviando...' : 'Enviar Mensagem'}
          </button>

        </div>
      </div>
    </div>
  );


};


export default MessageCreator;
