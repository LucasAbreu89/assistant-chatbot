// pages/api/sendEmail.js

import formData from 'form-data';
import Mailgun from 'mailgun.js';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { type } = req.body; // Capturando o tipo de clique

        try {
            const mailgun = new Mailgun(formData);
            const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

            let subject, text;

            if (type === 'good') {
                subject = "Someone liked your bot";
                text = "Hey, someone just clicked the good button on your bot!";
            } else if (type === 'bad') {
                subject = "Someone disliked your bot";
                text = "Hey, someone just clicked the bad button on your bot!";
            } else {
                // Caso o tipo não seja nem 'good' nem 'bad'
                console.error('Invalid type received:', type);
                return res.status(400).json({ message: 'Invalid type specified' });
            }

            const html = `<h1>${text}</h1>`;

            const response = await mg.messages.create('sandbox777ed467b4b24e7b846cabf6ffc7bf2d.mailgun.org', {
                from: "Excited User <mailgun@sandbox777ed467b4b24e7b846cabf6ffc7bf2d.mailgun.org>",
                to: ["lag.programmer@gmail.com", "ok@plusplustutors.com"],
                subject,
                text,
                html
            });

            console.log('Email sent:', response);
            res.status(200).json({ message: 'Email sent successfully!' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ message: 'Failed to send email', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
