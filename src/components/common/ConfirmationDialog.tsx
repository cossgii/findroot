import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogPortal, DialogOverlay } from '@radix-ui/react-dialog';
import Button from '~/src/components/common/button';
import { cn } from '~/src/utils/class-name';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-[9998]" />
        <DialogContent onClick={(e) => e.stopPropagation()} className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "bg-white p-6 rounded-lg shadow-lg z-[9999]",
          "sm:max-w-[425px]"
        )}>
          <div>
            <DialogTitle className="text-xl font-bold mb-2">{title}</DialogTitle>
            <DialogDescription className="text-gray-700 mb-4">{message}</DialogDescription>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outlined" onClick={onCancel}>
              취소
            </Button>
            <Button type="button" onClick={onConfirm}>
              확인
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

