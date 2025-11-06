import React from 'react';
import { Notification } from '@/types/notification';
import { HabboToast } from './habbo-toast';

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

// Mapear tipos de notificação para variantes do HabboToast
const mapNotificationTypeToVariant = (type: Notification['type']): 'success' | 'error' | 'warning' | 'info' => {
  switch (type) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    case 'custom':
    default:
      return 'info';
  }
};

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
}) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
      {notifications.map((notification) => {
        const variant = mapNotificationTypeToVariant(notification.type);
        
        const handleClose = (open: boolean) => {
          if (!open) {
            onClose(notification.id);
            notification.onClose?.();
          }
        };

        return (
          <div key={notification.id} className="pointer-events-auto w-full">
            <HabboToast
              id={notification.id}
              title={notification.title}
              description={notification.message}
              variant={variant}
              open={true}
              onOpenChange={handleClose}
              duration={notification.duration || 5000}
            />
          </div>
        );
      })}
    </div>
  );
};