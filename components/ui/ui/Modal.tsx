/**
 * Modal component wrapper for Dialog
 * Provides a reusable modal interface with consistent styling
 */

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Modal component - a reusable modal wrapper
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Delete User"
 *   description="Are you sure you want to delete this user?"
 * >
 *   Modal content here
 * </Modal>
 * ```
 */
export const Modal = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  ModalProps
>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      footer,
      className,
      size = "md",
    },
    ref
  ) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent ref={ref} className={cn(sizeClasses[size], className)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    );
  }
);

Modal.displayName = "Modal";
