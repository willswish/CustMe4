import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';

interface RequestContextProps {
  handleRequest: (postId: number, postUserId: number) => Promise<void>;
}

const RequestContext = createContext<RequestContextProps | undefined>(undefined);

interface RequestProviderProps {
  children: ReactNode;
}

export const RequestProvider: React.FC<RequestProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const handleRequest = async (postId: number, postUserId: number) => {
    if (user) {
      try {
        await apiService.post('/requests', {
          user_id: user.id,
          target_user_id: postUserId,
          post_id: postId,
          content: `User ${user.username} has requested for your product.`,
        });
      } catch (error) {
        console.error('Failed to send request', error);
      }
    } else {
      console.error('User not authenticated');
    }
  };

  return (
    <RequestContext.Provider value={{ handleRequest }}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequest = (): RequestContextProps => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequest must be used within a RequestProvider');
  }
  return context;
};
