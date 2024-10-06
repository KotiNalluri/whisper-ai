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

const API_BASE_URL = 'https://whisper-api.dev.arinternal.xyz';

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
      const response = await fetch(`${API_BASE_URL}/transcribe/`, {
        method: 'POST',
        body: formData,
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
      const response = await fetch(`${API_BASE_URL}/summarize/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcription }),
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

  // ... rest of the component remains the same

  return (
    // ... JSX remains the same
  );
};

export default App;

