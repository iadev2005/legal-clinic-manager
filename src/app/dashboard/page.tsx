"use client";

import Sidebar from "@/components/layout/Sidebar";
import DashboardCard from "@/components/ui/DashboardCard";
import { PieChart } from "@/components/ui/pie-chart";
import { type ChartConfig } from "@/components/shadcn/chart";
import { CustomTable, type Column } from "@/components/ui/custom-table";
import { cn } from "@/lib/utils";

// --- Types & Interfaces ---

interface DashboardStats {
  activeCases: number;
  totalApplicants: number;
  casesInCourt: number;
  pendingToday: number;
  casesByStatus: Array<{ status: string; _count: { status: number } }>;
}

interface TaskCardProps {
  title: string;
  caseNumber: string;
  dueDate: Date;
}

// --- TaskCard Component (Inlined) ---

function TaskCard({ title, caseNumber, dueDate }: TaskCardProps) {
  const formatDueDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Mañana";

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric';
    }

    return new Intl.DateTimeFormat('es-ES', options).format(date);
  };

  const getPriority = (date: Date): "Alta" | "Media" | "Baja" => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) return "Alta";
    if (diffDays <= 7) return "Media";
    return "Baja";
  };

  const priority = getPriority(dueDate);

  const priorityStyles = {
    Alta: "bg-red-100 text-red-500",
    Media: "bg-[#FEF9C3] text-[#CA8A04]",
    Baja: "bg-[#DBEAFE] text-[#2563EB]",
  };

  return (
    <div className="self-stretch p-3 bg-neutral-50 rounded-2xl shadow-[0px_0px_8.899999618530273px_0px_rgba(0,0,0,0.25)] inline-flex justify-between items-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-default border border-transparent hover:border-gray-100">
      <div className="flex-1 inline-flex flex-col justify-start items-start">
        <div className="self-stretch justify-start text-sky-950 text-xl font-semibold">{title}</div>
        <div className="self-stretch justify-start text-sky-950 text-sm font-semibold opacity-80">Caso #{caseNumber} - Vencimiento: {formatDueDate(dueDate)}</div>
      </div>
      <div className={cn("px-4 py-1.5 rounded-xl inline-flex justify-center items-center gap-2.5 min-w-[80px]", priorityStyles[priority])}>
        <div className="text-right justify-start text-sm font-extrabold">{priority}</div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function Dashboard() {
  /* Datos de prueba estáticos */
  const stats: DashboardStats = {
    activeCases: 12,
    totalApplicants: 45,
    casesInCourt: 5,
    pendingToday: 3,
    casesByStatus: [
      { status: "EN_PROCESO", _count: { status: 8 } },
      { status: "ARCHIVADO", _count: { status: 15 } },
      { status: "ENTREGADO", _count: { status: 10 } },
      { status: "ASESORIA", _count: { status: 12 } },
    ],
  };

  const dashboardCards = [
    {
      label: "Casos Activos:",
      value: stats.activeCases.toString(),
      icon: "icon-[lucide--gavel]",
      iconColor: "text-[#3E7DBB]",
      iconBgColor: "bg-blue-100",
    },
    {
      label: "Solicitantes Registrados:",
      value: stats.totalApplicants.toString(),
      icon: "icon-[tabler--users]",
      iconColor: "text-[#16A34A]",
      iconBgColor: "bg-[#DCFCE7]",
    },
    {
      label: "En Tribunales:",
      value: stats.casesInCourt.toString(),
      icon: "icon-[mdi--justice]",
      iconColor: "text-[#CB8C06]",
      iconBgColor: "bg-[#FEF9C3]",
    },
    {
      label: "Pendientes Hoy",
      value: stats.pendingToday.toString(),
      icon: "icon-[tabler--alert-triangle]",
      iconColor: "text-[#E03E3E]",
      iconBgColor: "bg-[#FEE2E2]",
    },
  ];

  // Convertir datos de la API al formato del gráfico
  const pieChartData = stats.casesByStatus.map((item) => ({
    status: item.status.toLowerCase(),
    cases: item._count.status,
  }));

  const pieChartConfig = {
    cases: { label: "Casos" },
    en_proceso: { label: "En Proceso" },
    archivado: { label: "Archivado" },
    entregado: { label: "Entregado" },
    asesoria: { label: "Asesoría" },
  } satisfies ChartConfig;

  const recentAccessData = [
    {
      id: 1,
      user: "Luis Martínez",
      role: "Alumno",
      action: "Registro Actuación Caso #2024-051",
      date: "Hace 10 min",
    },
    {
      id: 2,
      user: "Ana Silva",
      role: "Alumno",
      action: "Carga de Documento",
      date: "Hace 35 min",
    },
    {
      id: 3,
      user: "Dr. Briceño",
      role: "Profesor",
      action: "Aprobación de Caso",
      date: "Hace 1 hora",
    },
  ];

  const recentAccessColumns: Column<(typeof recentAccessData)[0]>[] = [
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
  ];

  const pendingTasks = [
    {
      title: "Redactar Informe Preliminar",
      caseNumber: "2024-051",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
    {
      title: "Entrevista con Solicitante",
      caseNumber: "2024-049",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    },
    {
      title: "Revisar Expediente en Tribunal",
      caseNumber: "2024-052",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 20)),
    },
  ];

  return (
    <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
      <Sidebar />
      <div className="w-full h-full p-11 inline-flex flex-col justify-start items-center gap-6 overflow-y-auto">
        {/* Titulo */}
        <div className="self-stretch flex flex-col justify-start items-start">
          <h1 className="self-stretch justify-start text-sky-950 text-6xl font-semibold">
            Dashboard
          </h1>
          <h1 className="self-stretch justify-start text-[#325B84] text-2xl font-semibold">
            Un resumen visual de la actividad reciente y las métricas clave.
          </h1>
        </div>

        {/* Cards */}
        <div className="self-stretch flex flex-wrap justify-center items-center gap-7">
          {dashboardCards.map((card, index) => (
            <DashboardCard key={index} {...card} />
          ))}
        </div>

        {/* ODS */}
        <div className="self-stretch px-10 py-10 bg-neutral-50 rounded-[40px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] inline-flex justify-start items-center gap-8">
          <div className="px-6 aspect-square bg-blue-100 rounded-[20px] flex justify-center items-center gap-2.5">
            <span className="icon-[flowbite--landmark-solid] text-7xl text-[#3E7DBB]"></span>
          </div>
          <div className="self-stretch inline-flex flex-col justify-center items-start gap-1">
            <h1 className="self-stretch justify-start text-sky-950 text-3xl font-semibold leading-tight">
              Comprometidos con el ODS 16: Paz, Justicia e Instituciones Sólidas
            </h1>
            <div className="self-stretch justify-start text-sky-950 text-xl font-semibold leading-tight">
              Nuestra clínica jurídica promueve el acceso a la justicia para
              todos, brindando asesoría legal y fortaleciendo las instituciones,
              en línea directa con los objetivos de desarrollo sostenible.
            </div>
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
            <h1 className="self-stretch justify-start text-sky-950 text-4xl font-semibold font-serif">
              Accesos Recientes:
            </h1>
            <CustomTable data={recentAccessData} columns={recentAccessColumns} />
          </div>
        </div>

        <div className="self-stretch p-7 bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] inline-flex flex-col justify-start items-start gap-4">
          <h1 className="self-stretch justify-start text-sky-950 text-4xl font-semibold">
            Mis Tareas Pendientes:
          </h1>
          {pendingTasks.map((task, index) => (
            <TaskCard key={index} {...task} />
          ))}
        </div>
      </div>
    </div>
  );
}
