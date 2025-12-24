"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/shadcn/chart"

const chartConfig = {
    value: {
        label: "Cantidad",
        color: "#3E7DBB",
    },
} satisfies ChartConfig

interface AgeChartProps {
    data: { name: string, value: number }[]
}

export function AgeChart({ data }: AgeChartProps) {
    return (
        <Card className="font-bold text-sky-950 col-span-1">
            <CardHeader>
                <CardTitle>Distribución por Edad</CardTitle>
                <CardDescription>Rangos de edad de la población atendida</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="var(--color-value)"
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}
