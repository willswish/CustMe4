import React, { useState } from 'react';
import Header from '../components/header';
import { useAuth } from '../../../context/AuthContext';
import { usePostContext } from '../../../context/PostContext'; // Import usePostContext
import apiService from '../../../services/apiService';


const CreatePostForm: React.FC = () => {
  const { user } = useAuth();
  const { addPost } = usePostContext(); // Get addPost from context
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validImages = Array.from(files).filter((file): file is File =>
        ['image/jpeg', 'image/png', 'image/gif'].includes(file.type) && file.size <= 2048 * 1024
      );
      
      setImages(prevImages => [...prevImages, ...validImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if title and content are not empty
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    images.forEach(image => {
      formData.append('images[]', image);
    });

    try {
      const response = await apiService.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setSuccess('Post created successfully');
        setTitle('');
        setContent('');
        setImages([]);
        setError('');
        addPost(response.data); // Update context with the new post
      } else {
        setError('Failed to create post');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while creating the post');
      setSuccess('');
    }
  };

  return (
    <div className="flex bg-white min-h-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
                  placeholder="Title"
                  value={title}
                  onChange={handleTitleChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
                  placeholder={`What's on your mind, ${user ? user.username : 'User'}?`}
                  value={content}
                  onChange={handleContentChange}
                />
              </div>
              <div>
                <input
                  type="file"
                  className="hidden"
                  id="imageUpload"
                  multiple
                  onChange={handleImageChange}
                />
                <label htmlFor="imageUpload" className="cursor-pointer text-blue-500">Add images to your post</label>
                <div className="mt-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative inline-block mr-2 mb-2">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className="w-32 h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring"
              >
                Post
              </button>
              {success && <p className="text-green-500 mt-2">{success}</p>}
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
