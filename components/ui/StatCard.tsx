"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { StatCardProps } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatCard({ title, value, change, changeType, icon: Icon }: StatCardProps) {
  const getChangeIcon = () => {
    switch (changeType) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className={cn(
      glassStyles.card,
      glassStyles.cardHover,
      "rounded-2xl shadow-glass-sm",
      animationClasses.scaleIn
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          getChangeColor()
        )}>
          {getChangeIcon()}
          <span>{change} from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
