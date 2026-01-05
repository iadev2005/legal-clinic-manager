import Sidebar from "@/components/layout/Sidebar";
import Notificactions from "./notifications";
import { getSession } from "@/lib/auth-utils";
import { Suspense } from "react";

export default async function Statistics() {
    const session = await getSession();

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar user={session as any} />
            <Suspense fallback={<div className="p-6">Cargando notificaciones...</div>}>
                <Notificactions user={session} />
            </Suspense>
        </div>
    );
}