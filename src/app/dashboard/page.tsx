import Sidebar from "@/components/layout/Sidebar";
import DashboardCard from "@/components/ui/DashboardCard";

export default function Dashboard() {
    const dashboardCards = [
        {
            label: "Casos Activos:",
            value: "128",
            icon: "icon-[lucide--gavel]",
            iconColor: "text-[#3E7DBB]",
            iconBgColor: "bg-blue-100"
        },
        {
            label: "Solicitantes Registrados:",
            value: "452",
            icon: "icon-[tabler--users]",
            iconColor: "text-[#16A34A]",
            iconBgColor: "bg-[#DCFCE7]"
        },
        {
            label: "En Tribunales:",
            value: "14",
            icon: "icon-[mdi--justice]",
            iconColor: "text-[#CB8C06]",
            iconBgColor: "bg-[#FEF9C3]"
        },
        {
            label: "Pendientes Hoy",
            value: "128",
            icon: "icon-[tabler--alert-triangle]",
            iconColor: "text-[#E03E3E]",
            iconBgColor: "bg-[#FEE2E2]"
        }
    ];

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar />
            <div className="w-full h-full p-11 inline-flex flex-col justify-start items-center gap-6 overflow-y-auto">
                <div className="self-stretch flex flex-col justify-start items-start">
                    <h1 className="self-stretch justify-start text-sky-950 text-6xl font-semibold">Dashboard</h1>
                    <h1 className="self-stretch justify-start text-[#325B84] text-2xl font-semibold">Un resumen visual de la actividad reciente y las métricas clave.</h1>
                </div>
                <div className="self-stretch flex flex-wrap justify-center items-center gap-7">
                    {dashboardCards.map((card, index) => (
                        <DashboardCard
                            key={index}
                            {...card}
                        />
                    ))}
                </div>
                <div className="self-stretch px-10 py-10 bg-neutral-50 rounded-[40px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] inline-flex justify-start items-center gap-8">
                    <div className="px-6 aspect-square bg-blue-100 rounded-[20px] flex justify-start items-center gap-2.5">
                        <span className="icon-[flowbite--landmark-solid] text-7xl text-[#3E7DBB]"></span>
                    </div>
                    <div className="self-stretch inline-flex flex-col justify-center items-start gap-1">
                        <h1 className="self-stretch justify-start text-sky-950 text-3xl font-semibold leading-tight">Comprometidos con el ODS 16: Paz, Justicia e Instituciones Sólidas</h1>
                        <div className="self-stretch justify-start text-sky-950 text-xl font-semibold leading-tight">Nuestra clínica jurídica promueve el acceso a la justicia para todos, brindando asesoría legal y fortaleciendo las instituciones, en línea directa con los objetivos de desarrollo sostenible.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
