import React, { useEffect, useState } from 'react';
import { Typography, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePostContext } from '../../../context/PostContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth for user context
import Header from '../components/header';

const UserHomeForm = () => {
  const { posts, fetchMyPosts, deletePost } = usePostContext();
  const { user } = useAuth(); // Access the authenticated user
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPosts(1, 10); // Fetch the first 10 posts on mount
  }, [fetchMyPosts]);

  // Filter posts to include only those created by the authenticated user
  const userPosts = posts.filter(post => post.user_id === user?.id);

  const handleEdit = (postId: number, title: string, content: string, images, price: number | null, quantity: number | null) => {
    navigate(`/posts/${postId}`, { state: { postId, title, content, images, price, quantity } });
};

  const handleDelete = (postId: number) => {
    if (user) {
      deletePost(postId);
    }
  };

  const PostCard = ({ post }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handlePrevImage = () => {
      setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : post.images.length - 1));
    };

    const handleNextImage = () => {
      setCurrentIndex((prevIndex) => (prevIndex < post.images.length - 1 ? prevIndex + 1 : 0));
    };

    return (
      <div className="bg-white p-4 mb-4 rounded-md shadow-md max-w-md">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Avatar alt={post.user.username} src={post.user.avatar || '/static/images/avatar/1.jpg'} sx={{ width: 40, height: 40 }} />
            <div className="ml-3">
              <Typography variant="body1" className="font-bold">{post.user.username}</Typography>
              <Typography variant="body2" className="text-gray-500">{new Date(post.created_at).toLocaleDateString()}</Typography>
            </div>
          </div>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleEdit(post.post_id, post.title, post.content, post.images, post.price, post.quantity)}>Edit</MenuItem>
            <MenuItem onClick={() => handleDelete(post.post_id)}>Delete</MenuItem>
          </Menu>
        </div>

        <Typography variant="body1" className="mb-4">
          {post.content}
        </Typography>

        {post.images.length > 0 && (
          <div className="relative mb-4">
            <img
              src={`http://127.0.0.1:8000/storage/${post.images[currentIndex].image_path}`}
              alt={`Post Image ${post.images[currentIndex].image_id}`}
              className="w-full h-auto rounded-md"
            />
            {post.images.length > 1 && (
              <div className="absolute top-1/2 left-0 right-0 flex justify-between px-2 transform -translate-y-1/2">
                <IconButton onClick={handlePrevImage}>
                  <ArrowBackIcon />
                </IconButton>
                <IconButton onClick={handleNextImage}>
                  <ArrowForwardIcon />
                </IconButton>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ml-48 mt-16 p-8 flex justify-center">
      <Header />
      <div className="w-full max-w-xl">
        <Typography variant="h5" className="mb-6">My Posts</Typography>
        {userPosts.length > 0 ? (
          userPosts.map(post => (
            <PostCard key={post.post_id} post={post} />
          ))
        ) : (
          <Typography>No posts available</Typography>
        )}
      </div>
    </div>
  );
};

export default UserHomeForm;
