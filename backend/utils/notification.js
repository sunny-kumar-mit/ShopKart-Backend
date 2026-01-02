const { Resend } = require('resend');
const twilio = require('twilio');

// Initialize Resend with API Key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

const getTwilioClient = () => {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        return new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return null;
};

exports.sendEmail = async (to, subject, htmlContent) => {
    if (!process.env.RESEND_API_KEY) {
        console.error('[Email] RESEND_API_KEY is missing');
        throw new Error('Resend API Key Missing');
    }

    try {
        const data = await resend.emails.send({
            from: 'ShopKart <onboarding@resend.dev>', // Default testing sender for Resend
            to: to, // In free tier, this works if 'to' is the same as signed-up email
            subject: subject,
            html: htmlContent || subject, // Resend expects html fields
        });

        if (data.error) {
            console.error('[Email] Resend API Error:', data.error);
            throw new Error(data.error.message);
        }

        console.log('[Email] Sent via Resend:', data.id);
        return data;
    } catch (error) {
        console.error('[Email] Execution Error:', error.message);
        throw error;
    }
};

exports.sendSms = async (to, body) => {
    const client = getTwilioClient();
    if (!client) {
        console.log('[Twilio] Credentials missing. SMS simulation only:', body);
        return;
    }
    try {
        await client.messages.create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        console.log('[Twilio] SMS sent to', to);
    } catch (error) {
        console.error('[Twilio] Error sending SMS:', error.message);
    }
};
