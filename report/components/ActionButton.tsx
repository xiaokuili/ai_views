import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ActionButtonsProps {
  onDelete?: () => Promise<void>;
  onSubmit?: () => Promise<void>;
  isDeleting: boolean;
  isSubmitting: boolean;
  showDelete?: boolean;
  deleteText?: string;
  submitText?: string;
  deletingText?: string;
  submittingText?: string;
}

export function ActionButtons({
  onDelete,
  onSubmit,
  isDeleting,
  isSubmitting,
  deleteText = "删除",
  submitText = "提交",
  deletingText = "删除中...",
  submittingText = "提交中...",
}: ActionButtonsProps) {
  return (
    <>
      <Button
        type='button'
        variant='destructive'
        onClick={onDelete}
        disabled={isDeleting || isSubmitting}
      >
        {isDeleting ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            {deletingText}
          </>
        ) : (
          deleteText
        )}
      </Button>

      <Button type='submit' disabled={isDeleting || isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            {submittingText}
          </>
        ) : (
          submitText
        )}
      </Button>
    </>
  );
}
