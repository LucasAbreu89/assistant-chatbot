// Em /pages/api/getImages.js
import { fetchImageFromOpenAI } from "../../utils/openai";
import { NextApiResponse, NextApiRequest } from "next";

export default async function handler(req, res) {
    console.log("getImages API called with method:", req.method);
    if (req.method === 'GET') {
        const { query: { fileId } } = req;

        if (!fileId) {
            return res.status(400).json({ error: "Missing fileId query parameter" });
        }

        try {
            const imageBase64 = await fetchImageFromOpenAI(fileId);
            res.json({ image: `data:image/png;base64,${imageBase64}` });
        } catch (error) {
            console.error("Error retrieving file content:", error);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
