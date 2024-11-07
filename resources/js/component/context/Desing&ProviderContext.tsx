import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import apiService from '../services/apiService';
import { useAuth, User } from '../context/AuthContext';

interface Image {
  image_id: number;
  image_path: string;
}

interface Post {
  post_id: number;
  title: string;
  content: string;
  user_id: number;
  images: Image[];
  price: string;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    role: {
      rolename: string;
    };
  };
}

interface DesignerProviderContextType {
  
  fetchDesignerPosts: (page: number, limit: number) => Promise<Post[]>;
  fetchProviderPosts: (page: number, limit: number) => Promise<Post[]>;
  user: User | null;
}

const DesignerProviderContext = createContext<DesignerProviderContextType | undefined>(undefined);

export const DesignerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const fetchDesignerPosts = useCallback(async (page: number, limit: number) => {
    try {
      const response = await apiService.get<{ posts: Post[], total: number, last_page: number }>(
        `/designerposts?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
  
      const fetchedPosts = response.data.posts.map((post) => ({
        ...post,
        images: post.images || [],
        user: post.user || { username: 'Unknown', role: { rolename: 'N/A' } },
      }));
  
      return fetchedPosts;
    } catch (error) {
      console.error('Error fetching designer posts:', error);
      return [];
    }
  }, []);
  
  const fetchProviderPosts = useCallback(async (page: number, limit: number) => {
    try {
      const response = await apiService.get<{ posts: Post[], total: number, last_page: number }>(
        `/providerposts?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
  
      const fetchedPosts = response.data.posts.map((post) => ({
        ...post,
        images: post.images || [],
        user: post.user || { username: 'Unknown', role: { rolename: 'N/A' } },
      }));
  
      return fetchedPosts;
    } catch (error) {
      console.error('Error fetching provider posts:', error);
      return [];
    }
  }, []);
  

  return (
    <DesignerProviderContext.Provider value={{ fetchDesignerPosts, fetchProviderPosts, user }}>
      {children}
    </DesignerProviderContext.Provider>
  );
};

export const useDesignerProviderContext = () => {
  const context = useContext(DesignerProviderContext);
  if (!context) {
    throw new Error('useDesignerProviderContext must be used within a DesignerProvider');
  }
  return context;
};
