import DashboardClient from "./dashboard-client";
import Sidebar from "@/components/layout/Sidebar";
import { getSession } from "@/lib/auth-utils";
import { Suspense } from "react";

export default async function Dashboard() {
  const session = await getSession();

  return (
    <div className="w-full h-full bg-neutral-50 overflow-hidden">
      <DashboardClient user={session as any} />
    </div>
  );
}
