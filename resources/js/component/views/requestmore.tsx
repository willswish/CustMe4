import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import apiServices from "../services/apiService";

interface RequestModalProps {
  open: boolean;
  handleClose: () => void;
  setRequestContent: Dispatch<SetStateAction<string>>;
  selectedPost: number | null;
  targetUserId: number;
}

const RequestModal: React.FC<RequestModalProps> = ({
  open,
  handleClose,
  setRequestContent,
  selectedPost,
  targetUserId,
}) => {
  const [requestContent, setLocalRequestContent] = useState('');

  useEffect(() => {
    if (!open) {
      setLocalRequestContent('');
    }
    console.log('RequestModal opened. Target User ID:', targetUserId);
  }, [open, targetUserId]);

  const handleSubmitWrapper = async () => {
    try {
      if (!selectedPost) {
        console.error("No post selected for payment.");
        return;
      }

      // Prepare data for request
      setRequestContent(requestContent);

      // Send the request to create InitialPayment and Request models and get checkout URL
      const response = await apiServices.post('/pay-for-product', {
        post_id: selectedPost,
        target_user_id: targetUserId,  
        request_content: requestContent,
      });

      const checkoutUrl = response.data.checkout_url;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank'); // Open in a new tab
      } else {
        console.error("Checkout session failed: No checkout URL received");
      }

      handleClose();
    } catch (error) {
      console.error("Payment or request submission error:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Submit a Request</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Request Content"
          type="text"
          fullWidth
          variant="outlined"
          value={requestContent}
          onChange={(e) => {
            setLocalRequestContent(e.target.value);
            setRequestContent(e.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmitWrapper} color="primary">
          Submit and Pay 20%
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestModal;