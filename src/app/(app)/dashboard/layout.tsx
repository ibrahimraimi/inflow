import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { DashboardSidebar } from "./_components/dashboard-sidebar";

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
    <div className="flex h-screen w-full overflow-hidden bg-muted/40">
      <DashboardSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
