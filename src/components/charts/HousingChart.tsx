import { PieChartCustom } from "@/components/charts/PieChartCustom"
import { ChartConfig } from "@/components/shadcn/chart"

const chartConfig = {
    casa: { label: "Casa", color: "#003366" },
    apartamento: { label: "Apartamento", color: "#3E7DBB" },
    rancho: { label: "Rancho", color: "#73ACE6" },
    otro: { label: "Otro", color: "#D4EAFF" },
} satisfies ChartConfig

interface HousingChartProps {
    data: { name: string, value: number }[]
}

export function HousingChart({ data }: HousingChartProps) {
    return (
        <PieChartCustom
            data={data}
            title="Tipo de Vivienda"
            description="Situación habitacional de los solicitantes"
            config={chartConfig}
        />
    )
}
