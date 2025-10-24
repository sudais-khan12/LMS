"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ExportOptions } from "@/types/report";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";

interface ExportButtonProps {
  onExport: (options: ExportOptions) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function ExportButton({
  onExport,
  isLoading = false,
  disabled = false,
}: ExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "csv" | "pdf") => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onExport({ format });

      toast({
        title: "Export ready for download",
        description: `Your report has been exported as ${format.toUpperCase()} and is ready for download.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={disabled || isLoading || isExporting}
          className="flex items-center gap-2"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4 text-red-600" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
