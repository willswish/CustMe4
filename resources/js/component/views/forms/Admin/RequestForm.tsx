import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Divider, Modal } from '@mui/material';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import Header from '../components/header';

const RequestForm: React.FC = () => {
  const { notifications, acceptNotification, declineNotification, selectedNotification, setSelectedNotification } = useNotification();
  const { user } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [timeLeftMap, setTimeLeftMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const updatedTimeLeftMap: { [key: number]: string } = {};
  
      notifications.forEach((notification) => {
        if (notification.status === 'accepted' && (notification.duration_days || notification.duration_minutes)) {
          const { duration_days = 0, duration_minutes = 0, created_at } = notification;
  
          const startTime = new Date(created_at).getTime();
          const totalDurationMilliseconds =
            duration_days * 24 * 60 * 60 * 1000 + duration_minutes * 60 * 1000;
  
          const deadline = startTime + totalDurationMilliseconds;
          const now = Date.now();
          const distance = deadline - now;
  
          if (distance <= 0) {
            updatedTimeLeftMap[notification.request_id] = 'Time is up!';
          } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
            // Display time left in a format that makes sense based on available time units
            if (days > 0) {
              updatedTimeLeftMap[notification.request_id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            } else if (hours > 0) {
              updatedTimeLeftMap[notification.request_id] = `${hours}h ${minutes}m ${seconds}s`;
            } else {
              updatedTimeLeftMap[notification.request_id] = `${minutes}m ${seconds}s`;
            }
          }
        } else {
          updatedTimeLeftMap[notification.request_id] = 'Calculating...';
        }
      });
  
      setTimeLeftMap(updatedTimeLeftMap);
    };
  
    calculateTimeLeft();
    const timerInterval = setInterval(() => {
      calculateTimeLeft();
    }, 1000); // Update every second for real-time ticking
  
    return () => {
      clearInterval(timerInterval);
    };
  }, [notifications]);
  

  const handleNotificationClick = (id: number) => {
    setSelectedNotification(id);
    setModalOpen(true); // Open the modal when a notification is clicked
  };

  const handleCloseModal = () => {
    setSelectedNotification(null); // Reset selected notification
    setModalOpen(false); // Close the modal
  };

  return (
    <Box className="p-4 mt-14">
      <Header />
      {notifications.length > 0 ? (
        notifications.map((notification) => {
          const { status, request_id, content, created_at, target_user_id } = notification;

          // Assign background color based on status
          const bgColor =
            status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' :
            status === 'declined' ? 'rgba(239, 68, 68, 0.1)' :
            'white'; // Default for pending

          return (
            <Paper
              key={`${request_id}-${created_at}`}
              className={`mb-2 p-4 transition-shadow duration-300 flex items-center justify-between`}
              onClick={() => handleNotificationClick(request_id)}
              style={{ backgroundColor: bgColor }}
            >
              {/* Left section: Notification details */}
              <div>
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
                        e.stopPropagation();
                        acceptNotification(request_id);
                      }}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        declineNotification(request_id);
                      }}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Decline
                    </Button>
                  </Box>
                )}
                {status === 'accepted' && user && target_user_id === user.id && (
                  <Typography variant="body2" className="text-green-600 mt-2">
                    You accepted this request.
                  </Typography>
                )}
                {status === 'declined' && user && target_user_id === user.id && (
                  <Typography variant="body2" className="text-red-600 mt-2">
                    You declined this request.
                  </Typography>
                )}
              </div>

              {/* Right section: Countdown timer for accepted requests */}
              {status === 'accepted' && (
                <div>
                  <Typography variant="body2" color="primary">
                    <strong>Time Left:</strong> {timeLeftMap[request_id] || 'Calculating...'}
                  </Typography>
                </div>
              )}
            </Paper>
          );
        })
      ) : (
        <Typography variant="body2" className="text-gray-800">
          No notification requests.
        </Typography>
      )}

      {/* Modal to display detailed notification data */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {selectedNotification ? (
            <>
              <Typography variant="h6" gutterBottom>
                Notification Details
              </Typography>
              <Typography variant="body1">
                <strong>Content:</strong> {selectedNotification.content}
              </Typography>
              <Typography variant="body1">
                <strong>Created At:</strong> {new Date(selectedNotification.created_at).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Price:</strong> {selectedNotification.price}
              </Typography>
              <Typography variant="body1">
                <strong>Duration:</strong> {selectedNotification.duration_days} days, {selectedNotification.duration_minutes} minutes
              </Typography>
              <Typography variant="body1">
                <strong>Request Content:</strong> {selectedNotification.request_content}
              </Typography>
              <Box mt={2}>
                <Button variant="contained" onClick={handleCloseModal} fullWidth>
                  Close
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="body1">No data available.</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default RequestForm;
