// pages/api/sendEmail.js
import SibApiV3Sdk from 'sib-api-v3-sdk';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { type, feedback, messageContent } = req.body;

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

                    </body></html>`;
            } else if (type === 'bad') {
                subject = "Negative Feedback Received";
                htmlContent = `<html><body>
                    <p>Someone disliked your bot. Here's their feedback:</p>
                    <blockquote>${feedback}</blockquote>

                    </body></html>`;
            } else {
                console.error('Invalid type received:', type);
                return res.status(400).json({ message: 'Invalid type specified' });
            }

            let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.sender = {
                email: 'okatanani@gmail.com',
                name: 'User IB PhysiAI'
            };
            sendSmtpEmail.to = [{
                email: 'ok@katanani.com',
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
