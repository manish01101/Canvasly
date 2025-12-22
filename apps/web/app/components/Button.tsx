"use client";
import React, { ReactNode } from "react";

type Type = "primary" | "secondary";

interface Props {
  onclick?: () => void | Promise<void>;
  label?: string;
  type?: Type;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

const Button = ({ onclick, label, type, disabled, children }: Props) => {
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
      {label ? label : children}
    </button>
  );
};

export default Button;
