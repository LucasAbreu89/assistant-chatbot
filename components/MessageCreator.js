import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage'; // Adicione esta importação
import initialMessage from './InitialMessage'; // Adicione esta importação
import instructions from './Instructions';
import MessageInput from './MessageInput';
import Image from 'next/image';


const MessageCreator = ({ threadId, assistantId }) => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState(null);
  const [runId, setRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(null);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [copied, setCopied] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  const [copiedImageMessage, setCopiedImageMessage] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createNewMessage();
    }
  };

  const getMessageType = (role) => {
    return role === 'user' ? 'User:' : 'Assistant:';
  };

  const formatinicialMessage = (message) => {
    const boldRegex = /\*\*(.*?)\*\*/g;

    return message.split(boldRegex).map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index}>{part}</strong>;
      } else {
        return part.split('\n').map((item, key) => (
          <React.Fragment key={key}>
            {item}
            <br />
          </React.Fragment>
        ));
      }
    });
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

  const fetchImage = async (fileId) => {
    try {
      const res = await fetch(`/api/getImages?fileId=${fileId}`);
      const data = await res.json();
      return data.image;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  const loadImage = async (fileId) => {
    if (!imageUrls[fileId]) {
      const imageUrl = await fetchImage(fileId);
      setImageUrls(prev => ({ ...prev, [fileId]: imageUrl }));
    }
  };

  const formatMessage = (messageContent) => {
    const contentArray = Array.isArray(messageContent) ? messageContent : [messageContent];

    return contentArray.map((content, index) => {
      if (content.type === "text") {
        const boldRegex = /\*\*(.*?)\*\*/g;
        return (
          <span key={index}>
            {content.text.value.split(boldRegex).map((part, i) => {
              if (i % 2 === 1) {
                return <strong key={i}>{part}</strong>;
              } else {
                const lines = part.split('\n');
                return lines.map((line, lineIndex) => {
                  // Replace only leading whitespace and preserve spaces around colons
                  const processedLine = line.replace(/^\s+/, '').replace(/:\s/g, ': ');
                  return (
                    <React.Fragment key={lineIndex}>
                      {processedLine}
                      {lineIndex !== lines.length - 1 && <br />}
                    </React.Fragment>
                  );
                });
              }
            })}
          </span>
        );
      } else if (content.type === "image_file") {
        const fileId = content.image_file.file_id;
        loadImage(fileId);

        if (imageUrls[fileId]) {
          return (
            <div style={{ position: 'relative' }} key={index}>
              <img src={imageUrls[fileId]} alt="Image" />
              <img
                src="/copy.png"
                alt="Copy Image"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  cursor: 'pointer',
                  // Estilize conforme necessário
                }}
                onClick={() => copyImageUrlToClipboard(imageUrls[fileId])}
              />
            </div>
          );
        } else {
          return <p key={index}>Loading image...</p>;
        }
      }
    }).filter(Boolean); // Filtrar elementos nulos ou undefined
  };

  const messagesEndRef = useRef(null);
  const loadingRef = useRef(null);

  const scrollToBottom = () => {
    if (loading) {
      loadingRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const copyToClipboard = (messageContent, messageId) => {
    let textToCopy = '';
    messageContent.forEach(content => {
      if (content.type === "text") {
        textToCopy += content.text.value + '\n';
      }
    });

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedImageMessage('Text Copied!');
      setShowCopiedAlert(true);
      setTimeout(() => setShowCopiedAlert(false), 2000);
    }).catch(err => {
      console.error('Error copying text:', err);
    });
  };

  const copyImageUrlToClipboard = (imageUrl) => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      setCopiedImageMessage('Link of the image Copied');
      setShowCopiedAlert(true);
      setTimeout(() => setShowCopiedAlert(false), 2000);
    }).catch(err => {
      console.error('Erro ao copiar a URL da imagem:', err);
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const textareaRef = useRef(null);

  const sendMessage = () => {
    if (!loading && content) {
      createNewMessage(); // This function should set 'loading' to true
    }
  };

  useEffect(() => {
    if (!loading) {
      setContent(''); // Clear the textarea when loading is done
    }
  }, [loading]);


  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="w-[950px] p-4 bg-white rounded-lg shadow-md mx-auto">
        <div className="mb-4 overflow-y-auto h-[500px] bg-white">
          {/* Renderizar a mensagem inicial com a imagem do assistente */}
          <div className={`relative flex items-start p-5 my-5 mr-4 rounded-lg bg-gray-50 text-black`}>
            <img src="/physics.jpeg" alt="Assistant" className="h-16 w-16 mr-4 rounded-full" />
            <div className="flex-grow">
              <p><strong>{getMessageType(initialMessage.role)}</strong></p>
              <div>{formatinicialMessage(initialMessage.content[0].text.value)}</div>
            </div>
          </div>

          {/* Renderizar as mensagens do chat usando o componente ChatMessage */}
          {messages && Array.isArray(messages) && (
            [...messages].reverse().map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                copyToClipboard={copyToClipboard}
                formatMessage={formatMessage}
                getMessageType={getMessageType}
                copied={copied}
                showCopiedAlert={showCopiedAlert}
                copiedImageMessage={copiedImageMessage}
              />
            ))
          )}
          {showCopiedAlert && (
            <div className="fixed top-10 right-10 bg-green-500 text-white py-2 px-4 rounded-md">
              {copiedImageMessage}
            </div>
          )}

          <div ref={messagesEndRef} />

          {loading && (
            <div ref={loadingRef} className="flex justify-center items-center pt-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        <MessageInput
          content={content}
          setContent={setContent}
          sendMessage={sendMessage}
          loading={loading}
          isHovered={isHovered}
          setIsHovered={setIsHovered}
          showTooltip={showTooltip}
          setShowTooltip={setShowTooltip}
        />
      </div>
    </div>
  );
}
export default MessageCreator;
