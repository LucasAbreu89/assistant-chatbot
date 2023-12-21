// pages/api/runCheck.js
import { runCheck } from "../../utils/openai";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { runId, threadId } = req.body;

      if (!runId || !threadId) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const check = await runCheck({ runId, threadId });
      res.status(200).json(check);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
