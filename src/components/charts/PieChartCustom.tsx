"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/shadcn/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/shadcn/chart"

interface PieChartCustomProps {
    data: { name: string; value: number }[]
    title: string
    description?: string
    config: ChartConfig
}

export function PieChartCustom({ data, title, description, config }: PieChartCustomProps) {
    // Map data to include fill colors from config if available, otherwise use index-based colors
    const chartData = React.useMemo(() => {
        return data.map((item, index) => {
            const key = item.name.toLowerCase().replace(/\s+/g, "_")
            return {
                ...item,
                nameKey: key,
                fill: config[key]?.color || `var(--chart-${(index % 5) + 1})`,
            }
        })
    }, [data, config])

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center pb-2">
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={config}
                    className="mx-auto aspect-square max-h-[300px] [&_.recharts-pie-label-text]:fill-sky-950 [&_.recharts-pie-label-text]:font-medium [&_.recharts-pie-label-text]:text-[10px]"
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius="70%"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
