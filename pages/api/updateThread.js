// pages/api/updateThread.js
import { updateThreadWithFile } from '../../utils/openai';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { threadId, fileId } = req.body;

            if (!threadId || !fileId) {
                return res.status(400).json({ error: "Missing threadId or fileId" });
            }

            const updatedThread = await updateThreadWithFile(threadId, fileId);
            res.status(200).json(updatedThread);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
