import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClientProfile } from '../../../context/ClientProfileContext';
import { Avatar, Button, Typography, CircularProgress, Box, Modal, Paper } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import Header from '../components/header';
import EditProfileModal from '../../forms/EditProfileForm';
import Carousel from 'react-material-ui-carousel';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ClientProfile = () => {
  const { id } = useParams<{ id: string | undefined }>();
  const userId = id ? parseInt(id) : undefined;
  const { profile, fetchProfile, loading } = useClientProfile();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false); // Modal state for the map

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
    : 'default-cover-image-url'; // Replace with your default cover image URL

  const profilePicture = profile.personal_information?.profilepicture
    ? `http://127.0.0.1:8000/storage/${profile.personal_information.profilepicture}`
    : 'default-profile-image-url'; // Replace with your default profile image URL

  // Aggregate all images from posts for the carousel
  const images = profile.posts
    .flatMap(post => post.images.map(image => `http://127.0.0.1:8000/storage/${image.image_path}`));

  // Get the position for the map from profile's store location
  const position: [number, number] | null = profile.stores[0]?.location
    ? [parseFloat(profile.stores[0].location.latitude), parseFloat(profile.stores[0].location.longitude)]
    : null;

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
        <div className="flex items-center mb-4" style={{ marginLeft: '140px', marginTop: '-16px' }}>
          <Typography variant="h5" className="font-bold">{`${profile.personal_information?.firstname || ''} ${profile.personal_information?.lastname || ''}`}</Typography>
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
        </div>

        {/* Conditional UI for "Printing Shop" Role */}
        {profile.role.rolename === 'Printing Shop' && (
          <Box display="flex" gap={4} mt={8}>
            {/* Store Information and Map Button */}
            {profile.stores.length > 0 && (
              <Paper
                elevation={3}
                sx={{
                  padding: 3,
                  flex: '1',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  bgcolor: '#f9f9f9',
                  maxWidth: '300px',
                }}
              >
                <Typography variant="h6" gutterBottom>Store Information</Typography>
                <Typography variant="body1"><strong>Store Name:</strong> {profile.stores[0].storename}</Typography>
                <Typography variant="body2"><strong>Description:</strong> {profile.stores[0].description}</Typography>
                <Typography variant="body2"><strong>Location ID:</strong> {profile.stores[0].location_id}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setMapModalOpen(true)}
                  className="mt-4"
                >
                  View Map
                </Button>
              </Paper>
            )}

            {/* Image Carousel Section */}
            <Box className="relative bg-white shadow-lg rounded-lg overflow-hidden" flex="2">
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
        )}

        {/* Posts Section - Only visible if role is "User" */}
        {profile.role.rolename === 'User' && (
          <div className="mt-8">
            <Typography variant="h6" className="mb-4">Client's Posts</Typography>
            {profile.posts.length > 0 ? (
              profile.posts.map((post) => (
                <div key={post.post_id} className="bg-white p-4 mb-4 rounded-md shadow-md max-w-md">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Avatar
                        alt={`${profile.personal_information?.firstname} ${profile.personal_information?.lastname}`}
                        src={profilePicture}
                        sx={{ width: 40, height: 40 }}
                      />
                      <div className="ml-3">
                        <Typography variant="body1" className="font-bold">{`${profile.personal_information?.firstname || ''} ${profile.personal_information?.lastname || ''}`}</Typography>
                        <Typography variant="body2" className="text-gray-500">{new Date(post.created_at).toLocaleDateString()}</Typography>
                      </div>
                    </div>
                  </div>

                  <Typography variant="body1" className="mb-4">
                    {post.content}
                  </Typography>

                  {post.images.length > 0 && (
                    <div className="relative mb-4">
                      <img
                        src={`http://127.0.0.1:8000/storage/${post.images[0].image_path}`}
                        alt={`Post Image ${post.images[0].image_id}`}
                        className="w-full h-auto rounded-md"
                      />
                    </div>
                  )}

                  <Button variant="contained" color="warning" className="w-full">
                    Interested
                  </Button>
                </div>
              ))
            ) : (
              <Typography>No posts available</Typography>
            )}
          </div>
        )}
      </div>

      {/* Map Modal */}
      <Modal open={mapModalOpen} onClose={() => setMapModalOpen(false)}>
        <Box
          className="bg-white p-4 rounded-lg shadow-lg absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '600px',
          }}
        >
          <Typography variant="h6" className="mb-4">Store Location</Typography>
          {position && (
            <MapContainer center={position} zoom={13} style={{ height: '300px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={position} />
            </MapContainer>
          )}
          <Button
            onClick={() => setMapModalOpen(false)}
            variant="outlined"
            color="secondary"
            className="mt-4"
          >
            Close
          </Button>
        </Box>
      </Modal>

      {/* Edit Profile Modal */}
      <EditProfileModal open={openEditModal} onClose={() => setOpenEditModal(false)} />
    </>
  );
};

export default ClientProfile;
