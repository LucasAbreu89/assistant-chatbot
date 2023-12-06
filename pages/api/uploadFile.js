// pages/api/uploadFile.js
import { UploadFile } from "../../utils/openai";
import { IncomingForm } from 'formidable';
import os from 'os';
import path from 'path';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
        let tempFilePath; // Declaração da variável no escopo acessível

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!files.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const originalFileName = files.file[0].originalFilename;
            const tempDir = os.tmpdir();
            const tempFilePath = path.join(tempDir, originalFileName);

            // Copie o arquivo para o diretório temporário com o nome original
            fs.copyFileSync(files.file[0].filepath, tempFilePath);

            // Passa o novo caminho para a função UploadFile
            const uploadedFile = await UploadFile(tempFilePath);

            res.status(200).json({ id: uploadedFile.id });
        } catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({ error: error.message });
        } finally {
            // Limpa o arquivo temporário independentemente do resultado do upload
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
    });

}
