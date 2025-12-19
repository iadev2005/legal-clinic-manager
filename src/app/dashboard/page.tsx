import Sidebar from "@/components/layout/Sidebar";
import DashboardClient from "./dashboard-client";

export default function Dashboard() {
  return (
    <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
      <Sidebar />
      <DashboardClient />
    </div>
  );
}
