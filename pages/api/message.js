import { createMessage } from "../../utils/openai";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { threadId, content, fileIds } = req.body;

      if (!threadId || !content) {
        return res.status(400).json({ error: "Missing Fields" });
      }

      // Inclua fileIds aqui
      let newMessage = await createMessage({ threadId, content, fileIds });
      res.status(200).json({ message: newMessage });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
