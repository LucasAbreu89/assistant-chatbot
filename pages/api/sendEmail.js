// pages/api/sendEmail.js
import SibApiV3Sdk from 'sib-api-v3-sdk';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { type, feedback, messagesHistory } = req.body;
        // console.log("Mensagens recebidas:", JSON.stringify(messagesHistory, null, 2));


        try {
            let defaultClient = SibApiV3Sdk.ApiClient.instance;

            // Configure API key authorization: api-key
            let apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

            let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

            let subject, htmlContent;

            // Definindo o assunto e conteúdo do e-mail com base no tipo de feedback
            if (type === 'good') {
                subject = "Positive Feedback Received";
                htmlContent = `<html><body>
                    <p>Someone liked your bot. Here's their feedback:</p>
                    <blockquote>${feedback}</blockquote>
                    `;
            } else if (type === 'bad') {
                subject = "Negative Feedback Received";
                htmlContent = `<html><body>
                    <p>Someone disliked your bot. Here's their feedback:</p>
                    <blockquote>${feedback}</blockquote>
                    `;
            } else {
                console.error('Invalid type received:', type);
                return res.status(400).json({ message: 'Invalid type specified' });
            }

            let historyHtml = '<p>Recent chat history:</p><ul>';

            // Pegar as duas primeiras mensagens do array original
            const firstTwoMessages = messagesHistory.slice(0, 20);

            // Inverter a ordem das mensagens para que apareçam corretamente no e-mail
            firstTwoMessages.reverse().forEach(msg => {
                const sender = msg.role; // 'user' ou 'assistant'

                // Verifica todos os elementos no array 'content'
                msg.content.forEach(contentItem => {
                    if (contentItem.type === 'text') {
                        historyHtml += `<li>${sender}: ${contentItem.text.value}</li>`;
                    } else if (contentItem.type === 'image_file') {
                        historyHtml += `<li>${sender}: Image sent</li>`;
                    }
                });
            });

            historyHtml += '</ul>';
            htmlContent += historyHtml;


            let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.sender = {
                email: 'edu@plusplustutors.com',
                name: 'User Enlighten'
            };
            sendSmtpEmail.to = [{
                email: 'ok@plusplustutors.com',
                name: 'Recipient Name'
            }];
            sendSmtpEmail.subject = subject;
            sendSmtpEmail.htmlContent = htmlContent;

            await apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('Email sent successfully');
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
