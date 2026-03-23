import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS (standard for 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // help cloud network handshakes
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendOTP = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER is not defined in environment variables");
  }

  await transporter.sendMail({
    from: `"Canvasly" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email - Canvasly",
    html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Your Canvasly Verification Code</h2>
          <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
          <p>This expires in 10 minutes.</p>
        </div>
      `,
  });
};
