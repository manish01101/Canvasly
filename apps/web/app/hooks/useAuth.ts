import { signOut, useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    isAuthenticated: status === "authenticated",
    token: session?.accessToken || null,
    name: session?.user?.name || "User",
    isLoading: status === "loading",
    logout: () => signOut({ callbackUrl: "/" }),
  };
}
