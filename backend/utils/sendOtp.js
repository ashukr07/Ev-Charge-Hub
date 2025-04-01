import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.SMTP_HOST, process.env.SMTP_PORT);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async(email) =>{
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
        console.log(otp);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for Account Verification",
            text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        return otp;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP. Please try again later.");
    }
}
