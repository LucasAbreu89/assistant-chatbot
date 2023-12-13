// MessageInput.js
import React, { useRef, useEffect } from 'react';
import Image from 'next/image';

const MessageInput = ({ content, setContent, sendMessage, loading, isHovered, setIsHovered, showTooltip, setShowTooltip }) => {
    const textareaRef = useRef(null);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = 'inherit';
        const height = Math.min(textarea.scrollHeight, 200); // Máximo de 200px
        textarea.style.height = `${height}px`;
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [content]);

    return (
        <div className="relative flex items-center">
            <textarea
                disabled={loading}
                ref={textareaRef}
                className="w-full mb-2 border border-gray-300 rounded-lg focus:outline-none focus:shadow-outline resize-none overflow-auto"
                style={{ maxHeight: '200px', paddingTop: '14px', paddingBottom: '14px', paddingRight: '48px', paddingLeft: '14px' }}
                value={content}
                onChange={(e) => {
                    setContent(e.target.value);
                    adjustTextareaHeight();
                }}
                placeholder="Type your Message"
            />
            <div
                className="absolute right-2 bottom-2 cursor-pointer"
                onClick={sendMessage}
                onMouseEnter={() => { setIsHovered(true); setShowTooltip(true); }}
                onMouseLeave={() => { setIsHovered(false); setShowTooltip(false); }}
                style={{ transform: 'translateY(-50%)', marginRight: '14px' }}
            >
                {loading ? (
                    <img src="/square.png" alt="Waiting" className="h-8 w-8" />
                ) : (
                    <img src={isHovered ? "/arrow2.png" : "/arrow.png"} alt="Send" className="h-8 w-8" style={{ borderRadius: '20%', border: '1px solid black' }} // Apply rounded border
                    />)}

                {showTooltip && (
                    <div style={{
                        position: 'absolute',
                        bottom: '40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'black',
                        color: 'white',
                        padding: '5px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        fontSize: '12px',
                    }}>
                        {loading ? 'Wait...' : 'Send Message'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageInput;
