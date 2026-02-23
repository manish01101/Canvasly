import { Suspense } from "react";
import VerifyOtpClient from "./VerifyOTP";
import NavBar from "../components/NavBar";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NavBar />
      <VerifyOtpClient />
    </Suspense>
  );
}
