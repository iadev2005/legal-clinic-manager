import Sidebar from "@/components/layout/Sidebar";
import AdministrationClient from "./administration-client";
import { getSession } from "@/lib/auth-utils";
import { Suspense } from "react";

export default async function Statistics() {
    const session = await getSession();

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar user={session as any} />
            <Suspense fallback={<div className="p-6">Cargando administración...</div>}>
                <AdministrationClient currentUser={session} />
            </Suspense>
        </div>
    );
}