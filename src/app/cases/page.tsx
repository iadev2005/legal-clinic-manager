import Sidebar from "@/components/layout/Sidebar";
import CasesClient from "./cases-client";
import { getSession } from "@/lib/auth-utils";

export default async function Cases() {
  const session = await getSession();

  // Mapear el rol del usuario desde la sesión
  // El cliente espera 'ADMIN', 'PROFESSOR' o 'STUDENT'
  // Los roles en BD son: 'Administrador', 'Coordinador', 'Profesor', 'Estudiante'
  let userRole: "ADMIN" | "PROFESSOR" | "STUDENT" = "STUDENT";

  const rawRole = session?.rol?.trim() || "";
  console.log("Server Session Role:", session?.rol);
  console.log("Calculated Raw Role:", rawRole);

  if (["Administrador", "Coordinador", "ADMIN", "COORDINATOR", "Admin", "admin"].includes(rawRole)) {
    userRole = "ADMIN";
  } else if (["Profesor", "PROFESSOR"].includes(rawRole)) {
    userRole = "PROFESSOR";
  } else {
    userRole = "STUDENT"; // Default fallback
  }

  return (
    <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
      <Sidebar user={session as any} />
      <CasesClient userRole={userRole} userCedula={session?.cedula as string | undefined} debugRole={rawRole} />
    </div>
  );
}
