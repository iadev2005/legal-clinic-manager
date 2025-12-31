import Sidebar from "@/components/layout/Sidebar";
import { getSession } from "@/lib/auth-utils";
import FollowUpClient from "./follow-up-client";

export default async function FollowUp() {
    const session = await getSession();

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar user={session as any} />
            <FollowUpClient />
        </div>
    );
}
