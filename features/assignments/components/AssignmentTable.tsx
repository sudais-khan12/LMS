"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  Eye,
  CheckCircle,
  Loader2,
} from "lucide-react";
import type { StudentAssignment } from "@/features/assignments/api/mock";

interface AssignmentTableProps {
  assignments: StudentAssignment[];
  onMarkAsDone?: (assignmentId: number) => void;
  onViewAssignment?: (assignment: StudentAssignment) => void;
  isLoading?: boolean;
}

export default function AssignmentTable({
  assignments,
  onMarkAsDone,
  onViewAssignment,
  isLoading = false,
}: AssignmentTableProps) {
  const { toast } = useToast();

  const getStatusBadge = (status: StudentAssignment["status"]) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Submitted
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            Pending
          </Badge>
        );
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getActionButton = (assignment: StudentAssignment) => {
    if (assignment.status === "submitted") {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <FileText className="h-4 w-4 mr-2" />
            View Submission
          </Button>
          {onViewAssignment && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewAssignment(assignment)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        {onMarkAsDone && (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => onMarkAsDone(assignment.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Mark as Done
          </Button>
        )}
        {onViewAssignment && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewAssignment(assignment)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Button>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (dueDate: string) => {
    return (
      new Date(dueDate) < new Date() &&
      !assignments
        .find((a) => a.dueDate === dueDate)
        ?.status.includes("submitted")
    );
  };

  return (
    <Card
      className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          Assignments ({assignments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className={cn(
                "p-4 rounded-lg border transition-colors duration-200",
                assignment.status === "overdue"
                  ? "border-red-200 bg-red-50/30 hover:bg-red-50/50"
                  : "border-border/50 hover:bg-muted/30"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {assignment.title}
                    </h3>
                    {getStatusBadge(assignment.status)}
                    {assignment.grade && (
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700"
                      >
                        Grade: {assignment.grade}
                      </Badge>
                    )}
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
                      <span
                        className={cn(
                          isOverdue(assignment.dueDate)
                            ? "text-red-600 font-medium"
                            : ""
                        )}
                      >
                        Due: {formatDate(assignment.dueDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {assignment.status === "overdue"
                          ? "Overdue"
                          : assignment.status === "submitted"
                          ? "Submitted"
                          : "Pending"}
                      </span>
                    </div>
                    {assignment.submittedDate && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">
                          Submitted: {formatDate(assignment.submittedDate)}
                        </span>
                      </div>
                    )}
                  </div>
                  {assignment.feedback && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                      <strong>Feedback:</strong> {assignment.feedback}
                    </div>
                  )}
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
