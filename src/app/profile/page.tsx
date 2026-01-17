
import ProfileClient from "./profile-client";
import Sidebar from "@/components/layout/Sidebar";
import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { getUsuarioById, getParticipacionesUsuario } from "@/actions/administracion";

export default async function ProfilePage() {
    const session = await getSession();

    if (!session || !session.cedula) {
        redirect("/login");
    }

    const userRes = await getUsuarioById(session.cedula);
    const partRes = await getParticipacionesUsuario(session.cedula);

    const fullUserData = userRes.success ? userRes.data : session;
    const participations = partRes.success ? partRes.data : [];

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar user={session} />
            <ProfileClient user={fullUserData} participations={participations} />
        </div>
    );
}
