import React, { useState } from 'react';

const ChatMessage = ({ message, copyToClipboard, formatMessage, getMessageType, copyImageToClipboard }) => {
    const [isGoodClicked, setIsGoodClicked] = useState(false);
    const [isBadClicked, setIsBadClicked] = useState(false);
    const [showFeedbackAlert, setShowFeedbackAlert] = useState(false);

    const handleGoodClick = async () => {
        if (!isGoodClicked && !isBadClicked) {
            setIsGoodClicked(true);
            setShowFeedbackAlert(true);
            setTimeout(() => setShowFeedbackAlert(false), 3000);
            try {
                console.log('Sending request to server to send email');
                const response = await fetch('/api/sendEmail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type: 'good' }), // Passando um tipo para identificar o clique como "bad"
                });

                const data = await response.json();
                console.log('Response from server:', data.message);
            } catch (error) {
                console.error('Error sending request to server:', error);
            }
        }
    };

    const handleBadClick = async () => {
        if (!isGoodClicked && !isBadClicked) {
            setIsBadClicked(true);
            setShowFeedbackAlert(true);
            setTimeout(() => setShowFeedbackAlert(false), 3000);
            try {
                console.log('Sending request to server to send bad email');
                const response = await fetch('/api/sendEmail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type: 'bad' }), // Passando um tipo para identificar o clique como "bad"
                });

                const data = await response.json();
                console.log('Response from server:', data.message);
            } catch (error) {
                console.error('Error sending request to server:', error);
            }
        }
    };


    return (
        <div className={`relative flex items-start p-5 my-5 mr-4 rounded-lg ${message.role === 'assistant' ? 'bg-gray-50' : 'bg-gray-100'} text-black`}>
            <img src={message.role === 'assistant' ? "/physics.jpeg" : "/user.png"} alt={message.role} className="h-16 w-16 mr-4 rounded-full" />
            <div className="flex-grow">
                <p><strong>{getMessageType(message.role)}</strong></p>
                <div>{formatMessage(message.content)}</div>
            </div>
            {message.role === 'assistant' && (
                <div className="flex mr-10">
                    <img
                        src={isGoodClicked ? "/good_green.png" : "/good.png"}
                        alt="Good"
                        className="h-6 w-6 cursor-pointer hover:opacity-80 mr-2"
                        onClick={handleGoodClick}
                    />
                    <img
                        src={isBadClicked ? "/bad_red.png" : "/bad.png"}
                        alt="Bad"
                        className="h-6 w-6 cursor-pointer hover:opacity-80 mr-2"
                        onClick={handleBadClick}
                    />
                    <img
                        src="/copy.png"
                        alt="Copy"
                        className="h-6 w-6 cursor-pointer hover:opacity-80"
                        onClick={() => copyToClipboard(message.content, message.id)}
                    />
                </div>
            )}
            {showFeedbackAlert && (
                <div className="fixed top-10 right-10 bg-green-500 text-white py-2 px-4 rounded-md">
                    Thank you for your feedback!
                </div>
            )}

        </div>
    );
};

export default ChatMessage;
