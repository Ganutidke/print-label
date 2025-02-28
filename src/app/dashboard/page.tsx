import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  // return <DashboardClient userId={session.user.id} userName={session.user.name} />;
  return <DashboardClient userId={(session.user as any).id} userName={session.user.name ?? ''} />;
}
