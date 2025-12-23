import Sidebar from "@/components/layout/Sidebar";
import { ParishChart } from "@/components/charts/ParishChart";
import { CaseStatusChart } from "@/components/charts/CaseStatusChart";
import { CaseGrowthChart } from "@/components/charts/CaseGrowthChart";
import { DownloadReportButton } from "@/components/DownloadReportButton";
import { StatisticsFilters } from "@/components/StatisticsFilters";

export const dynamic = 'force-dynamic';

export default function Statistics() {
    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar />
            <div className="w-full h-full p-6 overflow-y-auto">
                <div className="self-stretch flex flex-col justify-start items-start">
                    <h1 className="self-stretch justify-start text-sky-950 text-6xl font-semibold">Reportes y Estadísticas</h1>
                    <h1 className="self-stretch justify-start text-[#325B84] text-2xl font-semibold">Visualiza el rendimiento y métricas de la clínica jurídica.</h1>
                </div>

                <div className="self-stretch w-full p-7 mt-6 bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] flex flex-col gap-6">
                    <StatisticsFilters>
                        <DownloadReportButton />
                    </StatisticsFilters>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                        <ParishChart />
                        <CaseStatusChart />
                        <CaseGrowthChart />
                    </div>
                </div>
            </div>
        </div>
    );
}
