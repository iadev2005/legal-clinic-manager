import Sidebar from "@/components/layout/Sidebar";

export default function Citations() {
    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar />
            <div className="w-full h-full p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold text-sky-950">Gestión de Citas</h1>
            </div>
        </div>
    );
}
