"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Paperclip,
} from "lucide-react";
import type { StudentAssignment } from "@/features/assignments/api/mock";

interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: StudentAssignment | null;
  onMarkAsDone?: (assignmentId: number, file?: File) => Promise<void>;
  isLoading?: boolean;
}

export default function AssignmentDetailsModal({
  isOpen,
  onClose,
  assignment,
  onMarkAsDone,
  isLoading = false,
}: AssignmentDetailsModalProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!assignment) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!onMarkAsDone) return;

    setIsUploading(true);
    try {
      await onMarkAsDone(assignment.id, selectedFile || undefined);
      toast({
        title: "Assignment Submitted",
        description: `${assignment.title} has been submitted successfully!`,
      });
      setSelectedFile(null);
      onClose();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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

  const isOverdue =
    new Date(assignment.dueDate) < new Date() &&
    assignment.status !== "submitted";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Assignment Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Header */}
          <Card
            className={cn(
              glassStyles.card,
              "rounded-xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-foreground mb-2">
                    {assignment.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-3">
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
                  <p className="text-muted-foreground">
                    <strong>Course:</strong> {assignment.course}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Points:</strong> {assignment.points}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span
                    className={cn(isOverdue ? "text-red-600 font-medium" : "")}
                  >
                    Due: {formatDate(assignment.dueDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
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
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">
                      Submitted: {formatDate(assignment.submittedDate)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Description */}
          <Card
            className={cn(
              glassStyles.card,
              "rounded-xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Assignment Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {assignment.description}
              </p>
            </CardContent>
          </Card>

          {/* Feedback Section */}
          {assignment.feedback && (
            <Card
              className={cn(
                "rounded-xl shadow-glass-sm border-blue-200 bg-blue-50/30",
                animationClasses.scaleIn
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Instructor Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800 leading-relaxed">
                  {assignment.feedback}
                </p>
              </CardContent>
            </Card>
          )}

          {/* File Upload Section */}
          {assignment.status !== "submitted" && (
            <Card
              className={cn(
                glassStyles.card,
                "rounded-xl shadow-glass-sm",
                animationClasses.scaleIn
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Submit Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Paperclip className="h-4 w-4" />
                      Choose File
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Accepted formats: PDF, DOC, DOCX, TXT, ZIP, RAR (Max 10MB)
                    </span>
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || isUploading}
                    className="flex items-center gap-2"
                  >
                    {isLoading || isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {isUploading ? "Submitting..." : "Submit Assignment"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading || isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overdue Warning */}
          {isOverdue && assignment.status !== "submitted" && (
            <Card
              className={cn(
                "rounded-xl shadow-glass-sm border-red-200 bg-red-50/50",
                animationClasses.scaleIn
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">
                      This assignment is overdue
                    </p>
                    <p className="text-sm text-red-600">
                      Please submit it as soon as possible to avoid further
                      penalties.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
