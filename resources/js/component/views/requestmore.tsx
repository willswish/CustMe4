import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface RequestModalProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => Promise<void>;
  setRequestContent: Dispatch<SetStateAction<string>>;
  setDurationDays: Dispatch<SetStateAction<number | undefined>>;
  setDurationMinutes: Dispatch<SetStateAction<number | undefined>>;
// Add the setPrice prop
}

const RequestModal: React.FC<RequestModalProps> = ({
  open,
  handleClose,
  handleSubmit,
  setRequestContent,
  setDurationDays,
  setDurationMinutes,
 // Add setPrice to props
}) => {
  const [requestContent, setLocalRequestContent] = useState('');
  const [durationDays, setLocalDurationDays] = useState('');
  const [durationMinutes, setLocalDurationMinutes] = useState('');
  

  useEffect(() => {
    // Reset local state when modal closes
    if (!open) {
      setLocalRequestContent('');
      setLocalDurationDays('');
      setLocalDurationMinutes('');
    }
  }, [open]);

  const isSubmitDisabled = !requestContent || !durationDays || !durationMinutes;

  const handleSubmitWrapper = async () => {
    setRequestContent(requestContent);

    // Parse duration values
    setDurationDays(durationDays ? parseInt(durationDays) : undefined);
    setDurationMinutes(durationMinutes ? parseInt(durationMinutes) : undefined);
    
    

    await handleSubmit(); // Call the handleSubmit passed from the parent
    handleClose(); // Close the modal after submitting
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
            setRequestContent(e.target.value); // Update context state
          }}
        />
        <TextField
          margin="dense"
          label="Duration (Days)"
          type="number"
          fullWidth
          variant="outlined"
          value={durationDays}
          onChange={(e) => {
            setLocalDurationDays(e.target.value);
            setDurationDays(e.target.value ? parseInt(e.target.value) : undefined); // Update context state
          }}
        />
        <TextField
          margin="dense"
          label="Duration (Minutes)"
          type="number"
          fullWidth
          variant="outlined"
          value={durationMinutes}
          onChange={(e) => {
            setLocalDurationMinutes(e.target.value);
            setDurationMinutes(e.target.value ? parseInt(e.target.value) : undefined); // Update context state
          }}
        />
      
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmitWrapper} color="primary" disabled={isSubmitDisabled}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestModal;
