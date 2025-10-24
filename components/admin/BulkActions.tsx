"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Student } from "@/types/student";
import { UserCheck, UserX, Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface BulkActionsProps {
  selectedStudents: number[];
  students: Student[];
  onBulkActivate: (studentIds: number[]) => void;
  onBulkDeactivate: (studentIds: number[]) => void;
  onBulkDelete: (studentIds: number[]) => void;
  isLoading?: boolean;
}

export default function BulkActions({
  selectedStudents,
  students,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  isLoading = false,
}: BulkActionsProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const selectedStudentObjects = students.filter((student) =>
    selectedStudents.includes(student.id)
  );

  const activeStudents = selectedStudentObjects.filter(
    (student) => student.status === "Active"
  );
  const inactiveStudents = selectedStudentObjects.filter(
    (student) => student.status !== "Active"
  );

  const handleBulkActivate = () => {
    const studentIds = inactiveStudents.map((student) => student.id);
    onBulkActivate(studentIds);
  };

  const handleBulkDeactivate = () => {
    const studentIds = activeStudents.map((student) => student.id);
    onBulkDeactivate(studentIds);
  };

  const handleBulkDelete = () => {
    onBulkDelete(selectedStudents);
    setIsDeleteModalOpen(false);
  };

  if (selectedStudents.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {selectedStudents.length} selected
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {inactiveStudents.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkActivate}
              disabled={isLoading}
              className="flex items-center gap-1 text-green-600 hover:text-green-700"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <UserCheck className="h-3 w-3" />
              )}
              Activate ({inactiveStudents.length})
            </Button>
          )}

          {activeStudents.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDeactivate}
              disabled={isLoading}
              className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <UserX className="h-3 w-3" />
              )}
              Deactivate ({activeStudents.length})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isLoading}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
            Delete ({selectedStudents.length})
          </Button>
        </div>
      </div>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Multiple Students
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStudents.length}{" "}
              students? This action cannot be undone and will permanently remove
              all student data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            <div className="text-sm font-medium text-muted-foreground">
              Students to be deleted:
            </div>
            {selectedStudentObjects.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
              >
                <div className="text-sm font-medium text-foreground">
                  {student.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {student.email} • {student.studentId}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedStudents.length} Students`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
