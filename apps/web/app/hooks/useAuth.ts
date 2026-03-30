import { useSession, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const logout = () => {
    signOut({ callbackUrl: "/" });
  };

  return {
    token: session?.user ? "authenticated" : "",
    name: session?.user?.name || "",
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session?.user,
    logout,
  };
}
