"use client";

import InputBox from "../../components/InputBox";
import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { useRouter } from "next/navigation";
import { signupSchema } from "@repo/common/types";
import Link from "next/link";
import { z } from "zod";

type FormData = {
  name: string;
  email: string;
  password: string;
};

const Signup = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Auto redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    const result = signupSchema.safeParse({
      ...formData,
      [field]: value,
    });

    if (!result.success) {
      const flattened = z.flattenError(result.error);
      const fieldError = flattened.fieldErrors[field]?.[0];

      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      const flattened = z.flattenError(result.error);
      const fieldErrors = flattened.fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BACKEND_URL}/signup`, formData);

      alert(res.data.message);
      // localStorage.setItem("token", res.data.token);
      // localStorage.setItem("name", res.data.name);

      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.password &&
    Object.values(errors).every((err) => !err);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
        <h1 className="text-3xl font-bold text-center mb-2 text-[var(--color-primary)]">
          Create your account
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Start collaborating in seconds!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <InputBox
              label="Name"
              type="text"
              placeholder="John Doe"
              onchange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <InputBox
              label="Email"
              type="email"
              placeholder="you@example.com"
              onchange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <InputBox
              label="Password"
              type="password"
              placeholder="••••••••"
              onchange={(e) => handleChange("password", e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {serverError && (
            <div className="text-red-500 text-sm text-center">
              {serverError}
            </div>
          )}

          <Button
            type="primary"
            label={loading ? "Creating Account..." : "Sign Up"}
            disabled={!isFormValid || loading}
            className="w-full py-3"
          />
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-[var(--color-secondary)] font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
