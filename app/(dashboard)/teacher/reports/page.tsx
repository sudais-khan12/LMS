"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChartCard from "@/components/ui/ChartCard";
import { 
  attendanceTrendData, 
  studentPerformanceData,
  glassStyles,
  animationClasses 
} from "@/config/teacher-constants";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Calendar, 
  Filter,
  Download,
  TrendingUp,
  Users,
  BookOpen,
  Award
} from "lucide-react";

export default function ReportsPage() {
  // Additional report data
  const classPerformanceData = [
    { course: "Mathematics", enrollments: 87, completions: 24 },
    { course: "Physics", enrollments: 82, completions: 22 },
    { course: "Chemistry", enrollments: 89, completions: 20 },
    { course: "Biology", enrollments: 85, completions: 18 },
  ];

  const monthlyStats = [
    { month: "Jan", users: 85 },
    { month: "Feb", users: 87 },
    { month: "Mar", users: 89 },
    { month: "Apr", users: 88 },
  ];

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
              Reports 📈
            </h1>
            <p className="text-muted-foreground">
              Analyze student performance and class statistics.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filter Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Date Range
              </label>
              <select className="w-full p-2 border border-border rounded-lg bg-background text-foreground">
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last 6 months</option>
                <option>This year</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Class
              </label>
              <select className="w-full p-2 border border-border rounded-lg bg-background text-foreground">
                <option>All Classes</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Subject
              </label>
              <select className="w-full p-2 border border-border rounded-lg bg-background text-foreground">
                <option>All Subjects</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Attendance Trend"
          data={attendanceTrendData}
          type="line"
        />
        <ChartCard
          title="Student Performance"
          data={studentPerformanceData}
          type="bar"
        />
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Class Performance Overview"
          data={classPerformanceData}
          type="bar"
        />
        <ChartCard
          title="Monthly Assignment Statistics"
          data={monthlyStats}
          type="line"
        />
      </div>

      {/* Summary Stats */}
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
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Grade</p>
                <p className="text-2xl font-bold text-foreground">87%</p>
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
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">156</p>
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
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                <p className="text-2xl font-bold text-foreground">45</p>
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
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Performer</p>
                <p className="text-2xl font-bold text-foreground">Alice J.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
