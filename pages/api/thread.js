import { createThread } from "../utils/openai";
import { NextApiResponse, NextApiRequest } from "next";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      let newThread = await createThread();
      res.status(200).json(newThread);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
