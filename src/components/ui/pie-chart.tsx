"use client"

import * as React from "react"
import { Pie, PieChart as RechartsPieChart } from "recharts"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/shadcn/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/shadcn/chart"

interface PieChartProps {
    data: any[]
    config: ChartConfig
    dataKey: string
    nameKey: string
    title?: string
    innerRadius?: number
}

const BLUE_PALETTE = [
    "#003366",
    "#3E7DBB",
    "#73ACE6",
    "#D4EAFF",
    "#2751BA",
    "#0A233C",
]

export function PieChart({ data, config, dataKey, nameKey, title, innerRadius = 0 }: PieChartProps) {
    const processedData = React.useMemo(() => {
        return data.map((item, index) => ({
            ...item,
            fill: item.fill || BLUE_PALETTE[index % BLUE_PALETTE.length]
        }))
    }, [data])

    return (
        <Card className="flex flex-col border-none shadow-none bg-transparent">
            {title && (
                <CardHeader className="items-center pb-0">
                    <CardTitle className="text-sky-950 text-2xl font-semibold font-serif leading-none">{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className="flex-1 pb-0 pt-0">
                <ChartContainer
                    config={config}
                    className="mx-auto aspect-square max-h-[250px] min-w-[250px] -mt-10 -mb-2"
                >
                    <RechartsPieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={processedData}
                            dataKey={dataKey}
                            nameKey={nameKey}
                            innerRadius={innerRadius}
                            strokeWidth={0}
                        />
                    </RechartsPieChart>
                </ChartContainer>
            </CardContent>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 -mt-5 mb-2 max-w-[240px] mx-auto">
                {processedData.map((entry, index) => {
                    const key = entry[nameKey] as string
                    return (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.fill }}
                            />
                            <span className="text-sky-950 font-medium text-sm capitalize">
                                {config[key]?.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
