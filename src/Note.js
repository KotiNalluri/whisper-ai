import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const Note = ({ text, onDelete }) => {
  return (
    <Paper elevation={3} style={{ padding: '16px', margin: '10px 0', width: '100%' }}>
      <Typography variant="h6">Note</Typography>
      <Typography variant="body1" component="pre" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', lineHeight: '1.5' }}>
        {text}
      </Typography>
      <Box textAlign="right" mt={2}>
        <Button variant="outlined" color="secondary" onClick={onDelete}>
          Delete
        </Button>
      </Box>
    </Paper>
  );
};

export default Note;


