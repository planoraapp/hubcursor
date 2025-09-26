import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const getNotificationIcon = (type: Notification['type'], customIcon?: React.ReactNode) => {
  if (customIcon) return customIcon;
  
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-500" />;
    case 'custom':
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getNotificationStyles = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-900';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-900';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-900';
    case 'custom':
    default:
      return 'bg-gray-50 border-gray-200 text-gray-900';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
}) => {
  const handleClose = () => {
    onClose(notification.id);
    notification.onClose?.();
  };

  const handleAction = () => {
    notification.action?.onClick();
  };

  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'min-w-[300px] max-w-[500px] animate-in slide-in-from-top-2 duration-300',
        getNotificationStyles(notification.type)
      )}
    >
      {/* Ícone */}
      <div className="flex-shrink-0">
        {getNotificationIcon(notification.type, notification.icon)}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">
          {notification.title}
        </div>
        {notification.message && (
          <div className="text-xs opacity-90 mt-1 line-clamp-2">
            {notification.message}
          </div>
        )}
      </div>

      {/* Ação (se disponível) */}
      {notification.action && (
        <button
          onClick={handleAction}
          className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-md bg-white/50 hover:bg-white/70 transition-colors"
        >
          {notification.action.label}
        </button>
      )}

      {/* Botão de fechar */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="relative">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * 80}px)`,
            }}
          >
            <NotificationItem
              notification={notification}
              onClose={onClose}
            />
          </div>
        ))}
      </div>
    </div>
  );
};