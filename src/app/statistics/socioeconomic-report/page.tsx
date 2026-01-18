"use client"

import { useSearchParams } from "next/navigation";
import { Pie2Chart } from "@/components/ui/pie2-chart";
import { BarChart } from "@/components/ui/bar-chart";
import { CaseGrowthChart } from "@/components/ui/area-chart";
import { type ChartConfig } from "@/components/shadcn/chart";
import { useStatisticsData } from "@/hooks/useStatisticsData";

const commonConfig = {
    value: {
        label: "Cantidad",
        color: "#3E7DBB",
    }
} satisfies ChartConfig

export default function ReportPage() {
    const searchParams = useSearchParams();

    const filters = {
        materia: searchParams.get('materia') || searchParams.get('subject') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        nucleus: searchParams.get('nucleus') || undefined,
    };

    const { data, loading } = useStatisticsData(filters);

    const pageStyle = {
        width: "270mm",
        height: "270mm",
        padding: "15mm",
        backgroundColor: "white",
        margin: "0 auto",
    };

    const isLoading = loading || !data;

    if (!data) {
        return (
            <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
                <div className="text-sky-950 text-2xl font-semibold">Cargando reporte...</div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Page 1: Case Metrics */}
            <div id="socioeconomic-report-page-1" style={pageStyle} className="flex flex-col gap-10">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-5 col-span-2">
                        <CaseGrowthChart
                            data={data.caseGrowth.map((c: any) => ({ name: c.month, value: c.count }))}
                            config={{ value: { label: "Casos", color: "#3E7DBB" } }}
                            dataKey="value"
                            nameKey="name"
                            title="Crecimiento de Casos"
                            disableAnimation
                        />
                    </div>
                    <div className="p-5 ">
                        <BarChart
                            data={data.parish.map((p: any) => ({ name: p.name, value: p.value }))}
                            config={{ value: { label: "Casos", color: "#3E7DBB" } }}
                            dataKey="value"
                            nameKey="name"
                            title="Distribución por Parroquia"
                            disableAnimation
                        />
                    </div>
                    <div className="p-5 ">
                        <Pie2Chart
                            data={data.caseStatus.map((s: any) => ({ name: s.name, value: s.value }))}
                            config={{ value: { label: "Casos", color: "#3E7DBB" } }}
                            dataKey="value"
                            nameKey="name"
                            title="Estado de los Casos"
                            disableAnimation
                        />
                    </div>

                </div>
            </div>

            {/* Page 2: Socio-Economic Part 1 */}
            <div id="socioeconomic-report-page-2" style={pageStyle} className="flex flex-col gap-10">
                <div className="grid grid-cols-1 md:grid-cols-2 ">
                    <Pie2Chart
                        data={data.socioEconomic.gender.map((g: any) => ({ name: g.name, value: g.value }))}
                        title="Distribución por Género"
                        config={{ value: { label: "Cantidad" } }}
                        dataKey="value"
                        nameKey="name"
                        disableAnimation
                    />
                    {/* AgeChart -> BarChart */}
                    <BarChart
                        data={data.socioEconomic.age.map((a: any) => ({ name: a.name, value: a.value }))}
                        title="Rangos de Edad"
                        config={{ value: { label: "Cantidad" } }}
                        dataKey="value"
                        nameKey="name"
                        disableAnimation
                    />
                </div>
                <div className="grid grid-cols-1">
                    <Pie2Chart
                        data={data.socioEconomic.housing.map((h: any) => ({ name: h.name, value: h.value }))}
                        title="Tipo de Vivienda"
                        config={{ value: { label: "Cantidad" } }}
                        dataKey="value"
                        nameKey="name"
                        disableAnimation
                    />
                </div>
            </div>

            {/* Page 3: Socio-Economic Part 2 */}
            <div id="socioeconomic-report-page-3" style={pageStyle} className="flex flex-col gap-10">
                <div className="grid grid-cols-1 md:grid-cols-2 ">
                    <Pie2Chart
                        data={data.socioEconomic.education.map((e: any) => ({ name: e.name, value: e.value }))}
                        title="Nivel Educativo"
                        config={{ value: { label: "Cantidad" } }}
                        dataKey="value"
                        nameKey="name"
                        disableAnimation
                    />

                    <Pie2Chart
                        data={data.socioEconomic.employment.map((e: any) => ({ name: e.name, value: e.value }))}
                        title="Condición Laboral"
                        config={{ value: { label: "Cantidad" } }}
                        dataKey="value"
                        nameKey="name"
                        disableAnimation
                    />
                </div>
            </div>
        </div>
    );
}
