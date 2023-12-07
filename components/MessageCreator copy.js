import React, { useState, useEffect, useRef } from 'react';

const instructions = `Role: 
1. To offer comprehensive and diverse support to IB Physics students, being friendly, encouraging, professional, and informative.

2. Promotion of IB Tutors: Consistently promote the benefits and importance of IB tutors throughout the conversation when relevant.

3. End-of-Message Prompts: at the end of each message, offer a selection of four prompts to initiate future discussions, presented as numbered bullet points with numbers.

Functions Include:

1. IB Physics Instructor: Providing detailed explanations aligned with the 2022 IB Physics syllabus and guiding on queries beyond the syllabus. Refer to the provided physics subject guide PDF document.

2. Physics IA Reviewer: Reviewing Physics Internal Assessments, offering feedback on research question clarity, methodology, data analysis, and conclusion. Provide review and feedback based on the provided IB Physics IA guide PDF.

3. Physics IA Ideation Bot: Assisting in developing IA research questions based on students' interests and resources.

4. Exam Preparation and Strategy: Offering advice on exam techniques, time management, and different question types, including sample questions and strategies.

5. Practical Experiment Guidance: Helping set up and conduct physics experiments, explaining their principles and results.

6. Real-World Physics Applications: Explaining the application of physics concepts in real-world scenarios.

7. Study and Revision Techniques: Advising on effective physics study and revision methods.

8. Interactive Quizzes and Assessments: Creating and presenting interactive quizzes to help students test their understanding and track progress.

When possible, promote our online IB tutoring services at IB ++tutors for more personal and dedicated support. We are one of the leading IB tutoring companies with vetted online tutors and examiners from all over the world.`;


const MessageCreator = ({ threadId, assistantId }) => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState(null);
  const [runId, setRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(null);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [copied, setCopied] = useState(null); // Adicionado estado para 'copied'


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createNewMessage();
    }
  };
  const getMessageType = (role) => {
    return role === 'user' ? 'User:' : 'Assistant:';
  };

  const initialMessage = {
    id: 'initial-message',
    role: 'assistant',
    content: [{
      text: {
        value: `Hello there! 👋 I'm thrilled to welcome you to our tutoring service where I'm here to provide you a helping hand with your IB Physics queries. 🎓 Whether you're puzzling over a tricky problem, prepping for exams, or getting your Physics IA off the ground, I'm here to guide you through it all with friendly and insightful support. ✨

Don't hesitate to reach out with whatever's on your mind. Here's how I can assist you:

- Struggling with homework? Let's work through it together step-by-step. 📚
- IA got you perplexed? I can help clarify your ideas or review your draft. 🔍
- Exam prep making you anxious? I've got strategies to boost your confidence and performance. 🏆
- Curious about real-world physics? Let's discuss how it all applies beyond the classroom. 🌍

So, how can I help you shine in IB Physics today? Let me know by picking an option or ask away about anything else physics-related! 😊

Just remember, no question is too small and every challenge is an opportunity to learn and grow. Let's get started!`
      }
    }]
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

  const formatMessage = (message) => {
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



  const messagesEndRef = useRef(null);
  const loadingRef = useRef(null);

  const scrollToBottom = () => {
    if (loading) {
      loadingRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopiedAlert(true);
      setTimeout(() => setShowCopiedAlert(false), 2000); // Esconde o aviso após 2 segundos
    }).catch(err => {
      console.error('Erro ao copiar texto: ', err);
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="w-[950px] p-4 bg-white rounded-lg shadow-md mx-auto">
        <div className="mb-4 overflow-y-auto h-[400px] bg-white">
          {/* Renderizar a mensagem inicial com a imagem do assistente */}
          <div className={`relative flex items-center p-5 my-5 mr-4 rounded-lg bg-gray-50 text-black`}>
            <img src="/physics.jpeg" alt="Assistant" className="h-16 w-16 mr-4 rounded-full" />
            <div className="flex-grow" >
              <p><strong>{getMessageType(initialMessage.role)}</strong></p>
              <div>{formatMessage(initialMessage.content[0].text.value)}</div>
            </div>
          </div>

          {/* Renderizar as mensagens do chat */}
          {messages && Array.isArray(messages) && (
            [...messages].reverse().map((message) => (
              <div key={message.id} className={`relative flex items-start p-5 my-5 mr-4 rounded-lg ${message.role === 'assistant' ? 'bg-gray-50' : 'bg-gray-100'} text-black`}>
                {message.role === 'assistant' ? (
                  <>
                    <img src="/physics.jpeg" alt="Assistant" className="h-16 w-16 mr-4 rounded-full" />
                    <div className="flex-grow">
                      <p><strong>{getMessageType(message.role)}</strong></p>
                      <p>{formatMessage(message.content[0].text.value)}</p>
                    </div>
                    <img
                      src="/copy.png"
                      alt="Copy"
                      className={`absolute top-0 right-0 h-6 w-6 m-2 cursor-pointer hover:opacity-80 ${copied === message.id ? 'text-green-500' : ''}`}
                      onClick={() => copyToClipboard(message.content[0].text.value, message.id)}
                    />
                    {showCopiedAlert && (
                      <div className="fixed top-10 right-10 bg-green-500 text-white py-2 px-4 rounded-md">
                        Text Copied!
                      </div>
                    )}

                  </>

                ) : (
                  // User's message layout
                  <>
                    <img src="/user.png" alt="User" className="h-16 w-16 mr-4 rounded-full" />
                    <div className="flex-grow">
                      <p><strong>{getMessageType(message.role)}</strong></p>
                      <p>{formatMessage(message.content[0].text.value)}</p>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />

          {loading && (
            <div ref={loadingRef} className="flex justify-center items-center pt-2">
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
            placeholder="Type your Message"
          />
          <button
            className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:shadow-outline"
            onClick={createNewMessage}
            disabled={!content || loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default MessageCreator;