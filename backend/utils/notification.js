const nodemailer = require('nodemailer');
const twilio = require('twilio');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const getTwilioClient = () => {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        return new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return null;
};

exports.sendEmail = (to, subject, text) => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error('[Email] Error:', err);
            else console.log('[Email] Sent:', info.response);
        });
    } else {
        console.log('[Email] Skipped (Credentials missing)');
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
