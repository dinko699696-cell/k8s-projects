const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URL || 'mongodb://mongo:27017/appdb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});
redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis error:', err));

const Message = mongoose.model('Message', new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now }
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

app.get('/messages', async (req, res) => {
  try {
    const cached = await redisClient.get('messages');
    if (cached) {
      return res.json({ source: 'cache', data: JSON.parse(cached) });
    }
    const messages = await Message.find().sort({ createdAt: -1 }).limit(10);
    await redisClient.setEx('messages', 30, JSON.stringify(messages));
    res.json({ source: 'database', data: messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/messages', async (req, res) => {
  try {
    const message = new Message({ text: req.body.text });
    await message.save();
    await redisClient.del('messages');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Backend running on port 3000'));