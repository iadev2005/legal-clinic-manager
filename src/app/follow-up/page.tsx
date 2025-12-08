import Sidebar from "@/components/Sidebar";

export default function FollowUp() {
    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar />
            <div className="w-full h-full p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold text-sky-950">Seguimiento y Control</h1>
            </div>
        </div>
    );
}
