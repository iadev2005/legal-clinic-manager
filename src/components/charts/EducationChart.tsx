import { PieChartCustom } from "@/components/charts/PieChartCustom"
import { ChartConfig } from "@/components/shadcn/chart"

const chartConfig = {
    primaria: { label: "Primaria", color: "#003366" },
    secundaria: { label: "Secundaria", color: "#3E7DBB" },
    universitaria: { label: "Universitaria", color: "#73ACE6" },
    postgrado: { label: "Postgrado", color: "#D4EAFF" },
    ninguno: { label: "Ninguno", color: "#94a3b8" },
} satisfies ChartConfig

interface EducationChartProps {
    data: { name: string, value: number }[]
}

export function EducationChart({ data }: EducationChartProps) {
    return (
        <PieChartCustom
            data={data}
            title="Nivel Educativo"
            description="Grado de instrucción alcanzado"
            config={chartConfig}
        />
    )
}
