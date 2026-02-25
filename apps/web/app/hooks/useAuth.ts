import { useEffect, useState } from "react";

export function useAuth() {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem("token") || "");
      setName(localStorage.getItem("name") || "");
    };
    sync();
    window.addEventListener("login", sync);
    window.addEventListener("logout", sync);
    return () => {
      window.removeEventListener("login", sync);
      window.removeEventListener("logout", sync);
    };
  }, []);

  const logout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("logout"));
  };

  return { token, name, logout };
}
