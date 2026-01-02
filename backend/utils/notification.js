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

// Helper: Generate professional HTML email
const generateEmailHtml = (code) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563EB; margin: 0;">ShopKart</h1>
        </div>
        <div style="color: #333333; font-size: 16px; line-height: 1.5;">
            <p>Hello,</p>
            <p>Your verification code for ShopKart is:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background-color: #f1f5f9; padding: 10px 20px; border-radius: 5px; border: 1px dashed #cbd5e1;">
                    ${code}
                </span>
            </div>
            <p>This code is valid for 10 minutes. Please do not share this code with anyone.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #64748b;">
            <p>&copy; ${new Date().getFullYear()} ShopKart. All rights reserved.</p>
        </div>
    </div>
    `;
};

exports.sendEmail = async (to, subject, textOrHtml) => {
    if (!process.env.RESEND_API_KEY) {
        console.error('[Email] RESEND_API_KEY is missing');
        throw new Error('Resend API Key Missing');
    }

    // Extract OTP from text if possible, or just use the provided content
    // This is a naive check to see if the content is just a raw OTP message.
    // Ideally, the caller should pass the OTP code directly, but we are adapting to existing calls.
    let htmlContent = textOrHtml;

    // Attempt to extract 6-digit OTP to wrap it in the template
    const otpMatch = textOrHtml.match(/\b\d{6}\b/);
    if (otpMatch) {
        htmlContent = generateEmailHtml(otpMatch[0]);
    }

    try {
        const data = await resend.emails.send({
            from: 'ShopKart <onboarding@resend.dev>', // Default testing sender for Resend
            to: to, // In free tier, this works if 'to' is the same as signed-up email
            subject: subject,
            html: htmlContent,
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
