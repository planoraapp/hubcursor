export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'custom';
  title: string;
  message?: string;
  icon?: React.ReactNode;
  duration?: number; // em milissegundos, 0 = não remove automaticamente
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}
