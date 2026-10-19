"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="text-sm text-sand-600 underline-offset-4 hover:text-rose-600 hover:underline"
      onClick={async () => {
        await fetch("/api/logout", { method: "POST" });
        router.replace("/login");
      }}
    >
      Sign out
    </button>
  );
}
