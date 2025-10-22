"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";

// Define ChartDataInput locally since it's not exported by recharts
type ChartDataInput = Record<string, unknown>;

interface ReportChartProps {
  title: string;
  data: ChartDataInput[];
  type: "line" | "bar" | "pie";
  dataKey?: string;
  xAxisKey?: string;
  colors?: string[];
}

export default function ReportChart({ title, data, type, dataKey, xAxisKey, colors }: ReportChartProps) {
  const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.3)" />
              <XAxis 
                dataKey={xAxisKey || "month"} 
                stroke="rgba(100, 116, 139, 0.8)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(100, 116, 139, 0.8)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(226, 232, 240, 0.5)",
                  borderRadius: "8px",
                  backdropFilter: "blur(8px)",
                }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey || "value"} 
                stroke={colors?.[0] || defaultColors[0]} 
                strokeWidth={2}
                dot={{ fill: colors?.[0] || defaultColors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors?.[0] || defaultColors[0], strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.3)" />
              <XAxis 
                dataKey={xAxisKey || "name"} 
                stroke="rgba(100, 116, 139, 0.8)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(100, 116, 139, 0.8)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(226, 232, 240, 0.5)",
                  borderRadius: "8px",
                  backdropFilter: "blur(8px)",
                }}
              />
              <Bar 
                dataKey={dataKey || "value"} 
                fill={colors?.[0] || defaultColors[0]} 
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((typeof percent === "number" ? percent : 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey || "value"}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors?.[index] || defaultColors[index % defaultColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(226, 232, 240, 0.5)",
                  borderRadius: "8px",
                  backdropFilter: "blur(8px)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn(
      glassStyles.card,
      glassStyles.cardHover,
      "rounded-2xl shadow-glass-sm",
      animationClasses.scaleIn
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <BarChart3 className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
