import React, { useRef, useEffect, useState } from 'react';
import styles from '@/styles/MessageInput.module.css'

const MessageInput = ({ content, setContent, sendMessage, loading, setExtractedImageText, clearImageOnSend }) => {
    const textareaRef = useRef(null);
    const [isFileProcessing, setIsFileProcessing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isHovering, setIsHovering] = useState(false);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = 'inherit';
        const height = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = `${height}px`;
    };

    const removeImage = () => {
        setImagePreviewUrl(null); // Remove a URL da imagem
        setExtractedImageText(''); // Remove o texto extraído

    };


    const handleSendMessage = () => {
        if (!loading) {
            sendMessage();
            clearImageOnSend();  // Chamada da nova função
            setImagePreviewUrl(null);  // Limpa o preview da imagem

        }
    };


    useEffect(() => {
        adjustTextareaHeight();
    }, [content]);

    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
            setIsFileProcessing(true);
            setImagePreviewUrl(URL.createObjectURL(file)); // Cria uma URL para o preview da imagem

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/processImage', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                console.log("Texto extraído:", data.text); // Adicionando console.log aqui

                setExtractedImageText(content + "\n" + data.text);
            } catch (error) {
                console.error('Error processing image:', error);
            } finally {
                setIsFileProcessing(false);
            }
        }
    };


    const handleDragOver = (e) => {
        e.preventDefault();  // Isso impede o comportamento padrão do navegador
    };

    const handlePaste = async (e) => {
        const items = (e.clipboardData || window.clipboardData).items;
        for (const item of items) {
            if (item.kind === 'file' && (item.type === "image/png" || item.type === "image/jpeg")) {
                e.preventDefault(); // Prevenir o comportamento padrão
                const file = item.getAsFile();
                setIsFileProcessing(true);
                setImagePreviewUrl(URL.createObjectURL(file)); // Cria uma URL para o preview da imagem

                const formData = new FormData();
                formData.append('file', file);

                // O mesmo código que você usa em handleDrop para processar a imagem
                try {
                    const response = await fetch('/api/processImage', {
                        method: 'POST',
                        body: formData,
                    });
                    const data = await response.json();
                    console.log("Texto extraído:", data.text); // Adicionando console.log aqui

                    setExtractedImageText(content + "\n" + data.text);
                } catch (error) {
                    console.error('Error processing image:', error);
                } finally {
                    setIsFileProcessing(false);
                }
            }
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
            setIsFileProcessing(true);
            setImagePreviewUrl(URL.createObjectURL(file)); // Para visualizar a imagem

            const formData = new FormData();
            formData.append('file', file);

            // Aqui você pode adicionar o código para enviar a imagem ao servidor
            // ou qualquer outra lógica de processamento que desejar
            try {
                const response = await fetch('/api/processImage', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                console.log("Texto extraído:", data.text); // Adicionando console.log aqui

                setExtractedImageText(content + "\n" + data.text);
            } catch (error) {
                console.error('Error processing image:', error);
            } finally {
                setIsFileProcessing(false);
            }
        }
    };


    return (
        <div className="relative flex-col items-center" style={{ position: 'relative' }}>
            {imagePreviewUrl && (
                <div
                    style={{ position: 'relative', display: 'inline-block' }}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <img src={imagePreviewUrl} alt="Preview" style={{ width: '50px', height: '50px' }} />
                    {isHovering && (
                        <>
                            <span
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    cursor: 'pointer',
                                    color: 'white', // Cor do texto
                                    fontWeight: 'bold',
                                    backgroundColor: 'black', // Cor de fundo do círculo
                                    borderRadius: '50%', // Torna o fundo circular
                                    width: '20px', // Largura do círculo
                                    height: '20px', // Altura do círculo
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px' // Tamanho da fonte do "X"
                                }}
                                onClick={removeImage}
                            >
                                X
                            </span>
                            <div style={{
                                position: 'absolute',
                                top: '-30px',
                                right: '0',
                                backgroundColor: 'black',
                                color: 'white',
                                padding: '5px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                fontSize: '12px',
                            }}>
                                Delete File
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="relative flex">
                <div className={styles.attachmentButtonContainer}>
                    <input
                        type="file"
                        id="file-input"
                        accept="image/png, image/jpeg"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <label htmlFor="file-input">
                        <img
                            src="/attach.png"
                            alt="Attach"
                            className={styles.attachmentButton}
                            width={32}
                            height={32}
                        />
                    </label>
                </div>
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
                    onDrop={handleDrop}
                    onPaste={handlePaste}

                    onDragOver={handleDragOver}
                    placeholder="Type your message"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />


                <div
                    className="absolute right-2 bottom-2 cursor-pointer"
                    onClick={handleSendMessage}
                    onMouseEnter={() => { setIsHovered(true); setShowTooltip(true); }}
                    onMouseLeave={() => { setIsHovered(false); setShowTooltip(false); }}
                    style={{ transform: 'translateY(-50%)', marginRight: '14px' }}
                >
                    {loading ? (
                        <img src="/square.png" alt="Waiting" className="h-8 w-8" />
                    ) : (
                        <img src={isHovered ? "/arrow2.png" : "/arrow.png"} alt="Send" className="h-8 w-8" style={{ borderRadius: '20%', border: '1px solid black' }} />
                    )}

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

                {isFileProcessing && <div className="mt-2">Processing file...</div>}
            </div>

        </div>
    );
};

export default MessageInput;
