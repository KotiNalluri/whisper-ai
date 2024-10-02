import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import Note from './Note';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import './App.css';

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [notes, setNotes] = useState([]);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const uploadAudio = (recordedBlob) => {
    const formData = new FormData();
    formData.append('file', recordedBlob.blob, 'recording.wav');

    fetch('http://localhost:8000/transcribe', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        setTranscription(data.text);
      })
      .catch(error => {
        console.error('Error:', error);
        setTranscription('Error transcribing audio.');
      });
  };

  const addNote = () => {
    setNotes([...notes, transcription]);
    setTranscription('');
  };

  const deleteNote = (index) => {
    setNotes(notes.filter((note, i) => i !== index));
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Whisper AI Transcription</Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Stack spacing={2} alignItems="center" marginTop={4}>
          <ReactMic
            record={isRecording}
            className="sound-wave"
            onStop={uploadAudio}
            strokeColor="#000000"
            backgroundColor="#FF4081"
          />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={startRecording} disabled={isRecording}>
              Start Recording
            </Button>
            <Button variant="contained" color="secondary" onClick={stopRecording} disabled={!isRecording}>
              Stop Recording
            </Button>
          </Stack>
          <Button variant="contained" color="success" onClick={addNote} disabled={!transcription}>
            Save as Note
          </Button>
        </Stack>
        <Box marginTop={4}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <Typography variant="h6">Transcription</Typography>
            <Typography variant="body1" component="pre" style={{ whiteSpace: 'pre-wrap' }}>
              {transcription}
            </Typography>
          </Paper>
        </Box>
        <Box marginTop={4}>
          <Typography variant="h6">Notes</Typography>
          <Stack spacing={2}>
            {notes.map((note, index) => (
              <Note key={index} text={note} onDelete={() => deleteNote(index)} />
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default App;
