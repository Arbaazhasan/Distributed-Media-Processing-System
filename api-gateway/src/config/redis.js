import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

connection.on('connect', () => {
  console.log('[API-Gateway] Connected to Redis successfully');
});

connection.on('error', (err) => {
  console.error('[API-Gateway] Redis Connection Error:', err.message);
});

export default connection;
