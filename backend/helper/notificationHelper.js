import nodemailer from "nodemailer";
import twilio from "twilio";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const twilioClient =
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        : null;

export const sendEmail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `"EliteMarket" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error("Email send error:", error.message);
    }
};

export const sendSMS = async ({ to, body }) => {
    try {
        if (!twilioClient) {
            console.log("Twilio client not initialized");
            return;
        }
        const phone = to.startsWith("+") ? to : `+91${to}`;
        // During Twilio trial, only verified numbers can receive SMS
        const verifiedNumber = process.env.TWILIO_VERIFIED_NUMBER;
        const recipient = verifiedNumber || phone;
        console.log("Sending SMS to:", recipient);
        const message = await twilioClient.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: recipient,
        });
        console.log("SMS sent successfully. SID:", message.sid);
    } catch (error) {
        console.error("SMS send error code:", error.code);
        console.error("SMS send error message:", error.message);
    }
};

export const sendOrderNotification = async ({ user, subject, emailHtml, smsBody }) => {
    await Promise.all([
        sendEmail({ to: user.email, subject, html: emailHtml }),
        sendSMS({ to: user.phone, body: smsBody }),
    ]);
};
