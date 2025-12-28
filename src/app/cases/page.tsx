import Sidebar from "@/components/layout/Sidebar";
import CasesClient from "./cases-client";
import { getSession } from "@/lib/auth-utils";

export default async function Cases() {
  const session = await getSession();

  // Mapear el rol del usuario desde la sesión
  // El cliente espera 'ADMIN', 'PROFESSOR' o 'STUDENT'
  let userRole: "ADMIN" | "PROFESSOR" | "STUDENT" = "STUDENT";

  if (session?.rol === "ADMIN" || session?.rol === "COORDINATOR") {
    userRole = "ADMIN";
  } else if (session?.rol === "PROFESSOR") {
    userRole = "PROFESSOR";
  } else {
    userRole = "STUDENT";
  }

  return (
    <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
      <Sidebar user={session as any} />
      <CasesClient userRole={userRole} userCedula={session?.cedula as string | undefined} />
    </div>
  );
}
