import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Pusher from 'pusher-js';
import apiService from '../services/apiService';
import { useAuth } from './AuthContext';

interface Notification {
  id: number;
  content: string;
  created_at: string;
}

interface NotificationContextProps {
  notifications: Notification[];
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

    // Fetch initial notifications from the API
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

    // Enable Pusher logging - don't include this in production
    Pusher.logToConsole = true;

    const pusher = new Pusher('087ae63043c8feb92728', {
      cluster: 'ap1',
      forceTLS: true, // Use forceTLS instead of useTLS or encrypted
    });

    const channel = pusher.subscribe('notifications');

    // Log subscription success or failure
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to the notifications channel');
    });

    channel.bind('pusher:subscription_error', (status: any) => {
      console.error('Subscription error:', status);
    });

    // Log when receiving a custom event
    channel.bind('new-notification', function (data: any) {
      console.log('New notification received:', data); // Log the received data
      setNotifications((prevNotifications) => [...prevNotifications, data.notification]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
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
