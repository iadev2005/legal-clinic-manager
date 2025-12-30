import Sidebar from "@/components/layout/Sidebar";
import CitationsClient from "./citations-client";
import { getSession } from "@/lib/auth-utils";

export default async function Citations() {
    const session = await getSession();

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar user={session as any} />
            <div className="w-full h-full p-6 overflow-y-auto">
                <CitationsClient />
            </div>
        </div>
    );
}
