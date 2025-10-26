"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  className,
}: AuthCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-md bg-card/80 backdrop-blur-md border border-border/50 shadow-lg",
        className
      )}
    >
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
