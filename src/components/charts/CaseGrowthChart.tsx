"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"

interface CaseGrowthChartProps {
    data: { month: string; count: number }[]
}

export function CaseGrowthChart({ data }: CaseGrowthChartProps) {
    return (
        <Card className="font-bold text-sky-950 col-span-2">
            <CardHeader>
                <CardTitle>Casos Nuevos</CardTitle>
                <CardDescription>Registro de casos por mes</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#003366"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
