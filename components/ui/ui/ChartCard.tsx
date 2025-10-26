"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { ChartCardProps, ChartDataPoint, CourseEngagementData } from "@/lib/types";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function ChartCard({ title, data, type }: ChartCardProps) {
  const renderChart = () => {
    if (type === "line") {
      const lineData = data as ChartDataPoint[];
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.3)" />
            <XAxis 
              dataKey="month" 
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
              dataKey="users" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      const barData = data as CourseEngagementData[];
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.3)" />
            <XAxis 
              dataKey="course" 
              stroke="rgba(100, 116, 139, 0.8)"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
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
              dataKey="enrollments" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            <Bar 
              dataKey="completions" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      );
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
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
