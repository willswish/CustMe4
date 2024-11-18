import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClientProfile } from '../../../context/ClientProfileContext';
import { useAuth } from '../../../context/AuthContext';
import {
  Avatar,
  Button,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import Header from '../components/header';
import EditProfileModal from '../../forms/EditProfileForm';
import Carousel from 'react-material-ui-carousel';
import AboutMe from '../../forms/Admin/AboutMe';

const ClientProfile = () => {
  const { id } = useParams<{ id: string | undefined }>();
  const userId = id ? parseInt(id) : undefined;
  const { profile, fetchProfile, loading } = useClientProfile();
  const { user } = useAuth(); // Get authenticated user data
  const [openEditModal, setOpenEditModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId).catch((error) => {
        console.error("Error fetching profile:", error);
      });
    }
  }, [fetchProfile, userId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!profile) {
    return <Typography variant="body1">No profile found</Typography>;
  }

  const coverPhoto = profile.personal_information?.coverphoto
    ? `http://127.0.0.1:8000/storage/${profile.personal_information.coverphoto}`
    : 'default-cover-image-url';

  const profilePicture = profile.personal_information?.profilepicture
    ? `http://127.0.0.1:8000/storage/${profile.personal_information.profilepicture}`
    : 'default-profile-image-url';

  const images = profile.posts?.flatMap(post => 
    post.images.map(image => `http://127.0.0.1:8000/storage/${image.image_path}`)
  ) || [];

  const isAllowedRole = ['Printing Shop', 'Graphic Designer'].includes(profile?.role_name);
  const canEditProfile = user?.id === userId;
  const isUserRole = profile?.role_name === 'User';

  return (
    <>
      <Header />
      <div className="ml-48 mt-16 p-8 bg-gray-50">
        {/* Profile Section */}
        <Box className="relative mb-6 bg-white shadow-lg rounded-lg p-4">
          <div className="relative h-72 w-full mb-4">
            <img
              src={coverPhoto}
              alt="Cover"
              className="object-cover w-full h-full rounded-t-lg"
            />
          </div>
          <div className="absolute left-3 -bottom-14 flex items-center">
            <Avatar
              alt={`${profile.personal_information?.firstname} ${profile.personal_information?.lastname}`}
              src={profilePicture}
              sx={{ width: 120, height: 120, border: '3px solid white' }}
              className="shadow-lg"
            />
          </div>
          <div className="mt-16 ml-32">
            <Typography variant="h5" className="font-bold">
              {`${profile.personal_information?.firstname || ''} ${profile.personal_information?.lastname || ''}`}
            </Typography>
            <Typography variant="body1" className="mt-1">
              Phone Number: {profile.personal_information?.zipcode || 'N/A'}
            </Typography>
            {canEditProfile && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                color="primary"
                onClick={() => setOpenEditModal(true)}
                className="mt-2"
              >
                Edit profile
              </Button>
            )}
          </div>
        </Box>

        {/* Flexbox layout for About Me and Image Carousel */}
        <Box display="flex" justifyContent="space-between" className="mb-6">
          {/* About Me Section */}
          {isAllowedRole && (
            <Box flex={1} mr={2} className="shadow-lg rounded-lg p-4 bg-white">
              <Typography variant="h6" gutterBottom>About Me</Typography>
              <AboutMe />
            </Box>
          )}

          {/* Image Carousel Section */}
          {isAllowedRole && (
            <Box flex={1} className="shadow-lg rounded-lg p-2 bg-white">
              <Typography variant="h6" gutterBottom>Image Gallery</Typography>
              <Carousel>
                {images.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Image ${index}`}
                    className="w-full h-48 object-cover rounded-md"
                  />
                ))}
              </Carousel>
            </Box>
          )}
        </Box>

        {/* User Posts Section */}
        {isUserRole && profile.posts?.length > 0 && (
          <div className="shadow-lg rounded-lg p-4">
            <Typography variant="h6" gutterBottom>Posts</Typography>
            <Grid container spacing={2}>
              {profile.posts.map((post) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={post.post_id}>
                  <Card className="shadow-md">
                    <CardMedia
                      component="img"
                      height="180"
                      image={
                        post.images.length > 0
                          ? `http://127.0.0.1:8000/storage/${post.images[0].image_path}`
                          : 'default-image-url'
                      }
                      alt={post.title || 'Post image'}
                      className="object-cover rounded-t-md"
                    />
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        noWrap
                        className="overflow-hidden"
                      >
                        {post.title || 'Untitled'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        className="truncate"
                      >
                        {post.content}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        )}
      </div>
      {/* Edit Profile Modal */}
      <EditProfileModal open={openEditModal} onClose={() => setOpenEditModal(false)} />
    </>
  );
};

export default ClientProfile;