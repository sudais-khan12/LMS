"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { Calendar, Clock, FileText, Upload } from "lucide-react";

interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: "submitted" | "pending" | "overdue";
  points: number;
  description: string;
}

interface AssignmentTableProps {
  assignments: Assignment[];
}

export default function AssignmentTable({ assignments }: AssignmentTableProps) {
  const getStatusBadge = (status: Assignment["status"]) => {
    switch (status) {
      case "submitted":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Submitted</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getActionButton = (assignment: Assignment) => {
    if (assignment.status === "submitted") {
      return (
        <Button variant="outline" size="sm" disabled>
          <FileText className="h-4 w-4 mr-2" />
          View Submission
        </Button>
      );
    }
    
    return (
      <Button size="sm" className="bg-primary hover:bg-primary/90">
        <Upload className="h-4 w-4 mr-2" />
        Submit
      </Button>
    );
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
          <FileText className="h-5 w-5 text-primary" />
          Assignments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {assignment.title}
                    </h3>
                    {getStatusBadge(assignment.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {assignment.course} • {assignment.points} points
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {assignment.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {assignment.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {assignment.status === "overdue" ? "Overdue" : 
                         assignment.status === "submitted" ? "Submitted" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getActionButton(assignment)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
