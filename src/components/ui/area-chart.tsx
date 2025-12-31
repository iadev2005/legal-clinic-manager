import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/shadcn/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/shadcn/chart"

interface CaseGrowthChartProps {
    data: any[]
    config: ChartConfig
    dataKey: string
    nameKey: string
    title?: string
    disableAnimation?: boolean
}

export function CaseGrowthChart({
    data,
    config,
    dataKey,
    nameKey,
    title,
    disableAnimation
}: CaseGrowthChartProps) {
    return (
        <Card className="flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-sky-950 text-2xl font-semibold font-serif leading-none">{title || "Crecimiento de Casos"}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config} className="h-[300px] w-full">
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            top: 20,
                            left: 24,
                            right: 24,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={nameKey}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            interval={0}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Line
                            dataKey={dataKey}
                            type="natural"
                            stroke={config[dataKey]?.color || "#3E7DBB"}
                            strokeWidth={2}
                            isAnimationActive={!disableAnimation}
                            dot={{
                                fill: config[dataKey]?.color || "#3E7DBB",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Line>
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Tendencia de casos en el último periodo <TrendingUp className="h-4 w-4" />
                </div>
            </CardFooter>
        </Card>
    )
}
