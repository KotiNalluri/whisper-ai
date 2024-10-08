import React, { useState, useEffect } from 'react';
   import { ReactMic } from 'react-mic';
   import AppBar from '@mui/material/AppBar';
   import Toolbar from '@mui/material/Toolbar';
   import Typography from '@mui/material/Typography';
   import Container from '@mui/material/Container';
   import Button from '@mui/material/Button';
   import Stack from '@mui/material/Stack';
   import Box from '@mui/material/Box';
   import Note from './Note';
   import { WebSocketAPI } from './websocketapi'; // Import your WebSocketAPI
   import './App.css';

   const WEBSOCKET_URL = 'ws://localhost:8000/real-time-transcription';

   const App = () => {
     const [isRecording, setIsRecording] = useState(false);
     const [transcription, setTranscription] = useState('');
     const [notes, setNotes] = useState([]);
     const [errorMessage, setErrorMessage] = useState('');
     const webSocketAPI = new WebSocketAPI(WEBSOCKET_URL);

     useEffect(() => {
       webSocketAPI.connect();

       webSocketAPI.on('open', () => console.log('Connected to WebSocket'));
       webSocketAPI.on('message', (event) => {
         const data = JSON.parse(event.data);
         handleWebSocketMessage(data);
       });
       webSocketAPI.on('error', (error) => console.error('WebSocket error:', error));
       webSocketAPI.on('close', () => console.log('WebSocket connection closed'));

       return () => webSocketAPI.close(); // Cleanup on component unmount
     }, []);

     const handleWebSocketMessage = (data) => {
       if (data.event === 'transcriptionUpdate') {
         setTranscription(data.text);
       } else if (data.event === 'transcriptionError') {
         setErrorMessage('Error in transcription.');
       } // Add other cases as needed
     };

     const startRecording = () => {
       setIsRecording(true);
     };

     const stopRecording = () => {
       setIsRecording(false);
     };

     const onStop = (recordedBlob) => {
       if (!recordedBlob.blob) {
         setErrorMessage('No audio data recorded.');
         return;
       }
       // Send audio data to the server via WebSocket
       webSocketAPI.send(recordedBlob.blob);
     };

     const summarizeAndSaveNote = async () => {
       if (!transcription.trim()) {
         setErrorMessage('Transcription is empty.');
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

         if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

         const data = await response.json();
         if (data.summary?.trim()) {
           setNotes(prevNotes => [...prevNotes, data.summary.trim()]);
           setTranscription('');
           setErrorMessage('');
         } else {
           setErrorMessage('Failed to obtain a valid summary.');
         }
       } catch (error) {
         setErrorMessage('Error summarizing transcription.');
       }
     };

     const deleteNote = (index) => {
       setNotes(notes.filter((_, i) => i !== index));
     };

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
             {errorMessage && <Typography variant="body2" color="error">{errorMessage}</Typography>}
             <Box>
               <Typography variant="body1">Transcription: {transcription}</Typography>
             </Box>
             <Box>
               {notes.map((note, index) => <Note key={index} text={note} onDelete={() => deleteNote(index)} />)}
             </Box>
           </Stack>
         </Container>
       </div>
     );
   };

   export default App;

   