// pages/api/run.js
import { runAssistant } from "../utils/openai";
import { NextApiResponse, NextApiRequest } from "next";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { threadId, assistantId, instructions } = req.body;

      if (!assistantId || !threadId || !instructions) {
        return res.status(400).json({ error: "Missing Fields" });
      }

      const runResult = await runAssistant({ assistantId, threadId, instructions });
      res.status(200).json(runResult);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
