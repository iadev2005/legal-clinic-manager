"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { PieChart } from "@/components/ui/pie-chart"
import { caseStatusData } from "@/data/statistics-data"
import { ChartConfig } from "@/components/shadcn/chart"

const chartConfig = {
    Abierto: { label: "Abierto", color: "#003366" },
    Cerrado: { label: "Cerrado", color: "#3E7DBB" },
    Pendiente: { label: "Pendiente", color: "#73ACE6" },
    Archivado: { label: "Archivado", color: "#D4EAFF" },
} satisfies ChartConfig

export function CaseStatusChart() {
    // Transform data to match PieChart expected format (adding fill color based on name if needed or relying on palette)
    // The shared PieChart component handles palette automatically if fill is not present, or we can force it from config.
    const chartData = caseStatusData.map(item => ({
        ...item,
        fill: (chartConfig as any)[item.name]?.color || "#003366"
    }))

    return (
        <Card className="font-bold text-sky-950 col-span-1">
            <CardHeader>
                <CardTitle>Estados de los Casos</CardTitle>
                <CardDescription>Distribución actual de los estatus</CardDescription>
            </CardHeader>
            <CardContent>
                <PieChart
                    data={chartData}
                    config={chartConfig}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                />
            </CardContent>
        </Card>
    )
}
