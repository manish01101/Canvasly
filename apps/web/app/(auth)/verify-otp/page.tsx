"use client";

import React, { Suspense } from "react";
import VerifyOTPClient from "./VerifyOTPClient";

export const dynamic = "force-dynamic";

const VerifyOTP = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPClient />
    </Suspense>
  );
};

export default VerifyOTP;
