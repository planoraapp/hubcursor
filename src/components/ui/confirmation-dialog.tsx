import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'OK',
  cancelText = 'Cancelar',
  onConfirm,
  variant = 'default',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border-2 border-black shadow-xl rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle 
            className="volter-font text-lg font-bold"
            style={{
              textShadow: '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
              color: variant === 'destructive' ? '#db3056' : '#0070e0'
            }}
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="volter-font text-sm text-gray-700 mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel 
            className="volter-font border-2 border-black hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={cn(
              "volter-font border-2 border-black",
              variant === 'destructive' 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

