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
    console.log('Recording started');
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log('Recording stopped');
  };

  const uploadAudio = async (recordedBlob) => {
    console.log('Recorded Blob:', recordedBlob);
    
    if (!recordedBlob.blob) {
      console.error('No audio data to upload.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', recordedBlob.blob, 'recording.wav');
  
    try {
      const response = await fetch('https://whisper-api.dev.arinternal.xyz/transcribe/', {
        method: 'POST',
        body: formData,
        headers: {
          // Add any custom headers here if your API requires them
          // For example, you might add an authorization token
          // 'Authorization': 'Bearer your-token-here',
        },
        // credentials: 'include', // Use this if you need to send cookies with requests, only if your server supports them
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const data = await response.json();
      setTranscription(data.text);
      console.log('Transcription:', data.text);
    } catch (error) {
      console.error('Error:', error);
      setTranscription('Error transcribing audio.');
    }
  };
  
  const summarizeAndSaveNote = async () => {
    if (!transcription.trim()) {
      console.warn("Transcription is empty, no data to summarize.");
      return;
    }
  
    try {
      const response = await fetch('https://whisper-api.dev.arinternal.xyz/summarize/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Include any additional headers your server might need
        },
        body: JSON.stringify({ text: transcription }), // Send transcription as JSON
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const data = await response.json();
      if (data.summary && data.summary.trim()) {
        setNotes(prevNotes => [...prevNotes, data.summary.trim()]);
        setTranscription('');
      } else {
        console.warn("Empty or invalid summary received.");
      }
    } catch (error) {
      console.error('Error summarizing text:', error);
    }
  };
  

  const deleteNote = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
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
            mimeType="audio/wav" // Ensure correct MIME type
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
          <Button variant="contained" color="success" onClick={summarizeAndSaveNote} disabled={!transcription}>
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

