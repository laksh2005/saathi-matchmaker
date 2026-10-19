import Link from "next/link";
import { Logo } from "./Logo";
import { LogoutButton } from "./LogoutButton";

export function AppShell({ name, children }: { name: string; children: React.ReactNode }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-sand-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" aria-label="Saathi home"><Logo /></Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-sand-600 sm:inline">{name}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-rose-100 text-xs font-semibold text-rose-700">{initials}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
