import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  await transporter.sendMail({
    from: `"Canvasly" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email - Canvasly",
    html: `
        <h2>Your Canvasly Verification Code</h2>
        <h1>${otp}</h1>
        <p>This expires in 10 minutes.</p>
      `,
  });
};
