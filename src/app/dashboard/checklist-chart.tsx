"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { date: "2024-07-15", completion: 85 },
  { date: "2024-07-16", completion: 92 },
  { date: "2024-07-17", completion: 95 },
  { date: "2024-07-18", completion: 88 },
  { date: "2024-07-19", completion: 98 },
  { date: "2024-07-20", completion: 100 },
  { date: "2024-07-21", completion: 93 },
];

const chartConfig = {
  completion: {
    label: "Completion",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ChecklistChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Checklist Completion</CardTitle>
        <CardDescription>Last 7 Days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
            />
            <YAxis
                tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value) => `${value}%`}
                indicator="dot"
              />}
            />
            <Bar dataKey="completion" fill="var(--color-completion)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
