import { createMessage } from "../utils/openai";
import { NextApiResponse, NextApiRequest } from "next";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { threadId, content } = req.body;

      if (!threadId || !content) {
        return res.status(400).json({ error: "Missing Fields" });
      }

      let newMessage = await createMessage({ threadId, content });
      res.status(200).json({ message: newMessage });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
