import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiService from '../services/apiService';
import { useAuth, User } from '../../../js/component/context/AuthContext';

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
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    role: {
      rolename: string;
    };
  };
}

interface PostContextType {
  posts: Post[];
  fetchPosts: (page: number, limit: number) => void;
  addPost: (newPost: Post) => void;
  updatePost: (updatedPost: Post) => void;
  deletePost: (postId: number) => void;
  user: User | null;
  currentPage: number;
  totalPosts: number;
  totalPages: number;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const { user } = useAuth();
  const postsPerPage = 4;

  const fetchPosts = useCallback(async (page: number, limit: number) => {
    try {
      const response = await apiService.get<{ data: Post[], total: number, last_page: number }>(`/allposts?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const fetchedPosts = response.data.data.map((post) => ({
        ...post,
        images: post.images || [],
        user: post.user || { username: 'Unknown', role: { rolename: 'N/A' } },
      }));
      setPosts(fetchedPosts);
      setTotalPosts(response.data.total);
      setTotalPages(response.data.last_page);
      setCurrentPage(page);
    } catch (error) {
      console.log('Error fetching posts:', error);
    }
  }, []);

  const addPost = useCallback((newPost: Post) => {
    setPosts((prevPosts) => [{ ...newPost, images: newPost.images || [] }, ...prevPosts]);
  }, []);

  const updatePost = useCallback(async (updatedPost: Post) => {
    try {
      const response = await apiService.put(`/posts/${updatedPost.post_id}`, updatedPost, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.status === 200) {
        setPosts((prevPosts) => prevPosts.map(post => post.post_id === updatedPost.post_id ? updatedPost : post));
      }
    } catch (error) {
      console.log('Error updating post:', error);
    }
  }, []);

  const deletePost = useCallback(async (postId: number) => {
    try {
      await apiService.delete(`/delete-posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setPosts((prevPosts) => prevPosts.filter((post) => post.post_id !== postId));
    } catch (error) {
      console.log('Error deleting post:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts(currentPage, postsPerPage);
    }
  }, [user, currentPage, fetchPosts]);

  return (
    <PostContext.Provider value={{ posts, fetchPosts, addPost, updatePost, deletePost, user, currentPage, totalPosts, totalPages }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  return context;
};
