import { PieChartCustom } from "@/components/charts/PieChartCustom"
import { ChartConfig } from "@/components/shadcn/chart"

const chartConfig = {
    patrono: { label: "Patrono", color: "#003366" },
    empleado: { label: "Empleado", color: "#3E7DBB" },
    obrero: { label: "Obrero", color: "#73ACE6" },
    cuenta_propia: { label: "Cuenta propia", color: "#D4EAFF" },
    desempleado: { label: "Desempleado", color: "#2751BA" },
} satisfies ChartConfig

interface EmploymentChartProps {
    data: { name: string, value: number }[]
}

export function EmploymentChart({ data }: EmploymentChartProps) {
    return (
        <PieChartCustom
            data={data}
            title="Condición Laboral"
            description="Estatus de ocupación de los solicitantes"
            config={chartConfig}
        />
    )
}
