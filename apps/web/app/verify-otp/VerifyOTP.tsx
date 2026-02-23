"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import InputBox from "../components/InputBox";
import Button from "../components/Button";

export default function VerifyOtpClient() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill email from query param
  useEffect(() => {
    const queryEmail = searchParams.get("email");
    // if (!queryEmail) {
    //   router.push("/signup");
    // }
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [searchParams]);

  const handleVerify = async () => {
    if (!email || !otp) return;

    try {
      setLoading(true);

      const res = await axios.post(`${BACKEND_URL}/verify-otp`, {
        email,
        otp,
      });
      console.log(res);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);

      window.location.href = "/";
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
        <h1 className="text-3xl font-bold text-center mb-2 text-[var(--color-primary)]">
          Verify OTP
        </h1>

        <div className="space-y-5">
          {/* Email Input */}
          <InputBox
            label="Email"
            type="email"
            placeholder="example@email.com"
            value={email}
            onchange={(e) => setEmail(e.target.value)}
          />

          {/* OTP Input */}
          <InputBox
            label="OTP"
            type="text"
            placeholder="Enter Your OTP"
            onchange={(e) => setOtp(e.target.value)}
          />

          <Button
            type="primary"
            onclick={handleVerify}
            label={loading ? "Verifying..." : "Verify"}
            disabled={loading}
            className="w-full py-3"
          />
        </div>
      </div>
    </div>
  );
}
