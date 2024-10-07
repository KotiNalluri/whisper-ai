import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import './App.css';

// Use the precise deployed backend URL
const API_BASE_URL = 'https://whisper-api.dev.arinternal.xyz/'; // Use the exact URL from Postman

const App = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [notes, setNotes] = useState([]);

    const startRecording = () => setIsRecording(true);
    const stopRecording = () => setIsRecording(false);

    const onStop = async (recordedBlob) => {
        if (!recordedBlob.blob) {
            console.error('No audio data to upload.');
            return;
        }
        await uploadAudio(recordedBlob);
    };

    const uploadAudio = async (recordedBlob) => {
        const formData = new FormData();
        formData.append('file', recordedBlob.blob, 'recording.wav');

        try {
            const response = await fetch(`${API_BASE_URL}/transcribe/`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setTranscription(data.text);
                console.log('Transcription:', data.text);
            } else {
                throw new Error(`Server error: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error in uploadAudio:', error);
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

            if (response.ok) {
                const data = await response.json();
                if (data.summary) {
                    setNotes(prevNotes => [...prevNotes, data.summary]);
                    setTranscription('');
                } else {
                    console.warn("Empty or invalid summary received.");
                }
            } else {
                throw new Error(`Server error: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error in summarizeAndSaveNote:', error);
        }
    };

    const deleteNote = (index) => setNotes(notes.filter((_, i) => i !== index));

    return (
        <div className="App">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">Voice Note App</Typography>
                </Toolbar>
            </AppBar>
            <Container>
                <Stack spacing={2} alignItems="center">
                    <ReactMic
                        record={isRecording}
                        className="sound-wave"
                        onStop={onStop}
                        strokeColor="#000000"
                        backgroundColor="#FF4081"
                    />
                    <Button variant="contained" color="primary" onClick={startRecording}>Start</Button>
                    <Button variant="contained" color="secondary" onClick={stopRecording}>Stop</Button>
                    <Button variant="contained" color="default" onClick={summarizeAndSaveNote}>Summarize & Save Note</Button>
                    <Box>
                        <Typography variant="body1">Transcription: {transcription}</Typography>
                    </Box>
                    <Box>
                        {notes.map((note, index) => (
                            <Paper key={index} elevation={3} style={{ margin: 10, padding: 10 }}>
                                <Typography variant="body2">{note}</Typography>
                                <Button variant="contained" color="secondary" onClick={() => deleteNote(index)}>Delete</Button>
                            </Paper>
                        ))}
                    </Box>
                </Stack>
            </Container>
        </div>
    );
};

export default App;

