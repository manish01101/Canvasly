import React from "react";

interface Props {
  label: string;
  type: string;
  placeholder: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  value?: string;
  maxLength?: number;
}

const InputBox = ({
  label,
  type,
  placeholder,
  onChange,
  onKeyDown,
  value,
  maxLength,
}: Props) => {
  return (
    <div className="flex flex-col ">
      <label htmlFor={label}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="border rounded py-2 px-4 bg-white"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        value={value}
        maxLength={maxLength}
      />
    </div>
  );
};

export default InputBox;
