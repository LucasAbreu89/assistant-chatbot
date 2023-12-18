import React, { useState } from 'react';

const FileUploader = ({ onFileUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Por favor, selecione um arquivo antes de fazer o upload.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            console.log([...formData]); // Para verificar o conteúdo do FormData
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            // Fazendo o upload do arquivo
            const uploadResponse = await fetch('/api/uploadFile', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Falha no upload do arquivo.');
            }

            const uploadResult = await uploadResponse.json();
            console.log("Resposta completa:", uploadResult);

            // Chamar a função callback com o ID do arquivo
            onFileUpload(uploadResult.id);

            alert("Arquivo enviado com sucesso.");
        } catch (error) {
            console.error("Erro durante o upload:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} disabled={loading} />
            <button onClick={handleUpload} disabled={!selectedFile || loading}>
                {loading ? 'Sending...' : 'Send File'}
            </button>
        </div>
    );
};

export default FileUploader;
