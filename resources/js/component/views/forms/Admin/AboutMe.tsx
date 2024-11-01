import React, { useState } from 'react';
import { Avatar, Rating, Typography, Button, Card, CardContent, Modal, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useClientProfile } from '../../../context/ClientProfileContext';
import { useAuth } from '../../../context/AuthContext';
import EditProfileBioSkill from '../../../views/editBioSkillForm';

function AboutMe() {
  const { profile, updateProfile } = useClientProfile();
  const { user } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const position: [number, number] | null = profile?.stores[0]?.location
    ? [parseFloat(profile.stores[0].location.latitude), parseFloat(profile.stores[0].location.longitude)]
    : null;

  const [tempData, setTempData] = useState({
    aboutMe: profile?.about_me?.content || '',
    skills: profile?.role_name === 'Graphic Designer' 
      ? profile?.user_skills?.map(skill => skill.skill_name).join(', ') || '' 
      : profile?.printing_skills?.map(skill => skill.printing_skill_name).join(', ') || '',
  });

  const handleEditClick = () => setEditModalOpen(true);

  const handleSave = async (updatedAboutMe: string, updatedSkills: Skill[], updatedPrintingSkills: PrintingSkill[]) => {
    await updateProfile(profile.id, {
      aboutMe: updatedAboutMe,
      skills: profile.role_name === 'Graphic Designer' ? updatedSkills.map(skill => skill.skill_name) : undefined,
      printingSkills: profile.role_name === 'Printing Shop' ? updatedPrintingSkills.map(skill => skill.printing_skill_name) : undefined,
    });

    setTempData({
      aboutMe: updatedAboutMe,
      skills: profile.role_name === 'Graphic Designer' 
        ? updatedSkills.map(skill => skill.skill_name).join(', ') 
        : updatedPrintingSkills.map(skill => skill.printing_skill_name).join(', '),
    });

    setEditModalOpen(false);
  };

  const isOwnProfile = user?.id === profile?.id;

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md w-full md:w-1/2 mx-auto">
      <Avatar sx={{ bgcolor: '#2196f3', width: 80, height: 80 }} className="mb-4">
        {profile?.username.charAt(0)}
      </Avatar>
      <Typography variant="h6" className="text-gray-800 font-bold mb-2">{profile?.username || 'User'}</Typography>

      <div className="flex items-center mb-2">
        <Typography variant="body1" className="text-gray-600 mr-2">Skills:</Typography>
        <Typography variant="body2" className="text-gray-600">{tempData.skills}</Typography>
      </div>

      <div className="flex items-center mb-2">
        <Typography variant="body1" className="text-gray-600 mr-2">Rating:</Typography>
        <Rating name="read-only" value={profile?.verified ? 4.8 : 4.0} readOnly precision={0.1} />
      </div>

      <div className="flex items-center mb-2">
        <Typography variant="body1" className="text-gray-600 mr-2">Location:</Typography>
        <Typography
          variant="body2"
          className="text-blue-600 underline cursor-pointer"
          onClick={() => setMapModalOpen(true)}
        >
          {profile?.stores[0]?.storename || 'Store Name Not Set'} - {profile?.stores[0]?.location?.address || 'Address Not Set'}
        </Typography>
      </div>

      <Card className="w-full">
        <CardContent>
          <Typography variant="body1" className="text-gray-600 mb-2">About Me:</Typography>
          <Typography variant="body2" className="text-gray-600">{tempData.aboutMe}</Typography>
        </CardContent>
      </Card>

      {isOwnProfile && (
        <div className="mt-4">
          <Button variant="outlined" color="primary" onClick={handleEditClick} startIcon={<EditIcon />}>
            Edit
          </Button>
        </div>
      )}

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
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
          <Typography variant="h6" className="mb-4">Edit Profile Information</Typography>
          <EditProfileBioSkill
            onSave={(updatedAboutMe, updatedSkills, updatedPrintingSkills) => handleSave(updatedAboutMe, updatedSkills, updatedPrintingSkills)}
            onClose={() => setEditModalOpen(false)}
          />
          <Button onClick={() => setEditModalOpen(false)} variant="outlined" color="secondary" className="mt-4">
            Close
          </Button>
        </Box>
      </Modal>

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
          <Button onClick={() => setMapModalOpen(false)} variant="outlined" color="secondary" className="mt-4">
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default AboutMe;
