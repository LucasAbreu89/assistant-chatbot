// components/ShowMessagesButton.js
import { useState } from 'react';

const ShowMessagesButton = ({ threadId }) => {
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages?threadId=${threadId}`);
      const data = await res.json();
      console.log(data);
      if (data.messages && Array.isArray(data.messages.data)) {
        setMessages(data.messages.data);
      } else {
        console.error("Formato de resposta inesperado:", data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchMessages} disabled={loading}>
        {loading ? 'Loading...' : 'Show Messages'}
      </button>
      {messages && Array.isArray(messages) && (
        <div>
          {messages.map((message) => (
            <p key={message.id}>Conteúdo da Mensagem: {message.content[0].text.value}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowMessagesButton;
