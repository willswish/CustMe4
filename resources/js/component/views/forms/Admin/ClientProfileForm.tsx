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
        <div className="relative mb-6">
          <div className="relative h-72 w-full">
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
        </div>
        
        {/* Edit Profile Button */}
        <div className="flex items-center mb-4" style={{ marginLeft: '140px', marginTop: '-16px' }}>
          <Typography variant="h5" className="font-bold">{`${profile.personal_information?.firstname || ''} ${profile.personal_information?.lastname || ''}`}</Typography>
          {canEditProfile && (
            <div className="ml-auto mr-8">
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                color="primary"
                onClick={() => setOpenEditModal(true)}
              >
                Edit profile
              </Button>
            </div>
          )}
        </div>

        {/* Side-by-side layout for AboutMe and Image Carousel */}
        <Box display="flex" gap={4} mt={8}>
          {/* About Me Section */}
          {isAllowedRole && (
            <Box flex={1} p={2} bgcolor="white" borderRadius={2} boxShadow={2}>
              <AboutMe />
            </Box>
          )}

          {/* Image Carousel Section */}
          <Box flex={2} className="relative bg-white shadow-lg rounded-lg overflow-hidden">
            <Carousel>
              {images.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Image ${index}`}
                  className="w-full h-48 object-cover"
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
