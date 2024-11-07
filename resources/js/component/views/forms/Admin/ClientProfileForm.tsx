import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClientProfile } from '../../../context/ClientProfileContext';
import { useAuth } from '../../../context/AuthContext';
import { Avatar, Button, Typography, CircularProgress, Box } from '@mui/material';
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

  const images = profile.posts
    .flatMap(post => post.images.map(image => `http://127.0.0.1:8000/storage/${image.image_path}`));

  const isAllowedRole = profile?.role_name === 'Printing Shop' || profile?.role_name === 'Graphic Designer';

  // Check if the visited profile belongs to the authenticated user
  const canEditProfile = user?.id === userId;

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

        {/* About Me and Carousel Sections */}
        <Box display="flex" gap={4} mt={4}>
          {/* About Me Section */}
          {isAllowedRole && (
            <Box flex={1} p={2} bgcolor="white" borderRadius={2} boxShadow={2} className="shadow-lg">
              <Typography variant="h6" gutterBottom>About Me</Typography>
              <AboutMe />
            </Box>
          )}

          {/* Image Carousel Section */}
          <Box flex={1.5} className="shadow-lg rounded-lg p-2 bg-white">
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
        </Box>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal open={openEditModal} onClose={() => setOpenEditModal(false)} />
    </>
  );
};

export default ClientProfile;
