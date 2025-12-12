import React from "react";

interface Props {
  label: string;
  type: string;
  placeholder: string;
  onchange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputBox = ({ label, type, placeholder, onchange }: Props) => {
  return (
    <div className="flex flex-col ">
      <label htmlFor={label}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="border rounded py-2 px-4 bg-white"
        onChange={onchange}
      />
    </div>
  );
};

export default InputBox;
