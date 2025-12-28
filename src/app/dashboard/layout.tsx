
import Sidebar from "@/components/layout/Sidebar";
import { getSession } from "@/lib/auth-utils";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar user={session} />
            <div className="w-full h-full p-11 inline-flex flex-col justify-start items-center gap-6 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
