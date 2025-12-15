import Sidebar from "@/components/layout/Sidebar";
import DashboardCard from "@/components/ui/DashboardCard";
import TaskCard from "@/components/ui/task-card";
import { PieChart } from "@/components/ui/pie-chart";
import { type ChartConfig } from "@/components/shadcn/chart";
import { CustomTable, type Column } from "@/components/ui/custom-table";

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

    const pieChartData = [
        { status: "en_proceso", cases: 275 },
        { status: "archivado", cases: 200 },
        { status: "entregado", cases: 187 },
        { status: "asesoria", cases: 90 },
    ]

    const pieChartConfig = {
        cases: {
            label: "Casos",
        },
        en_proceso: {
            label: "En Proceso",
        },
        archivado: {
            label: "Archivado",
        },
        entregado: {
            label: "Entregado",
        },
        asesoria: {
            label: "Asesoría",
        },
    } satisfies ChartConfig

    const recentAccessData = [
        {
            user: "Luis Martínez",
            role: "Alumno",
            action: "Registro Actuación Caso #2024-051",
            date: "Hace 10 min",
        },
        {
            user: "Ana Silva",
            role: "Alumno",
            action: "Carga de Documento",
            date: "Hace 35 min",
        },
        {
            user: "Dr. Briceño",
            role: "Profesor",
            action: "Aprobación de Caso",
            date: "Hace 1 hora",
        },
    ]

    const recentAccessColumns: Column<typeof recentAccessData[0]>[] = [
        {
            header: "Usuario",
            accessorKey: "user",
            className: "font-bold pl-6",
        },
        {
            header: "Rol",
            accessorKey: "role",
            className: "text-center",
        },
        {
            header: "Acción",
            accessorKey: "action",
            className: "font-bold px-4 leading-tight",
            headerClassName: "w-[40%]",
        },
        {
            header: "Fecha",
            accessorKey: "date",
            className: "text-gray-400 font-semibold text-base pl-6",
        },
    ]

    const pendingTasks = [
        {
            title: "Redactar Informe Preliminar",
            caseNumber: "2024-051",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Mañana -> Alta (<= 3 días)
        },
        {
            title: "Entrevista con Solicitante",
            caseNumber: "2024-049",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 días -> Media (<= 7 días)
        },
        {
            title: "Revisar Expediente en Tribunal",
            caseNumber: "2024-052",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 20)), // 20 días -> Baja (> 7 días)
        },
    ];

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar />
            <div className="w-full h-full p-11 inline-flex flex-col justify-start items-center gap-6 overflow-y-auto">
                {/* Titulo */}
                <div className="self-stretch flex flex-col justify-start items-start">
                    <h1 className="self-stretch justify-start text-sky-950 text-6xl font-semibold">Dashboard</h1>
                    <h1 className="self-stretch justify-start text-[#325B84] text-2xl font-semibold">Un resumen visual de la actividad reciente y las métricas clave.</h1>
                </div>
                {/* Cards */}
                <div className="self-stretch flex flex-wrap justify-center items-center gap-7">
                    {dashboardCards.map((card, index) => (
                        <DashboardCard
                            key={index}
                            {...card}
                        />
                    ))}
                </div>
                {/* ODS */}
                <div className="self-stretch px-10 py-10 bg-neutral-50 rounded-[40px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] inline-flex justify-start items-center gap-8">
                    <div className="px-6 aspect-square bg-blue-100 rounded-[20px] flex justify-center items-center gap-2.5">
                        <span className="icon-[flowbite--landmark-solid] text-7xl text-[#3E7DBB]"></span>
                    </div>
                    <div className="self-stretch inline-flex flex-col justify-center items-start gap-1">
                        <h1 className="self-stretch justify-start text-sky-950 text-3xl font-semibold leading-tight">Comprometidos con el ODS 16: Paz, Justicia e Instituciones Sólidas</h1>
                        <div className="self-stretch justify-start text-sky-950 text-xl font-semibold leading-tight">Nuestra clínica jurídica promueve el acceso a la justicia para todos, brindando asesoría legal y fortaleciendo las instituciones, en línea directa con los objetivos de desarrollo sostenible.</div>
                    </div>
                </div>
                <div className="self-stretch inline-flex justify-center items-stretch gap-5 flex-wrap content-center">
                    {/* Casos por Estatus */}
                    <div className="flex-1 px-3.5 py-2 bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] flex flex-col justify-center items-center gap-9">
                        <PieChart
                            title="Casos por Estatus:"
                            data={pieChartData}
                            config={pieChartConfig}
                            dataKey="cases"
                            nameKey="status"
                            innerRadius={55}
                        />
                    </div>

                    {/* Accesos Recientes */}
                    <div className="flex-[3] min-w-[700px] px-8 py-12 bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] flex flex-col justify-start items-center gap-5 overflow-hidden">
                        <h1 className="self-stretch justify-start text-sky-950 text-4xl font-semibold font-serif">Accesos Recientes:</h1>
                        <CustomTable
                            data={recentAccessData}
                            columns={recentAccessColumns}
                        />
                    </div>
                </div>

                <div className="self-stretch p-7 bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] inline-flex flex-col justify-start items-start gap-4">
                    <h1 className="self-stretch justify-start text-sky-950 text-4xl font-semibold">Mis Tareas Pendientes:</h1>
                    {pendingTasks.map((task, index) => (
                        <TaskCard
                            key={index}
                            {...task}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
