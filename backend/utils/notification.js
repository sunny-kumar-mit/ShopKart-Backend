const nodemailer = require('nodemailer');
const twilio = require('twilio');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Internal Render fix: use SSL port
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000 // 10s timeout
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
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text
    };

    let retries = 3;
    while (retries > 0) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('[Email] Sent:', info.response);
            return info;
        } catch (error) {
            console.error(`[Email] Error (Attempts leftover: ${retries - 1}):`, error.message);
            retries -= 1;
            if (retries === 0) throw error; // Throw final error
            // Wait 1 second before retry
            await new Promise(res => setTimeout(res, 1000));
        }
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
