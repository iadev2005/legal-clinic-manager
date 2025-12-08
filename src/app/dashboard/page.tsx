import Sidebar from "@/components/Sidebar";
import DashboardCard from "@/components/DashboardCard";

export default function Dashboard() {
    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar />
            <div className="w-full h-full p-11 inline-flex flex-col justify-start items-center gap-6">
                <div className="self-stretch flex flex-col justify-start items-start">
                    <h1 className="self-stretch justify-start text-sky-950 text-6xl font-semibold">Dashboard</h1>
                    <h1 className="self-stretch justify-start text-[#325B84] text-2xl font-semibold">Un resumen visual de la actividad reciente y las métricas clave.</h1>
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-7">
                    <DashboardCard
                        label="Casos Activos:"
                        value="128"
                        icon="icon-[lucide--gavel]"
                        iconColor="text-[#3E7DBB]"
                        iconBgColor="bg-blue-100"
                    />
                    <DashboardCard
                        label="Solicitantes Registrados:"
                        value="452"
                        icon="icon-[tabler--users]"
                        iconColor="text-[#16A34A]"
                        iconBgColor="bg-[#DCFCE7]"
                    />
                    <DashboardCard
                        label="En Tribunales:"
                        value="14"
                        icon="icon-[mdi--justice]"
                        iconColor="text-[#CB8C06]"
                        iconBgColor="bg-[#FEF9C3]"
                    />
                    <DashboardCard
                        label="Pendientes Hoy"
                        value="128"
                        icon="icon-[tabler--alert-triangle]"
                        iconColor="text-[#E03E3E]"
                        iconBgColor="bg-[#FEE2E2]"
                    />
                </div>
            </div>
        </div>
    );
}
