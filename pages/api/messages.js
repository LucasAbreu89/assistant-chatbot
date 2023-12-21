// pages/api/messages.js
import { getMessages } from "../../utils/openai";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { threadId } = req.query;

      if (!threadId) {
        return res.status(400).json({ error: "Missing threadId query parameter" });
      }

      const messages = await getMessages(threadId);
      res.status(200).json({ messages });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
