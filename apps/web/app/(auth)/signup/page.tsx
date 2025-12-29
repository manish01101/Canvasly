"use client";

import InputBox from "../../components/InputBox";
import React, { useState } from "react";
import Button from "../../components/Button";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { useRouter } from "next/navigation";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOnclick = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/signup`, {
        email,
        name,
        password,
      });
      console.log(res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      router.push("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex justify-center items-center flex-col mt-[-150] gap-5 border-2 border-solid shadow-2xl bg-gray-100 rounded-lg p-10">
        <InputBox
          label="Name"
          type="text"
          placeholder="John"
          onchange={(e) => setName(e.target.value)}
        ></InputBox>
        <InputBox
          label="Email"
          type="email"
          placeholder="your_email@email.com"
          onchange={(e) => setEmail(e.target.value)}
        ></InputBox>
        <InputBox
          label="Password"
          type="password"
          placeholder="password"
          onchange={(e) => setPassword(e.target.value)}
          onkeydown={(e) => {
            if (e.key === "Enter") {
              handleOnclick();
            }
          }}
        ></InputBox>
        <Button
          type="primary"
          label={loading ? "Signing Up..." : "Signup"}
          disabled={loading}
          onclick={handleOnclick}
        />
      </div>
    </div>
  );
};

export default Signup;
