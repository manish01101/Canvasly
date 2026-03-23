import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS (standard for port 587)
  family: 4, // for ipv4

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Helps prevent connection drops in cloud environments
    rejectUnauthorized: false,
  },
} as any);

export const sendOTP = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(
        "Missing EMAIL_USER or EMAIL_PASS environment variables.",
      );
    }

    await transporter.sendMail({
      from: `"Canvasly" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email - Canvasly",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Your Verification Code</h2>
          <p style="font-size: 16px; color: #666;">Use the code below to verify your email address. This code expires in 10 minutes.</p>
          <h1 style="color: #4F46E5; letter-spacing: 5px; font-size: 36px;">${otp}</h1>
          <p style="font-size: 12px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    console.log(`OTP successfully sent to: ${email}`);
  } catch (error) {
    console.error("NODEMAILER ERROR:", error);
  }
};
