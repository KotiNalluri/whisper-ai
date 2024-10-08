import React, { useEffect, useState } from 'react';
import { WebSocketAPI } from '../websocketapi';

const RealtimeComponent = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const webSocketAPI = new WebSocketAPI('wss://example.com/socket');

    // Register listeners
    webSocketAPI.on('open', () => console.log('WebSocket connection opened'));
    webSocketAPI.on('message', (event) => {
      console.log('New message:', event.data);
      setMessages(prevMessages => [...prevMessages, event.data]);
    });
    webSocketAPI.on('error', (error) => console.error('WebSocket Error:', error));
    webSocketAPI.on('close', () => console.log('WebSocket connection closed'));

    // Connect the WebSocket
    webSocketAPI.connect();

    // Cleanup on component unmount
    return () => webSocketAPI.close();
  }, []);

  return (
    <div>
      <h1>Realtime Messages</h1>
      <ul>
        {messages.map((msg, index) => <li key={index}>{msg}</li>)}
      </ul>
    </div>
  );
};

export default RealtimeComponent;

