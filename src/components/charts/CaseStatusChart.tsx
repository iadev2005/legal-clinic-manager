import { PieChartCustom } from "@/components/charts/PieChartCustom"
import { ChartConfig } from "@/components/shadcn/chart"

const chartConfig = {
    entregado: { label: "Entregado", color: "#003366" },
    archivado: { label: "Archivado", color: "#3E7DBB" },
    en_proceso: { label: "En Proceso", color: "#73ACE6" },
    asesoría: { label: "Asesoría", color: "#D4EAFF" },
} satisfies ChartConfig

interface CaseStatusChartProps {
    data: { name: string; value: number }[]
}

export function CaseStatusChart({ data }: CaseStatusChartProps) {
    return (
        <PieChartCustom
            data={data}
            title="Estados de los Casos"
            description="Distribución actual de los estatus"
            config={chartConfig}
        />
    )
}
