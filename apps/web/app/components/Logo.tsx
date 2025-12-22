import { Shapes } from "lucide-react";
import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link
      href={"/"}
      className="group relative z-50 flex w-fit items-center justify-center rounded-full outline-none ring-0 focus:ring-0"
    >
      <div
        className="
          flex items-center gap-2 px-4 py-2 rounded-full 
          bg-gradient-to-r from-teal-500 to-cyan-700 
          hover:from-teal-400 hover:to-cyan-600
          text-white shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02]
          transition-all duration-300 ease-out
        "
      >
        {/* Logo Icon */}
        <Shapes className="w-5 h-5 text-white/90 group-hover:-rotate-12 transition-transform duration-300" />

        {/* Text */}
        <span className="font-bold text-lg tracking-tight text-white drop-shadow-sm select-none">
          Canvasly
        </span>
      </div>
    </Link>
  );
};

export default Logo;
