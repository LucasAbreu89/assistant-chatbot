// pages/api/createMessageWithFile.js

import { createMessageWithFile } from '../../utils/openai';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { threadId, content, fileId } = req.body;
            const message = await createMessageWithFile({ threadId, content, fileId });
            res.status(200).json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
