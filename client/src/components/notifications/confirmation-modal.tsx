"use client";

import * as React from "react";
import { AlertTriangleIcon, InfoIcon, AlertCircleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Confirmation modal variant types
 */
export type ConfirmationVariant = "default" | "destructive" | "warning" | "info";

/**
 * Props for the ConfirmationModal component
 */
export interface ConfirmationModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** Title of the confirmation modal */
  title: string;
  /** Description/message of the confirmation modal */
  description: string;
  /** Text for the confirm button. Default: "Confirm" */
  confirmText?: string;
  /** Text for the cancel button. Default: "Cancel" */
  cancelText?: string;
  /** Callback when confirm button is clicked */
  onConfirm: () => void | Promise<void>;
  /** Callback when cancel button is clicked */
  onCancel?: () => void;
  /** Visual variant of the modal. Default: "default" */
  variant?: ConfirmationVariant;
  /** Whether the confirm action is loading */
  isLoading?: boolean;
  /** Whether to show the icon. Default: true */
  showIcon?: boolean;
}

/**
 * Get icon component based on variant
 */
const getVariantIcon = (variant: ConfirmationVariant) => {
  switch (variant) {
    case "destructive":
      return <AlertCircleIcon className="size-6 text-destructive" />;
    case "warning":
      return <AlertTriangleIcon className="size-6 text-amber-500" />;
    case "info":
      return <InfoIcon className="size-6 text-blue-500" />;
    default:
      return <InfoIcon className="size-6 text-primary" />;
  }
};

/**
 * Get confirm button variant based on modal variant
 */
const getConfirmButtonVariant = (variant: ConfirmationVariant) => {
  switch (variant) {
    case "destructive":
      return "destructive";
    default:
      return "default";
  }
};

/**
 * ConfirmationModal component
 * 
 * A reusable confirmation dialog for destructive or important actions.
 * Supports different variants (default, destructive, warning, info) with
 * appropriate styling and icons.
 * 
 * @example
 * ```tsx
 * <ConfirmationModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete Item"
 *   description="Are you sure you want to delete this item? This action cannot be undone."
 *   variant="destructive"
 *   confirmText="Delete"
 *   onConfirm={handleDelete}
 * />
 * ```
 */
export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  isLoading = false,
  showIcon = true,
}: ConfirmationModalProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-start gap-4">
          {showIcon && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              {getVariantIcon(variant)}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant(variant)}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmationModal;
