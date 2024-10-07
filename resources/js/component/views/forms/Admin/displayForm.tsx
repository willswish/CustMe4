import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaEdit, FaTrash, FaPaperPlane, FaComments } from 'react-icons/fa';
import Header from '../components/header';
import { Card, CardContent, CardActions, Typography, Button } from '@mui/material';
import { usePostContext } from '../../../context/PostContext';
import { useRequest } from '../../../context/RequestContext';

interface Image {
  image_id: number;
  image_path: string;
}

const DisplayForm: React.FC = () => {
  const { posts, fetchPosts, currentPage, totalPages, user, deletePost } = usePostContext();
  const { handleRequest } = useRequest();
  const [page, setPage] = useState(currentPage);
  const { userId } = useParams();
  const navigate = useNavigate();

  const fetchPostsCallback = useCallback(async (page: number, limit: number) => {
    await fetchPosts(page, limit);
  }, [fetchPosts]);

  useEffect(() => {
    fetchPostsCallback(page, 4);
  }, [page, fetchPostsCallback]);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages && pageNumber !== page) {
      setPage(pageNumber);
    }
  };

  const handleEdit = (postId: number, title: string, content: string, images: Image[]) => {
    navigate(`/posts/${postId}`, { state: { postId, title, content, images } });
  };

  const handleDelete = (postId: number) => {
    if (user) {
      deletePost(postId);
    }
  };

  const handleSendMessage = (userId: number) => {
    navigate(`/chat/${userId}`); // Redirect to chat page with the user's ID
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8 mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.post_id} className="shadow-lg" style={{ width: '300px', height: 'auto' }}>
                  {post.images.length > 0 ? (
                    <ImageCarousel images={post.images} />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                      <p className="text-gray-600">No Image Available</p>
                    </div>
                  )}
                  <CardContent>
                    <div className="flex items-center mb-2">
                      <img
                        src={'https://via.placeholder.com/40'}
                        alt="Profile"
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <div>
                        <Typography variant="body2" className="font-semibold">
                          {post.user?.username || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {post.user?.role?.rolename || 'N/A'}
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="h6" component="h2" className="font-bold">
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-2">
                      {post.content}
                    </Typography>
                  </CardContent>
                  <CardActions className="flex flex-row justify-between items-center">
                    {user && (
                      <div className="flex flex-row space-x-2">
                        {post.user_id !== user.id && (
                          <>
                            <Button
                              onClick={() => handleRequest(post.post_id, post.user_id)}
                              variant="outlined"
                              startIcon={<FaPaperPlane />}
                              size="small"
                              color="primary"
                            >
                              Request
                            </Button>
                            <Button
                              onClick={() => handleSendMessage(post.user_id)}
                              variant="outlined"
                              startIcon={<FaComments />}
                              color="primary"
                              size="small"
                            >
                              Chat
                            </Button>
                          </>
                        )}
                        {post.user_id === user.id && (
                          <>
                            <Button
                              onClick={() => handleEdit(post.post_id, post.title, post.content, post.images)}
                              variant="outlined"
                              startIcon={<FaEdit />}
                              size="small"
                              color="success"
                              className="mt-2"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(post.post_id)}
                              variant="outlined"
                              startIcon={<FaTrash />}
                              size="small"
                              color="error"
                              className="mt-2"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardActions>
                </Card>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary">
                No posts available.
              </Typography>
            )}
          </div>

          <div className="flex justify-center mt-8">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              variant="outlined"
              className="mx-1"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, index) => (
              <Button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                variant={page === index + 1 ? 'contained' : 'outlined'}
                color={page === index + 1 ? 'primary' : 'inherit'}
                className="mx-1"
              >
                {index + 1}
              </Button>
            ))}
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              variant="outlined"
              className="mx-1"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageCarousel: React.FC<{ images: Image[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="relative w-full h-48">
      <button
        onClick={prevImage}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-2 py-1 rounded-full focus:outline-none hover:bg-gray-800"
      >
        &#8249;
      </button>
      <img
        src={`http://127.0.0.1:8000/storage/${images[currentIndex].image_path}`}
        alt={`Post Image ${images[currentIndex].image_id}`}
        className="w-full h-full object-cover"
      />
      <button
        onClick={nextImage}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-2 py-1 rounded-full focus:outline-none hover:bg-gray-800"
      >
        &#8250;
      </button>
    </div>
  );
};

export default DisplayForm;
