import React, { useState } from 'react';
import FeedbackForm from './FeedbackForm'; // Supondo que você tenha criado esse componente

const ChatMessage = ({ message, copyToClipboard, formatMessage, getMessageType, messagesHistory }) => {
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackType, setFeedbackType] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false); // Estado geral para controle de feedback

    const handleFeedbackClick = (type) => {
        setFeedbackType(type);
        setShowFeedbackForm(true);
        setFeedbackSubmitted(true); // Marca que o feedback foi submetido
    };


    const onSubmitFeedback = async (feedbackData) => {
        try {
            const response = await fetch('/api/sendEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: feedbackData.type,
                    feedback: feedbackData.feedback,
                    messageContent: message.content, // Adiciona o conteúdo da mensagem ao e-mail
                    messagesHistory: messagesHistory.slice(-10) // Envia as últimas 10 mensagens

                }),
            });

            const data = await response.json();
            console.log('Response from server:', data.message);
        } catch (error) {
            console.error('Error sending request to server:', error);
        }

        setShowFeedbackForm(false);
    };

    const handleCloseFeedbackForm = () => {
        setShowFeedbackForm(false);
    };


    return (
        <div className={`relative flex items-start p-5 my-5 mr-4 rounded-lg ${message.role === 'assistant' ? 'bg-gray-50' : 'bg-gray-100'} text-black`}>
            <img src={message.role === 'assistant' ? "/physics.jpeg" : "/user.png"} alt={message.role} className="h-16 w-16 mr-4 rounded-full" />

            <div className="flex-grow flex flex-col justify-between"> {/* Adicionado flex flex-col justify-between */}
                <div>
                    <p><strong>{getMessageType(message.role)}</strong></p>
                    <div>{formatMessage(message.content)}</div>
                </div>

                {message.role === 'assistant' && (
                    <div className="flex mt-3">
                        {!feedbackSubmitted && (
                            <>
                                {feedbackType !== 'bad' && (
                                    <img
                                        src="/like.png"
                                        alt="Good"
                                        className="h-6 w-6 cursor-pointer hover:opacity-80 mr-2"
                                        onClick={() => handleFeedbackClick('good')}
                                    />
                                )}
                                {feedbackType !== 'good' && (
                                    <img
                                        src="/dislike.png"
                                        alt="Bad"
                                        className="h-6 w-6 cursor-pointer hover:opacity-80 mr-2"
                                        onClick={() => handleFeedbackClick('bad')}
                                    />
                                )}
                            </>
                        )}
                        {feedbackSubmitted && (
                            <img
                                src={feedbackType === 'good' ? "/like.png" : "/dislike.png"}
                                alt={feedbackType === 'good' ? "Good" : "Bad"}
                                className="h-6 w-6 opacity-50 mr-2"
                            />
                        )}
                        <img
                            src="/copy.png"
                            alt="Copy"
                            className="h-5 w-5 cursor-pointer hover:opacity-80 mr-2"
                            style={{ marginLeft: '3px', marginTop: '1px' }}
                            onClick={() => copyToClipboard(message.content, message.id)}
                        />
                    </div>
                )}

            </div>

            {showFeedbackForm && (
                <FeedbackForm
                    onSubmitFeedback={onSubmitFeedback}
                    type={feedbackType}
                    onClose={handleCloseFeedbackForm}
                />
            )}
        </div>
    );
};

export default ChatMessage;