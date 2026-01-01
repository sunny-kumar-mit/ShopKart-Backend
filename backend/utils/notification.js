const nodemailer = require('nodemailer');
const twilio = require('twilio');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4, // Force IPv4
    connectionTimeout: 30000
});

const getTwilioClient = () => {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        return new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return null;
};

exports.sendEmail = async (to, subject, text) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('[Email] Skipped (Credentials missing)');
        return; // Or throw error if you want strictness
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('[Email] Sent:', info.response);
        return info;
    } catch (error) {
        console.error('[Email] Error:', error);
        throw error; // Propagate error to caller
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
