"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { assignmentsData, glassStyles, animationClasses } from "@/config/teacher-constants";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Calendar, 
  Users, 
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export default function AssignmentsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Graded":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <Clock className="h-4 w-4" />;
      case "Draft":
        return <Edit className="h-4 w-4" />;
      case "Graded":
        return <CheckCircle className="h-4 w-4" />;
      case "Closed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "rounded-2xl p-6",
        glassStyles.card,
        "shadow-glass-sm",
        animationClasses.fadeIn
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Assignments 📝
            </h1>
            <p className="text-muted-foreground">
              Create and manage assignments for your classes.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Assignments Table */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            All Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Assignment
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Due Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Submissions
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignmentsData.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{assignment.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {assignment.subject}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs flex items-center gap-1", getStatusColor(assignment.status))}
                      >
                        {getStatusIcon(assignment.status)}
                        {assignment.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{assignment.submissions}</span>
                        <span className="text-muted-foreground">/ {assignment.totalStudents}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold text-foreground">{assignmentsData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">
                  {assignmentsData.filter(a => a.status === "Active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Graded</p>
                <p className="text-2xl font-bold text-foreground">
                  {assignmentsData.filter(a => a.status === "Graded").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold text-foreground">
                  {assignmentsData.reduce((sum, a) => sum + a.submissions, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
