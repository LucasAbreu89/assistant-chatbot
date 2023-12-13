import React from 'react';

const ChatMessage = ({ message, copyToClipboard, formatMessage, getMessageType }) => {
    return (
        <div className={`relative flex items-start p-5 my-5 mr-4 rounded-lg ${message.role === 'assistant' ? 'bg-gray-50' : 'bg-gray-100'} text-black`}>
            <img src={message.role === 'assistant' ? "/physics.jpeg" : "/user.png"} alt={message.role} className="h-16 w-16 mr-4 rounded-full" />
            <div className="flex-grow">
                <p><strong>{getMessageType(message.role)}</strong></p>
                <div>{formatMessage(message.content)}</div>
            </div>
            {message.role === 'assistant' && (
                <img
                    src="/copy.png"
                    alt="Copy"
                    className="absolute top-0 right-0 h-6 w-6 m-2 cursor-pointer hover:opacity-80"
                    onClick={() => copyToClipboard(message.content, message.id)}
                />
            )}
        </div>
    );
};

export default ChatMessage;