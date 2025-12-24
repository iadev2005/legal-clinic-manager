"use client"

import { useSearchParams } from "next/navigation";
import { PieChartCustom } from "@/components/charts/PieChartCustom";
import { ParishChart } from "@/components/charts/ParishChart";
import { CaseGrowthChart } from "@/components/charts/CaseGrowthChart";
import { AgeChart } from "@/components/charts/AgeChart";
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
        materia: searchParams.get('subject') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        nucleus: searchParams.get('nucleus') || undefined,
    };

    const { data, loading } = useStatisticsData(filters);

    const pageStyle = {
        width: "210mm",
        height: "270mm",
        padding: "15mm",
        backgroundColor: "white",
        margin: "0 auto",
    };

    if (loading || !data) {
        return (
            <div className="bg-white flex items-center justify-center min-h-screen">
                <div className="text-sky-950 text-2xl font-semibold">Cargando reporte...</div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Page 1: Case Metrics */}
            <div id="report-page-1" style={pageStyle} className="flex flex-col gap-10">
                <div className="flex flex-col gap-10">
                    <PieChartCustom
                        data={data.caseStatus}
                        title="Estados de los Casos"
                        description="Distribución actual de los estatus"
                        config={commonConfig}
                    />
                    <ParishChart data={data.parish} />
                    <CaseGrowthChart data={data.caseGrowth} />
                </div>
            </div>

            {/* Page 2: Socio-Economic Part 1 */}
            <div id="report-page-2" style={pageStyle} className="flex flex-col gap-10">
                <div className="grid grid-cols-2 gap-8">
                    <PieChartCustom
                        data={data.socioEconomic.gender}
                        title="Distribución por Género"
                        config={commonConfig}
                    />
                    <AgeChart data={data.socioEconomic.age} />
                </div>
                <div className="grid grid-cols-1">
                    <PieChartCustom
                        data={data.socioEconomic.housing}
                        title="Tipo de Vivienda"
                        config={commonConfig}
                    />
                </div>
            </div>

            {/* Page 3: Socio-Economic Part 2 */}
            <div id="report-page-3" style={pageStyle} className="flex flex-col gap-10">
                <div className="grid grid-cols-1 gap-12">
                    <PieChartCustom
                        data={data.socioEconomic.education}
                        title="Nivel Educativo"
                        config={commonConfig}
                    />

                    <PieChartCustom
                        data={data.socioEconomic.employment}
                        title="Condición Laboral"
                        config={commonConfig}
                    />
                </div>
            </div>
        </div>
    );
}
