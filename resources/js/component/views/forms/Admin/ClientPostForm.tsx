import React, { useEffect, useState } from 'react';
import { Typography, Button, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { usePostContext } from '../../../context/PostContext'; // Assuming your context path is correct
import Header from '../components/header';

const PostCard = ({ post }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // For tracking current image index

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Navigate to the previous image
  const handlePrevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : post.images.length - 1));
  };

  // Navigate to the next image
  const handleNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex < post.images.length - 1 ? prevIndex + 1 : 0));
  };

  return (
    <>
    <Header/>
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
          <MenuItem onClick={handleMenuClose}>Option 1</MenuItem>
          <MenuItem onClick={handleMenuClose}>Option 2</MenuItem>
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
          {/* Image navigation controls */}
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

      <Button variant="contained" color="warning" className="w-full">
        Interested
      </Button>
    </div>
    </>
   
  );
};

const ClientPost = () => {
  const { posts, fetchClientPosts } = usePostContext();

  useEffect(() => {
    fetchClientPosts(1, 10); // Fetching the first 10 client posts when component mounts
  }, [fetchClientPosts]);

  return (
    <div className="ml-48 mt-16 p-8 flex justify-center">
      <Header />
      <div className="w-full max-w-xl">
        <Typography variant="h5" className="mb-6">Clients Post</Typography>
        {posts.length > 0 ? (
           posts
           .filter(post => post.user.role.rolename === 'User') // Ensure you're displaying only client posts
           .map(post => (
            <PostCard key={post.post_id} post={post} />
          ))
        ) : (
          <Typography>No client posts available</Typography>
        )}
      </div>
    </div>
  );
};

export default ClientPost;
