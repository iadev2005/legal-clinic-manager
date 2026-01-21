import Sidebar from "@/components/layout/Sidebar";
import ApplicantsClient from "./applicants-client";
import { getSession } from "@/lib/auth-utils";

export default async function Applicants() {
  const session = await getSession();

  return (
    <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
      <Sidebar user={session as any} />
      <ApplicantsClient userRole={session?.rol || 'Estudiante'} />
    </div>
  );
}
