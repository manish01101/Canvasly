"use client";

import InputBox from "../../components/InputBox";
import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const VerifyOTPClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!otp || otp.length !== 6) {
      setServerError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HTTP_URL}/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Invalid OTP");
      }

      // Success - redirect to signin
      router.push(
        "/signin?message=Account verified successfully. Please sign in.",
      );
    } catch (err: any) {
      setServerError(err?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null; 
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
        <h1 className="text-3xl font-bold text-center mb-2 text-[var(--color-primary)]">
          Verify your email
        </h1>

        <p className="text-center text-gray-500 mb-8">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <InputBox
              label="Enter OTP"
              type="text"
              value={otp}
              onChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              maxLength={6}
            />
          </div>

          {serverError && (
            <p className="text-red-500 text-sm text-center">{serverError}</p>
          )}

          <Button
            type="primary"
            disabled={loading || otp.length !== 6}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the code?{" "}
            <button
              onClick={() => window.location.reload()}
              className="text-[var(--color-primary)] hover:underline"
            >
              Resend OTP
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/signup"
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            ← Back to signup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPClient;
