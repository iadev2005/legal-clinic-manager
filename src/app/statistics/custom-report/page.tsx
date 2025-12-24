"use client"

import { useSearchParams } from "next/navigation";
import { type ChartConfig } from "@/components/shadcn/chart";
import { useStatisticsData } from "@/hooks/useStatisticsData";

const commonConfig = {
    value: {
        label: "Cantidad",
        color: "#3E7DBB",
    }
} satisfies ChartConfig

export default function CustomReportPage() {
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
                <div className="text-sky-950 text-2xl font-semibold">Cargando reporte personalizado...</div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Page 1: Placeholder - Waiting for chart specifications */}
            <div id="custom-report-page-1" style={pageStyle} className="flex flex-col gap-10">
                <div className="flex flex-col items-center justify-center h-full">
                    <h1 className="text-sky-950 text-4xl font-bold mb-4">Reporte Personalizado</h1>
                    <p className="text-gray-600 text-lg">
                        Página base creada. Lista para agregar gráficas.
                    </p>
                </div>
            </div>

            {/* Page 2: Placeholder - Ready for additional charts */}
            <div id="custom-report-page-2" style={pageStyle} className="flex flex-col gap-10">
                <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-500 text-lg">
                        Página 2 - Esperando especificaciones de gráficas
                    </p>
                </div>
            </div>

            {/* Page 3: Placeholder - Ready for additional charts */}
            <div id="custom-report-page-3" style={pageStyle} className="flex flex-col gap-10">
                <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-500 text-lg">
                        Página 3 - Esperando especificaciones de gráficas
                    </p>
                </div>
            </div>
        </div>
    );
}
