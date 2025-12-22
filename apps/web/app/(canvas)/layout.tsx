import { div } from "framer-motion/client";
import Link from "next/link";
import React from "react";

const CanvasLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className=" overflow-hidden bg-gray-150">
      {/* logo */}
      <div className="fixed top-4 left-4 z-50">
        <Link href={"/"}>
          <span className="font-extrabold text-xl rounded-md px-4 py-2 ">
            Canvasly
          </span>
        </Link>
      </div>
      {/* canvas */}
      <main className="">{children}</main>
    </div>
  );
};

export default CanvasLayout;
