import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Pusher from 'pusher-js';
import apiService from '../services/apiService';
import { useAuth } from './AuthContext';

interface Notification {
  id: number; // Notification ID
  request_id: number; // Corresponding request ID
  content: string;
  created_at: string;
  status: string; // 'pending', 'accepted', or 'declined'
  user_id: number;
  target_user_id: number;
}

interface NotificationContextProps {
  notifications: Notification[];
  acceptNotification: (id: number) => Promise<void>;
  declineNotification: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await apiService.get('/notifications', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setNotifications(response.data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    Pusher.logToConsole = true;

    const pusher = new Pusher('087ae63043c8feb92728', {
      cluster: 'ap1',
      forceTLS: true,
    });

    const channel = pusher.subscribe('notifications');

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to the notifications channel');
    });

    channel.bind('new-notification', (data: any) => {
      console.log('New notification received:', data);
      setNotifications((prevNotifications) => [...prevNotifications, data.notification]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [user]);

  const acceptNotification = async (requestId: number) => {
    try {
      await apiService.post(`/notifications/${requestId}/accept`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      // Update the status of the notification
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.request_id === requestId ? { ...notification, status: 'accepted' } : notification
        )
      );
    } catch (error) {
      console.error('Error accepting notification:', error.response ? error.response.data : error.message);
    }
  };

  const declineNotification = async (requestId: number) => {
    try {
      await apiService.post(`/notifications/${requestId}/decline`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      // Update the status of the notification
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.request_id === requestId ? { ...notification, status: 'declined' } : notification
        )
      );
    } catch (error) {
      console.error('Error declining notification:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, acceptNotification, declineNotification }}>
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
