import multer from 'multer';
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import fs from 'fs';

const upload = multer({ dest: '/tmp' });

// Middleware para lidar com o upload de arquivos
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

const client = new TextractClient({
    region: "us-east-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

export default async function processImage(req, res) {
    if (req.method === 'POST') {
        // Executar o middleware multer
        await runMiddleware(req, res, upload.single('file'));

        const file = req.file;
        const imageBytes = fs.readFileSync(file.path);

        try {
            const command = new DetectDocumentTextCommand({ Document: { Bytes: imageBytes } });
            const response = await client.send(command);
            const lines = response.Blocks.filter(block => block.BlockType === 'LINE').map(line => line.Text);
            res.status(200).json({ text: lines.join('\n') });
        } catch (error) {
            console.error("Error in Textract:", error);
            res.status(500).json({ error: error.message });
        } finally {
            // Limpar o arquivo temporário
            fs.unlinkSync(file.path);
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
