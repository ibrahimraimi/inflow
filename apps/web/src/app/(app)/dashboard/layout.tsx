import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@inflow/core/lib/auth";
import { DashboardClientShell } from "./_components/dashboard-client-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <DashboardClientShell user={session.user}>
      {children}
    </DashboardClientShell>
  );
}