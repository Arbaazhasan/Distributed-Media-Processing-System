import Redis from 'ioredis';

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
};

const connection = new Redis(redisOptions);
const publisher = new Redis(redisOptions);

connection.on('connect', () => {
  console.log('[Worker-Node] Connected to Redis queue connection');
});

publisher.on('connect', () => {
  console.log('[Worker-Node] Connected to Redis Pub/Sub publisher');
});

connection.on('error', (err) => console.error('[Worker-Node] Redis Connection Error:', err.message));
publisher.on('error', (err) => console.error('[Worker-Node] Redis Publisher Error:', err.message));

export {
  connection,
  publisher,
};
