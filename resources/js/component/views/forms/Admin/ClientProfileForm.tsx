import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClientProfile } from '../../../context/ClientProfileContext';
import { useAuth } from '../../../context/AuthContext';
import { usePostContext } from '../../../context/PostContext';

import {
    Avatar,
    Button,
    Typography,
    CircularProgress,
    Box,
    Card,
    CardContent,
    CardMedia,
    IconButton,
} from '@mui/material';
import { Edit as EditIcon, PushPin as PinIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Header from '../components/header';
import EditProfileModal from '../../forms/EditProfileForm';

const ClientProfile = () => {
    const { id } = useParams();
    const userId = id ? parseInt(id, 10) : undefined;
    const { profile, fetchProfile, loading } = useClientProfile();
    const { user } = useAuth();
    const { posts, fetchPosts, isLoading: postsLoading, error } = usePostContext();
    const [openEditModal, setOpenEditModal] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchProfile(userId).catch((error) => {
                console.error('Error fetching profile:', error);
            });
            if (user?.id === userId) {
                fetchPosts(1, 4); // Fetch user's posts
                console.log("Fetching posts for user ID:", userId); // Debug log
            }
        }
    }, [userId, fetchProfile, fetchPosts, user]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Typography variant="h6" align="center" mt={4}>
                No profile found.
            </Typography>
        );
    }

    if (postsLoading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    console.log('Fetched Posts:', posts); // Ensure this logs the posts array

    const coverPhoto = profile.personal_information?.coverphoto
        ? `http://127.0.0.1:8000/storage/${profile.personal_information.coverphoto}`
        : 'default-cover-image-url';

    const profilePicture = profile.personal_information?.profilepicture
        ? `http://127.0.0.1:8000/storage/${profile.personal_information.profilepicture}`
        : 'default-profile-image-url';

    return (
        <>
            <Header />
            <Box sx={{ padding: '2rem', backgroundColor: '#f8f9fa' }}>
                {/* Profile Section */}
                <Box sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 2, overflow: 'hidden', mb: 4 }}>
                    <Box component="img" src={coverPhoto} alt="Cover Photo" sx={{ width: '100%', height: 300, objectFit: 'cover' }} />
                    <Box sx={{ position: 'relative', padding: 2 }}>
                        <Avatar
                            src={profilePicture}
                            alt={`${profile.personal_information?.firstname} ${profile.personal_information?.lastname}`}
                            sx={{ width: 120, height: 120, position: 'absolute', top: '-3rem', left: '1rem', border: '3px solid white' }}
                        />
                        <Box sx={{ marginLeft: '7rem', marginTop: 2 }}>
                            <Typography variant="h5" fontWeight="bold">
                                {`${profile.personal_information?.firstname || ''} ${profile.personal_information?.lastname || ''}`}
                            </Typography>
                        </Box>
                        {user?.id === userId && (
                            <Box sx={{ position: 'absolute', top: '20%', right: '2rem' }}>
                                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setOpenEditModal(true)}>
                                    Edit Profile
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* About Me, Location, Contact Section */}
                <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 2, padding: 2, mt: 4 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            About Me
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {profile.personal_information?.about_me || 'No information provided.'}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Location
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {profile.personal_information?.location || 'Manila'}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Contact Number
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {profile.personal_information?.contact_number || '09474635274'}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Posts Section */}
                <Box sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 2, padding: 2, mt: 4 }}>
                    <Typography variant="h6" align="center" gutterBottom>
                        Posts
                    </Typography>
                    {posts.length === 0 ? (
                        <Typography variant="body2" align="center">No posts available.</Typography>
                    ) : (
                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                            {posts.map((post) => (
                                <Card key={post.post_id} sx={{ width: '100%', maxWidth: 500, boxShadow: 2 }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Avatar
                                                src={`http://127.0.0.1:8000/storage/${profile?.personal_information?.profilepicture || ''}`}
                                                alt={`${profile?.personal_information?.firstname || 'User'} ${profile?.personal_information?.lastname || ''}`}
                                                sx={{ width: 40, height: 40 }}
                                            />
                                            <Box ml={2}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {`${profile?.personal_information?.firstname || 'First'} ${profile?.personal_information?.lastname || 'Last'}`}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {new Date(post.created_at).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {post.title}
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            {post.content}
                                        </Typography>
                                        {post.images.length > 0 && (
                                            <CardMedia
                                                component="img"
                                                height="300"
                                                image={`http://127.0.0.1:8000/storage/${post.images[0]?.image_path || ''}`}
                                                alt="Post Image"
                                            />
                                        )}
                                    </CardContent>
                                    <Box display="flex" justifyContent="space-between" px={2} pb={2}>
                                        <IconButton>
                                            <PinIcon />
                                        </IconButton>
                                        <IconButton>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Edit Profile Modal */}
            <EditProfileModal open={openEditModal} onClose={() => setOpenEditModal(false)} />
        </>
    );
};

export default ClientProfile;