import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Pusher from 'pusher-js';
import apiService from '../services/apiService';
import { useAuth } from './AuthContext';

interface Notification {
  id: number;
  request_id: number;
  content: string;
  created_at: string;
  status: string;
  user_id: number;
  target_user_id: number;
  price: string;
  duration_days: number;
  duration_minutes: number;
  request_content: string;
}

interface NotificationContextProps {
  notifications: Notification[];
  acceptNotification: (id: number) => Promise<void>;
  declineNotification: (id: number) => Promise<void>;
  selectedNotification: Notification | null;
  setSelectedNotification: (id: number | null) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotificationData] = useState<Notification | null>(null);

  useEffect(() => {
    if (!user) {
      console.log('User not logged in, skipping notification fetch.');
      return;
    }

    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications...');
        const response = await apiService.get('/notifications', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        console.log('Response from /notifications:', response.data);

        if (response.data && response.data.notifications) {
          console.log('Notifications data:', response.data.notifications);
          setNotifications(response.data.notifications);
        } else {
          console.warn('No notifications found in response.');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    const pusher = new Pusher('087ae63043c8feb92728', {
      cluster: 'ap1',
      forceTLS: true,
    });

    const channel = pusher.subscribe('notifications');

    channel.bind('new-notification', (data: any) => {
      console.log('New notification received:', data.notification);
      setNotifications((prevNotifications) => [...prevNotifications, data.notification]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [user]);

  const acceptNotification = async (requestId: number) => {
    try {
      const response = await apiService.post(`/notifications/${requestId}/accept`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
  
      const updatedNotification = response.data.notification;
  
      // Update the notifications state with the accepted status and timing data
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.request_id === requestId ? { ...notification, ...updatedNotification } : notification
        )
      );
    } catch (error) {
      console.error('Error accepting notification:', error);
    }
  };
  

  const declineNotification = async (requestId: number) => {
    try {
      await apiService.post(`/notifications/${requestId}/decline`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      console.log(`Notification ${requestId} declined.`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.request_id === requestId ? { ...notification, status: 'declined' } : notification
        )
      );
    } catch (error) {
      console.error('Error declining notification:', error);
    }
  };

  const setSelectedNotification = (id: number | null) => {
    const notification = notifications.find((n) => n.request_id === id) || null;
    console.log('Setting selected notification:', notification);
    setSelectedNotificationData(notification);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        acceptNotification,
        declineNotification,
        selectedNotification,
        setSelectedNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
