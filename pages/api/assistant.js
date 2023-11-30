import { NextApiResponse, NextApiRequest } from "next";
import { getAssistant } from "../../utils/openai";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { query: { assistantId } } = req;

      if (!assistantId) {
        return res.status(400).json({ error: "Missing assistantId query parameter" });
      }

      const assistant = await getAssistant(assistantId);
      res.status(200).json({ assistant });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
