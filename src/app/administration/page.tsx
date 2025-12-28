import Sidebar from "@/components/layout/Sidebar";
import AdministrationClient from "./administration-client";
import { getSession } from "@/lib/auth-utils";

export default async function Administration() {
    const session = await getSession();

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar user={session as any} />
            <AdministrationClient />
        </div>
    );
}
