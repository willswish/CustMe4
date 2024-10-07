import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import apiService from '../services/apiService';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAuth } from './AuthContext';

export interface ChatUser {
  id: number;
  username: string;
  avatar: string;
  online: boolean;
}

export interface Chat {
  id: number;
  content: string;
  file_path?: string;
  sender_id: number;
  receiver_id: number;
  user: ChatUser;
  receiver?: ChatUser;
}

interface ChatContextProps {
  chats: Chat[];
  sendMessage: (content: string, recipientId: number, file?: File) => Promise<void>;
  fetchChats: () => Promise<void>;
  fetchUserChatList: () => Promise<void>;
  firstChatId: number | null;
  userChatList: ChatUser[];
  selectedUserId: number | null;
  setSelectedUserId: (id: number | null) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [firstChatId, setFirstChatId] = useState<number | null>(null);
  const [userChatList, setUserChatList] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const newMessageRef = useRef<boolean>(false);

  const authToken = localStorage.getItem('authToken'); // Retrieve authToken from localStorage

  const fetchChats = async () => {
    if (!user) return;
    console.log("Fetching chats...");
    const startFetchTime = performance.now();
    try {
      const response = await apiService.get('/chats', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setChats(response.data || []);
      if (response.data.length > 0) {
        setFirstChatId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching chats', error);
      setError("Failed to fetch chats.");
    } finally {
      const endFetchTime = performance.now();
      console.log("Chats fetched in:", endFetchTime - startFetchTime, "ms");
    }
  };

  const fetchUserChatList = async () => {
    if (!user) return;
    console.log("Fetching user chat list...");
    const startFetchTime = performance.now();
    try {
      const response = await apiService.get('/user-chat-list', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUserChatList(response.data || []);
    } catch (error) {
      console.error('Error fetching user chat list', error);
      setError("Failed to fetch user chat list.");
    } finally {
      const endFetchTime = performance.now();
      console.log("User chat list fetched in:", endFetchTime - startFetchTime, "ms");
    }
  };

  const sendMessage = async (content: string, recipientId: number, file?: File) => {
    if (!user) {
      console.error('User is not authenticated.');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('receiver_id', recipientId.toString());
    if (file) formData.append('file', file);

    try {
      const response = await apiService.post('/send-message', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${authToken}`,
        },
      });

      setChats((prevChats) => [...prevChats, response.data]);
      newMessageRef.current = true;
      await fetchChats();
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  useEffect(() => {
    fetchUserChatList();
    fetchChats();

    window.Pusher = Pusher;
    const echo = new Echo({
      broadcaster: 'pusher',
      key: '087ae63043c8feb92728',
      cluster: 'ap1',
      forceTLS: true,
      authEndpoint: '/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    });
    console.log("Authenticated user:", user); // Check if user is authenticate
    if (user?.id) {
      echo.private(`private-chat.${user.id}`)
        .listen('.message-sent', (data: any) => {
          console.log('Message received:', data);
          setChats((prevChats) => [...prevChats, data]);
        })
        .error((error: any) => {
          console.error('Error connecting to Pusher:', error);
        });
    }

    return () => {
      echo.disconnect();
    };
  }, [user]);

  return (
    <ChatContext.Provider
      value={{ chats, sendMessage, fetchChats, fetchUserChatList, firstChatId, userChatList, selectedUserId, setSelectedUserId }}
    >
      {children}
      {error && <div className="error-message">{error}</div>}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
