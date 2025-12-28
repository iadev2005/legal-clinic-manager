import Sidebar from "@/components/layout/Sidebar";
import FollowUpClient from "./follow-up-client";
import { getSession } from "@/lib/auth-utils";

export default async function FollowUp() {
    const session = await getSession();

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar user={session as any} />
            <div className="w-full h-full p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold text-sky-950">Seguimiento y Control</h1>
            </div>
        </div>
    );
}
