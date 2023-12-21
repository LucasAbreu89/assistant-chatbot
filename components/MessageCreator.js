import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage'; // Adicione esta importação
import initialMessage from './InitialMessage'; // Adicione esta importação
// import instructions from './Instruct';
import MessageInput from './MessageInput';
import copy from 'copy-to-clipboard';
import FileUploader from './FileUploader';
import FeedbackForm from './FeedbackForm'; // Supondo que você tenha criado esse componente
import styles from '@/styles/MessageCreator.module.css'

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};


const MessageCreator = ({ threadId, assistantId, instructions }) => {
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
  const [fileIds, setFileIds] = useState([]);
  const [firstMessageSent, setFirstMessageSent] = useState(false);
  const size = useWindowSize();
  const [expandedImageUrl, setExpandedImageUrl] = useState(null);

  const getMessageType = (role) => {
    return role === 'user' ? 'User:' : 'IB PhysiAI:';
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
      // Passa o array de fileIds diretamente
      const messageData = { threadId, content, fileIds };

      console.log("Sending message with file IDs:", messageData);

      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      const data = await res.json();
      setMessage(data.message);

      // Executa o assistente
      await runAssistant();

      // Limpa a caixa de texto
      setContent('');
      setFirstMessageSent(true);

    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  const runAssistant = async () => {
    try {
      // Certifique-se de que instructions não é nulo
      if (!instructions) {
        console.error("Instructions are not set.");
        return;
      }

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
      if (data.messages && Array.isArray(data.messages.data) && data.messages.data.length > 0) {
        setFirstMessageSent(true);
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
    const isMobile = size.width <= 550;

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
              <img
                src={imageUrls[fileId]}
                alt="Image"
                onClick={() => isMobile && setExpandedImageUrl(imageUrls[fileId])}
                style={{ cursor: isMobile ? 'pointer' : 'default' }}
              />
              {!isMobile && (
                <img
                  src="/copy.png"
                  alt="Copy Image"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    cursor: 'pointer',
                    // Estilize conforme necessário
                  }}
                  onClick={() => copyImageToClipboard(content.image_file.file_id)}
                />
              )}
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

  const copyImageToClipboard = async (fileId) => {
    try {
      const imageUrl = imageUrls[fileId];
      if (!imageUrl) {
        throw new Error('Imagem não encontrada');
      }

      // Busca a imagem como Blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Copia a imagem como Blob para a área de transferência
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      setCopiedImageMessage('Image Copied!');
      setShowCopiedAlert(true);
      setTimeout(() => setShowCopiedAlert(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar a imagem:', error);
    }
  };


  useEffect(() => {
    if (firstMessageSent) {
      scrollToBottom();
    }
  }, [messages, loading, firstMessageSent]);


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

  const handleFileUpload = (newFileId) => {
    setFileIds(prevFileIds => [...prevFileIds, newFileId]);
  };

  useEffect(() => {
    console.log("File IDs atualizados:", fileIds);
  }, [fileIds]);


  return (
    <div className={`flex justify-center items-center h-screen ${styles.messagecreator}`}>
      <div className={`w-[950px] p-4 bg-white rounded-lg shadow-md mx-auto  ${styles.messagecreator}`}>
        <div className={`mb-4 overflow-y-auto h-[500px] bg-white ${styles.textareaa}`}>
          {/* Renderizar a mensagem inicial com a imagem do assistente */}
          <div className={`relative flex items-start p-5 my-5 mr-4 rounded-lg bg-gray-50 text-black`}>
            <img src="/physics.jpeg" alt="IB PhysiAI" className="h-16 w-16 mr-4 rounded-full" />
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
                copyImageToClipboard={copyImageToClipboard}
                messagesHistory={messages} // Adicione esta linha

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
        {/* <FileUploader onFileUpload={handleFileUpload} /> */}
        {expandedImageUrl && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
            onClick={() => setExpandedImageUrl(null)}
          >
            <img src={expandedImageUrl} alt="Expanded" style={{ maxHeight: '90%', maxWidth: '90%' }} />
          </div>
        )}
      </div>

    </div>
  );
}
export default MessageCreator;
