"use client";

import * as React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/shadcn/chart";

interface BarChartProps {
  data: any[];
  config: ChartConfig;
  dataKey: string;
  nameKey: string;
  title?: string;
  disableAnimation?: boolean;
}

export function BarChart({
  data,
  config,
  dataKey,
  nameKey,
  title,
  disableAnimation,
}: BarChartProps) {
  const processedData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      fill: "#3E7DBB",
    }));
  }, [data]);

  return (
    <Card className="flex flex-col border-none shadow-none bg-transparent">
      {title && (
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-sky-950 text-2xl font-semibold font-serif leading-none">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="h-[350px] w-full">
          <RechartsBarChart data={processedData} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey={nameKey}
              angle={-45}
              textAnchor="end"
              height={150}
              interval={0}
              tick={{ fill: "#0F172A", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "#0F172A", fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey={dataKey} fill="#3E7DBB" radius={[8, 8, 0, 0]} isAnimationActive={!disableAnimation} />
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
