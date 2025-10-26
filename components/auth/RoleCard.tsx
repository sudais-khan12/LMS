"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

export function RoleCard({
  title,
  description,
  icon: Icon,
  onClick,
  className,
}: RoleCardProps) {
  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300 bg-card/80 backdrop-blur-md border border-border/50 hover:bg-card hover:shadow-xl hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={onClick}>
          Select Role
        </Button>
      </CardContent>
    </Card>
  );
}
