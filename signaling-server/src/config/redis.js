import Redis from 'ioredis';

const subscriber = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

subscriber.on('connect', () => {
  console.log('[Signaling-Server] Connected to Redis Pub/Sub subscriber');
});

subscriber.on('error', (err) => {
  console.error('[Signaling-Server] Redis Subscriber Error:', err.message);
});

export default subscriber;
