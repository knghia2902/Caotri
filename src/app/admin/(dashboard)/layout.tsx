import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/admin/login");
  }

  const pendingOrdersCount = await prisma.order.count({
    where: { status: "PENDING" },
  });

  return (
    <AdminShell session={session} pendingOrdersCount={pendingOrdersCount}>
      {children}
    </AdminShell>
  );
}
