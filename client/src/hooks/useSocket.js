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
    setLogs((prev) => {
      // Prevent duplicate exact logs if emitted rapidly
      if (prev.length > 0 && prev[0].message === message) return prev;
      return [{ time, message }, ...prev.slice(0, 49)];
    });
  }, []);

  useEffect(() => {
    let socket;
    try {
      console.log('[Socket.io] Connecting to signaling server:', SIGNALING_URL);
      socket = io(SIGNALING_URL, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socket.on('connect', () => {
        console.log('[Socket.io] Connected! Socket ID:', socket.id);
        setIsConnected(true);
        addLog('[Redis Pub/Sub] Connected to Signaling WebSocket Stream');
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket.io] Disconnected:', reason);
        setIsConnected(false);
        addLog(`[Redis Pub/Sub] Socket disconnected (${reason})`);
      });

      socket.on('connect_error', (err) => {
        setIsConnected(false);
      });

      socket.on('video:progress', (data) => {
        if (onProgressRef.current) {
          onProgressRef.current(data);
        }

        const logMsg = `[Redis Pub/Sub] Job #${data.jobId || 'stream'} - ${data.message || `${data.currentResolution || 'Processing'} (${data.progress}%)`}`;
        addLog(logMsg);
      });
    } catch (e) {
      console.warn('[Socket.io] Initialization warning:', e.message);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [addLog]);

  return { isConnected, logs, addLog };
}
