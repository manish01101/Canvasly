import React from "react";
import NavBar from "../components/NavBar";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <NavBar />
      <div>{children}</div>
    </div>
  );
};

export default AuthLayout;
