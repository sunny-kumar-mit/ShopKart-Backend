const nodemailer = require('nodemailer');
const twilio = require('twilio');

// CONFIGURATION: Port 587 (STARTTLS) is standard for Node.js
// The global dns.setDefaultResultOrder('ipv4first') in server.js handles the network layer.
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Must be false for port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000 // 10s fail fast
});

const getTwilioClient = () => {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        return new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return null;
};

exports.sendEmail = async (to, subject, text) => {
    // CRITICAL: Fail if credentials are missing so the user knows via Frontend Toast
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('[Email] Credentials Missing in Environment Variables');
        throw new Error('Server Email Credentials Missing');
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text
    };

    try {
        // No retry - fail fast so we can debug
        const info = await transporter.sendMail(mailOptions);
        console.log('[Email] Sent:', info.response);
        return info;
    } catch (error) {
        console.error('[Email] Error:', error.message);
        throw error; // Propagate to route handler
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
