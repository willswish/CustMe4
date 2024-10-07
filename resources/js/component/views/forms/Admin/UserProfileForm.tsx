import React, { useEffect, useState } from 'react';
import Header from '../components/header';
import { useUserProfile } from '../../../context/UserProfileContext';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import apiService from '../../../services/apiService';

const UserProfileForm: React.FC = () => {
  const { userProfile, fetchUserProfile } = useUserProfile();
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [newCoverPhoto, setNewCoverPhoto] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        await fetchUserProfile();
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userProfile) {
      setFirstname(userProfile.personalInformation?.firstname || '');
      setLastname(userProfile.personalInformation?.lastname || '');
      setProfilePicture(userProfile.personalInformation?.profilepicture || null);
      setCoverPhoto(userProfile.personalInformation?.coverphoto || null);
    }
  }, [userProfile]);

  const handleEditToggle = () => {
    if (isEditing) {
      const formData = new FormData();
      formData.append('firstname', firstname);
      formData.append('lastname', lastname);
      formData.append('_method', 'PUT');

      if (newProfilePicture) {
        formData.append('profilepicture', newProfilePicture);
      }

      if (newCoverPhoto) {
        formData.append('coverphoto', newCoverPhoto);
      }

      apiService.post(`/users/${userProfile?.id}/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(() => {
          fetchUserProfile();
          setNewProfilePicture(null);
          setNewCoverPhoto(null);
        })
        .catch((error) => {
          console.error('Error updating profile:', error);
        });
    }
    setIsEditing(!isEditing);
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setNewProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleCoverPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setNewCoverPhoto(file);
      setCoverPhotoPreview(URL.createObjectURL(file));
    }
  };

  const personalInformation = userProfile?.personalInformation;
  const coverPhotoUrl = coverPhotoPreview || (coverPhoto ? `http://127.0.0.1:8000/storage/${coverPhoto}` : null);
  const profilePictureUrl = profilePicturePreview || (profilePicture ? `http://127.0.0.1:8000/storage/${profilePicture}` : null);
  const placeholderImageUrl = 'https://static.vecteezy.com/system/resources/previews/004/141/669/original/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';

  const location = userProfile?.location;
  const defaultPosition: LatLngTuple = [40.785091, -73.968285];
  const position: LatLngTuple = location ? [location.latitude, location.longitude] : defaultPosition;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-4 flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <CircularProgress />
            </div>
          ) : (
            <>
              {/* User Profile Section */}
              <div className="relative bg-white shadow-lg rounded-lg overflow-hidden mt-20">
                <label htmlFor="cover-photo-upload" className="cursor-pointer">
                  <input
                    type="file"
                    id="cover-photo-upload"
                    accept="image/*"
                    onChange={handleCoverPhotoChange}
                    className="absolute top-0 right-0 z-10 opacity-0 cursor-pointer"
                  />
                  {coverPhotoUrl ? (
                    <img
                      src={coverPhotoUrl}
                      alt="Cover Photo"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <img
                      src={placeholderImageUrl}
                      alt="Placeholder Cover"
                      className="w-full h-48 object-cover"
                    />
                  )}
                </label>
                <Box className="flex flex-col items-start p-4 bg-white">
                  <Box className="flex items-center -mt-16 w-full justify-between">
                    <label htmlFor="profile-picture-upload" className="cursor-pointer">
                      <input
                        type="file"
                        id="profile-picture-upload"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="absolute top-0 right-0 z-10 opacity-0 cursor-pointer"
                      />
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt="Profile"
                          className="w-32 h-32 rounded-full border-4 border-white shadow-md"
                        />
                      ) : (
                        <img
                          src={placeholderImageUrl}
                          alt="Placeholder Profile"
                          className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 shadow-md"
                        />
                      )}
                    </label>
                    <Box className="flex-grow mt-10 ml-4">
                      <Box className="flex space-x-4">
                        <Box>
                          <Typography variant="h4" className="font-bold text-black">
                            {isEditing ? (
                              <input
                                type="text"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                placeholder="First Name"
                                className="border p-2 rounded"
                                required
                              />
                            ) : (
                              personalInformation?.firstname
                            )}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h4" className="font-bold text-black">
                            {isEditing ? (
                              <input
                                type="text"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                                placeholder="Last Name"
                                className="border p-2 rounded"
                                required
                              />
                            ) : (
                              personalInformation?.lastname
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                      size="small"
                      style={{ marginTop: '16px' }}
                      onClick={handleEditToggle}
                    >
                      {isEditing ? 'Save' : 'Edit'}
                    </Button>
                  </Box>
                </Box>
              </div>
              <div className="flex mt-4 space-x-4">
              {/* Blank Container on Left, now smaller */}
              <div className="w-96 h-96 bg-white shadow-lg rounded-lg p-4">
                <p className="text-gray-500">Blank Container</p>
              </div>

              {/* Map Container on Right, now full width */}
              <div className="flex-1 bg-white shadow-lg rounded-lg">
                {userProfile?.location ? (
                  <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={position}>
            
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-gray-200">
                    <p className="text-gray-500">Location not shared</p>
                  </div>
                )}
              </div>
            </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
