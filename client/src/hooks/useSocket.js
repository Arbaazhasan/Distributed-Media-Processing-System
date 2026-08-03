import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SIGNALING_URL } from '../config/constants';

export function useSocket(onProgressEvent) {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((message) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message }, ...prev.slice(0, 49)]);
  }, []);

  useEffect(() => {
    const socket = io(SIGNALING_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      addLog('Connected to Signaling Server WebSocket');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      addLog('Disconnected from Signaling Server');
    });

    socket.on('video:progress', (data) => {
      if (onProgressEvent) {
        onProgressEvent(data);
      }

      const logMsg = `[Job ${data.jobId}] ${data.message || `Status: ${data.status} (${data.progress}%)`}`;
      addLog(logMsg);
    });

    return () => {
      socket.disconnect();
    };
  }, [addLog, onProgressEvent]);

  return { isConnected, logs, addLog };
}
