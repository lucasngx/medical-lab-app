import { useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    ({ type, title, message }: Omit<Notification, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const notification: Notification = {
        id,
        type,
        title,
        message,
      };

      setNotifications((prev) => [...prev, notification]);

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
}