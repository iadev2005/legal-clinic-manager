import Sidebar from "@/components/layout/Sidebar";
import CasesClient from "./cases-client";

export default function Cases() {
  // TODO: Obtener el rol del usuario desde la sesión/auth
  // Por ahora usamos 'ADMIN' como ejemplo
  const userRole = "PROFESSOR"; // Cambiar a 'PROFESSOR' o 'STUDENT' según el usuario

  return (
    <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
      <Sidebar />
      <CasesClient userRole={userRole as "ADMIN" | "PROFESSOR" | "STUDENT"} />
    </div>
  );
}
