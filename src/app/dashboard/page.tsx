import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth.server";
import { clientsFor } from "@/lib/data.server";
import { AppShell } from "@/components/AppShell";
import { ClientList } from "./ClientList";

export default async function DashboardPage() {
  const s = await getSession();
  if (!s) redirect("/login");
  const clients = clientsFor(s.sub);
  return (
    <AppShell name={s.name}>
      <div className="mb-6">
        <p className="text-sm text-sand-600">Good to see you, {s.name.split(" ")[0]}</p>
        <h1 className="font-serif text-3xl">Your clients</h1>
      </div>
      <ClientList clients={clients} />
    </AppShell>
  );
}
