"use client";
import React from "react";

type Type = "primary" | "secondary";

interface Props {
  onclick: () => Promise<void>;
  label: string;
  type: Type;
  disabled?: boolean;
}

const Button = ({ onclick, label, type, disabled }: Props) => {
  return (
    <button
      onClick={onclick}
      disabled={disabled}
      className={`px-5 py-2 rounded-lg shadow-md transition duration-150 hover:scale-105 ease-in-out text-white hover:opacity-90 ${
        type === "primary"
          ? "font-bold px-5 bg-[var(--color-primary)] "
          : "bg-[var(--color-secondary)]"
      }`}
    >
      {label}
    </button>
  );
};

export default Button;
