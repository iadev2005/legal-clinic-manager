import { PieChartCustom } from "@/components/charts/PieChartCustom"
import { ChartConfig } from "@/components/shadcn/chart"

const chartConfig = {
    masculino: { label: "Masculino", color: "#003366" },
    femenino: { label: "Femenino", color: "#3E7DBB" },
    otro: { label: "Otro", color: "#73ACE6" },
} satisfies ChartConfig

interface GenderChartProps {
    data: { name: string, value: number }[]
}

export function GenderChart({ data }: GenderChartProps) {
    return (
        <PieChartCustom
            data={data}
            title="Distribución por Género"
            description="Perfil demográfico de los solicitantes"
            config={chartConfig}
        />
    )
}
