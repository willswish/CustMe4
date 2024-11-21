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
    const [posts, setPosts] = useState<any[]>([]); // State for posts
    const [postsLoading, setPostsLoading] = useState(false); // Loading state for posts
    const [error, setError] = useState<string | null>(null); // Error state for posts
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null); // State to store the post being edited


    useEffect(() => {
        if (userId) {
            fetchProfile(userId).catch((error) => {
                console.error('Error fetching profile:', error);
            });

            if (user?.id === userId) {
                // Fetch posts using fetch API
                setPostsLoading(true);
                fetch(`http://127.0.0.1:8000/api/posts?user_id=${userId}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch posts');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        setPosts(data); // Store the posts in state
                    })
                    .catch((error) => {
                        setError(error.message);
                        console.error('Error fetching posts:', error);
                    })
                    .finally(() => {
                        setPostsLoading(false); // Done loading
                    });
            }
        }
    }, [userId, fetchProfile, user]);

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
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
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

                {/* About Me, Location, Contact Section and Posts Section in Flexbox Layout */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                    {/* About Me, Location, Contact Section */}
                    <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 2, padding: 2, flex: 1 }}>
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
                    <Box sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 2, padding: 2, flex: 2 }}>
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
                                            {post.images && post.images.length > 0 && (
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
            </Box>

            {/* Edit Profile Modal */}
            <EditProfileModal open={openEditModal} onClose={() => setOpenEditModal(false)} />
        </>
    );
};

export default ClientProfile;
