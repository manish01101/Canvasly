"use client";

import InputBox from "../../components/InputBox";
import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signinSchema } from "@repo/common/types";
import { z } from "zod";

type FormData = {
  email: string;
  password: string;
};

const Signin = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    const result = signinSchema.safeParse({
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

    const result = signinSchema.safeParse(formData);

    if (!result.success) {
      const flattened = z.flattenError(result.error);
      const fieldErrors = flattened.fieldErrors;

      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BACKEND_URL}/signin`, formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);

      router.push("/");
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || "Signin failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.email &&
    formData.password &&
    Object.values(errors).every((err) => !err);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
        <h1 className="text-3xl font-bold text-center mb-2 text-[var(--color-primary)]">
          Welcome back
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Sign in to continue collaborating!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <InputBox
              label="Email"
              type="email"
              placeholder="example@email.com"
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
            label={loading ? "Signing In..." : "Sign In"}
            disabled={!isFormValid || loading}
            className="w-full py-3"
          />
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-[var(--color-secondary)] font-semibold hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signin;
