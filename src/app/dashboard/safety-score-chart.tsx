"use client"

import * as React from "react"
import { PolarAngleAxis, RadialBar, RadialBarChart as RechartsRadialBarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"

const chartData = [{ month: "january", score: 92, fill: "var(--color-score)" }]

const chartConfig = {
  score: {
    label: "Safety Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function SafetyScoreChart() {
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    const animationTimeout = setTimeout(() => setScore(92), 200);
    return () => clearTimeout(animationTimeout);
  }, []);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Overall Safety Score</CardTitle>
        <CardDescription>January 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RechartsRadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={-450}
            innerRadius="80%"
            outerRadius="100%"
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              dataKey="score"
              tick={false}
            />
            <RadialBar
              dataKey="score"
              background={{
                fill: "hsl(var(--muted))",
              }}
              cornerRadius={10}
              data={[
                {...chartData[0], score}
              ]}
            />
          </RechartsRadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Excellent Safety Performance
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total score for the last 30 days
        </div>
      </CardFooter>
    </Card>
  )
}
