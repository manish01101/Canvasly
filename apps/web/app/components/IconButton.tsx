"use client";

import React from "react";

export function IconButton({
  icon,
  onClick,
  activated = false,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  activated?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md border transition
        ${
          activated
            ? "bg-gray-700 border-blue-500 text-blue-400"
            : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
        }`}
    >
      {icon}
    </button>
  );
}
