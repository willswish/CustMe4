import React, { useState } from 'react';
import { IconButton, Box, Typography, Divider, Paper, Badge, Button } from '@mui/material';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';

const NotificationsDropdown: React.FC = () => {
  const { notifications = [] } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<number | null>(null); // Changed to number | null
  const navigate = useNavigate();

  const handleNotificationClick = (id: number) => { // Change id parameter to number
    setSelectedNotification(id); // Set selected notification to highlight
    navigate('/notifications'); // Navigate to notifications page
  };

  return (
    <Box position="relative" zIndex={50}>
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          p: 1,
          '&:hover': { backgroundColor: 'primary.dark' },
        }}
      >
        <Badge badgeContent={notifications.length} color="error">
          <FaBell />
        </Badge>
      </IconButton>
      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            mt: 1,
            width: 256,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden',
          }}
        >
          <Box p={2}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Notifications
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                maxHeight: 256,
                overflowY: 'auto',
              }}
            >
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    py={1}
                    borderBottom="1px solid"
                    borderColor="grey.200"
                    sx={{
                      backgroundColor: selectedNotification === notification.id ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 255, 0.2)', // Highlight on hover
                      },
                    }}
                    onClick={() => handleNotificationClick(notification.id)} // Handle click for navigation
                  >
                    <Typography variant="body2" color="text.primary">
                      {notification.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.primary">
                  No notifications
                </Typography>
              )}
            </Box>
            <Button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              sx={{ mt: 1, width: '100%' }}
              variant="contained"
              color="primary"
            >
              View All
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default NotificationsDropdown;
