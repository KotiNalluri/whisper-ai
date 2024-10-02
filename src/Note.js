import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const Note = ({ text, onDelete }) => {
  return (
    <Paper elevation={3} style={{ padding: '16px', position: 'relative' }}>
      <Typography variant="body1" component="p">
        {text}
      </Typography>
      <Box position="absolute" top="16px" right="16px">
        <Button variant="outlined" color="error" onClick={onDelete}>
          Delete
        </Button>
      </Box>
    </Paper>
  );
};

export default Note;

