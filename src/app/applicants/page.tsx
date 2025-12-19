import Sidebar from "@/components/layout/Sidebar";
import ApplicantsClient from "./applicants-client";

export default function Applicants() {
  return (
    <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
      <Sidebar />
      <ApplicantsClient />
    </div>
  );
}
