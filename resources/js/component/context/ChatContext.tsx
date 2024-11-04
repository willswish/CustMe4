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

  const authToken = localStorage.getItem('authToken');

  const fetchChats = async () => {
    if (!user) return;
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
      setError("Failed to fetch chats.");
    }
  };

  const fetchUserChatList = async () => {
    if (!user) return;
    try {
      const response = await apiService.get('/user-chat-list', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUserChatList(response.data || []);
    } catch (error) {
      setError("Failed to fetch user chat list.");
    }
  };

  const sendMessage = async (content: string, recipientId: number, file?: File) => {
    if (!user) return;

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
      // Handle the error as necessary
    }
  };

  useEffect(() => {
    fetchUserChatList();
    fetchChats();
    const API_BASE_URL = (window as any).env.API_BASE_URL;
    const pusher = new Pusher('087ae63043c8feb92728', {
      cluster: 'ap1',
      forceTLS: true,
    });

    const echo = new Echo({
      broadcaster: 'pusher',
      client: pusher,
      authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    });

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
      pusher.disconnect(); // Disconnect Pusher on cleanup
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
