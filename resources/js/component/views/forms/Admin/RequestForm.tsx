import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext'; // Make sure to import useAuth
import Header from '../components/header';

const RequestForm: React.FC = () => {
  const { notifications = [], acceptNotification, declineNotification } = useNotification();
  const { user } = useAuth(); // Get the current logged-in user
  const [selectedNotification, setSelectedNotification] = useState<number | null>(null);

  const handleNotificationClick = (id: number) => {
    setSelectedNotification(selectedNotification === id ? null : id);
  };

  return (
    <Box className="p-4 mt-14">
      <Header />
      {notifications.length > 0 ? (
        notifications.map((notification) => {
          const { status, request_id, content, created_at, target_user_id } = notification;

          // Log the status of each notification
          console.log(`Notification ID: ${request_id}, Status: ${status}`);

          // Assign background color based on status
          const bgColor =
            status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' :
            status === 'declined' ? 'rgba(239, 68, 68, 0.1)' :
            'white'; // Default for pending

          return (
            <Paper
              key={`${request_id}-${created_at}`} // Combine request_id and created_at for a unique key
              className={`mb-2 p-4 transition-shadow duration-300 
                ${selectedNotification === request_id ? 'border-2 border-blue-500 shadow-lg' : 'shadow-none'}`}
              onClick={() => handleNotificationClick(request_id)}
              style={{ backgroundColor: bgColor }} // Set the background color via inline style
            >
              <Typography variant="body1" className="text-gray-800">
                {content}
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                {new Date(created_at).toLocaleString()}
              </Typography>
              <Divider sx={{ my: 1 }} />
              {status === 'pending' && (
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering notification click
                      acceptNotification(request_id); // Pass the request_id
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering notification click
                      declineNotification(request_id); // Pass the request_id
                    }}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Decline
                  </Button>
                </Box>
              )}
              {status === 'accepted' && user && target_user_id === user.id && ( // Check for user ID match
                <Typography variant="body2" className="text-green-600 mt-2">
                  You accepted this request.
                </Typography>
              )}
              {status === 'declined' && user && target_user_id === user.id && ( // Check for user ID match
                <Typography variant="body2" className="text-red-600 mt-2">
                  You declined this request.
                </Typography>
              )}
            </Paper>
          );
        })
      ) : (
        <Typography variant="body2" className="text-gray-800">
          No notification requests.
        </Typography>
      )}
    </Box>
  );
};

export default RequestForm;
