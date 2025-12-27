"use client"

import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { CaseGrowthChart } from "@/components/ui/area-chart";
import { DownloadReportButton } from "@/components/DownloadReportButton";
import { GeneralReportDialog } from "@/components/GeneralReportDialog";
import { BarChart } from "@/components/ui/bar-chart";
import { Pie2Chart } from "@/components/ui/pie2-chart";
import { StatisticsFilters } from "@/components/StatisticsFilters";
import { useStatisticsData } from "@/hooks/useStatisticsData";

export default function Statistics() {
    const searchParams = useSearchParams();

    const filters = {
        materia: searchParams.get('subject') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        nucleus: searchParams.get('nucleus') || undefined,
    };

    const { data, loading, error } = useStatisticsData(filters);

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
                        <div className="flex items-center gap-2">
                            <DownloadReportButton />
                            <GeneralReportDialog />
                        </div>
                    </StatisticsFilters>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow h-64 animate-pulse">
                                    <div className="h-full bg-gray-200 rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : data ? (
                        <div id="stats-charts-container" className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                            {/* Replaced specialized components with generic UI components where applicable */}
                            <div className="bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8">
                                <BarChart
                                    data={data.parish.map((p: any) => ({ name: p.name, value: p.value }))}
                                    config={{ value: { label: "Casos", color: "#3E7DBB" } }}
                                    dataKey="value"
                                    nameKey="name"
                                    title="Distribución por Parroquia"
                                />
                            </div>
                            <div className="bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8">
                                <Pie2Chart
                                    data={data.caseStatus.map((s: any) => ({ name: s.name, value: s.value }))}
                                    config={{ value: { label: "Casos", color: "#3E7DBB" } }}
                                    dataKey="value"
                                    nameKey="name"
                                    title="Estado de los Casos"
                                />
                            </div>
                            <div className="bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8 col-span-2">
                                <CaseGrowthChart
                                    data={data.caseGrowth.map((c: any) => ({ name: c.month, value: c.count }))}
                                    config={{ value: { label: "Casos", color: "#3E7DBB" } }}
                                    dataKey="value"
                                    nameKey="name"
                                    title="Crecimiento de Casos"
                                />
                            </div>

                            <div className="bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8">
                                <Pie2Chart
                                    data={data.socioEconomic.gender.map((g: any) => ({ name: g.name, value: g.value }))}
                                    config={{ value: { label: "Cantidad", color: "#3E7DBB" } }}
                                    dataKey="value"
                                    nameKey="name"
                                    title="Género"
                                />
                            </div>

                            <div className="bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8">
                                <BarChart
                                    data={data.socioEconomic.age.map((a: any) => ({ name: a.name, value: a.value }))}
                                    config={{ value: { label: "Cantidad", color: "#3E7DBB" } }}
                                    dataKey="value"
                                    nameKey="name"
                                    title="Rangos de Edad"
                                />
                            </div>

                            <div className="bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8">
                                <Pie2Chart
                                    data={data.socioEconomic.housing.map((h: any) => ({ name: h.name, value: h.value }))}
                                    config={{ value: { label: "Cantidad" } }}
                                    dataKey="value"
                                    nameKey="name"
                                    title="Tipo de Vivienda"
                                />
                            </div>

                            <div className="bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8">
                                <BarChart
                                    data={data.socioEconomic.education.map((e: any) => ({ name: e.name, value: e.value }))}
                                    config={{ value: { label: "Cantidad", color: "#2751BA" } }} // Different shade maybe
                                    dataKey="value"
                                    nameKey="name"
                                    title="Nivel Educativo"
                                />
                            </div>

                            <div className="bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8">
                                <Pie2Chart
                                    data={data.socioEconomic.employment.map((e: any) => ({ name: e.name, value: e.value }))}
                                    config={{ value: { label: "Cantidad" } }}
                                    dataKey="value"
                                    nameKey="name"
                                    title="Situación Laboral"
                                />
                            </div>

                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
