import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { SIGNALING_URL } from '../config/constants';

export function useSocket(onProgressEvent) {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState([]);

  const onProgressRef = useRef(onProgressEvent);
  useEffect(() => {
    onProgressRef.current = onProgressEvent;
  }, [onProgressEvent]);

  const addLog = useCallback((message) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message }, ...prev.slice(0, 49)]);
  }, []);

  useEffect(() => {
    console.log('[Socket.io] Initializing connection to:', SIGNALING_URL);

    const socket = io(SIGNALING_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected successfully. Socket ID:', socket.id);
      setIsConnected(true);
      addLog('Connected to Signaling Server WebSocket');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] Disconnected. Reason:', reason);
      setIsConnected(false);
      addLog(`Disconnected from Signaling Server (${reason})`);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.io] Connection error:', err.message);
    });

    socket.on('video:progress', (data) => {
      if (onProgressRef.current) {
        onProgressRef.current(data);
      }

      const logMsg = `[Job ${data.jobId}] ${data.message || `Status: ${data.status} (${data.progress}%)`}`;
      addLog(logMsg);
    });

    return () => {
      console.log('[Socket.io] Cleaning up persistent socket instance');
      socket.disconnect();
    };
  }, [addLog]);

  return { isConnected, logs, addLog };
}
