// components/FeedbackForm.js
import React, { useState } from 'react';

const FeedbackForm = ({ onSubmitFeedback, type, onClose }) => {
    const [feedback, setFeedback] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Feedback submitted:", feedback); // Esta linha exibe o feedback no console
        onSubmitFeedback({ feedback, type });
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[650px]">
                {/* Container interno para o padding */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold">Provide additional feedback</h3>
                </div>

                {/* Linha horizontal que se estende por toda a largura do container */}
                <hr className="border-t border-gray-300" />

                {/* Continuação do container interno para o restante do conteúdo */}
                <div className="p-6">
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                        placeholder="Your feedback here..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 text-sm rounded"
                            onClick={handleSubmit}>
                            Submit Feedback
                        </button>
                        <button
                            className="ml-2 bg-gray-300 hover:bg-gray-500 text-white font-bold py-1 px-3 text-sm rounded"
                            onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackForm;
