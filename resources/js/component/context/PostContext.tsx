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
  fetchPosts: (page: number, limit: number, type?: string) => void;
  addPost: (newPost: Post) => void;
  updatePost: (updatedPost: Post) => void;
  deletePost: (postId: number) => void;
  getUserImages: () => Promise<Image[]>;
  user: User | null;
  currentPage: number;
  totalPosts: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]); // Ensure posts is an empty array initially
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const postsPerPage = 4;

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const fetchPosts = useCallback(
    async (page: number, limit: number, type: string = 'allposts') => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.get<{ posts: Post[], totalPosts: number }>(
          `/${type}?page=${page}&limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          }
        );

        const fetchedPosts = response.data.posts ? response.data.posts.map((post) => ({
          ...post,
          images: post.images || [],
          user: post.user || { username: 'Unknown', role: { rolename: 'N/A' } },
        })) : [];

        setPosts(fetchedPosts);
        setTotalPosts(response.data.totalPosts || 0); // Ensure totalPosts exists
        setTotalPages(Math.ceil((response.data.totalPosts || 0) / postsPerPage)); // Ensure valid totalPages
        setCurrentPage(page);
      } catch (err: any) {
        setError(`Error fetching posts: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    },
    [postsPerPage]
  );

  const addPost = useCallback((newPost: Post) => {
    setPosts((prevPosts) => [{ ...newPost, images: newPost.images || [] }, ...prevPosts]);
  }, []);

  const updatePost = useCallback(async (updatedPost: Post) => {
    try {
      const response = await apiService.put(`/posts/${updatedPost.post_id}`, updatedPost, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      if (response.status === 200) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === updatedPost.post_id ? updatedPost : post
          )
        );
      }
    } catch (err: any) {
      setError(`Error updating post: ${err.message || 'Unknown error'}`);
    }
  }, []);

  const deletePost = useCallback(async (postId: number) => {
    try {
      await apiService.delete(`/delete-posts/${postId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setPosts((prevPosts) => prevPosts.filter((post) => post.post_id !== postId));
    } catch (err: any) {
      setError(`Error deleting post: ${err.message || 'Unknown error'}`);
    }
  }, []);

  const getUserImages = useCallback(async () => {
    try {
      if (user) {
        const response = await apiService.get(`/users/${user.id}/images`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        return response.data.images || [];
      }
      return [];
    } catch (err: any) {
      setError(`Error fetching user images: ${err.message || 'Unknown error'}`);
      return [];
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchPosts(currentPage, postsPerPage); // Fetch posts when the user is available
  }, [user, currentPage, fetchPosts]);

  return (
    <PostContext.Provider
      value={{
        posts,
        fetchPosts,
        addPost,
        updatePost,
        deletePost,
        getUserImages,
        user,
        currentPage,
        totalPosts,
        totalPages,
        isLoading,
        error,
      }}
    >
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
