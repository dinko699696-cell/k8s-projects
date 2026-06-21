const express = require('express');
const mongoose = require('mongoose');
const promClient = require('prom-client');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(morgan('combined'));

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2],
  registers: [register],
});

const dbConnectionGauge = new promClient.Gauge({
  name: 'mongodb_connection_status',
  help: 'MongoDB connection status (1=connected, 0=disconnected)',
  registers: [register],
});

const itemsGauge = new promClient.Gauge({
  name: 'app_items_total',
  help: 'Total number of items in the database',
  registers: [register],
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    httpRequestCounter.inc({ method: req.method, route, status: res.statusCode });
    end({ method: req.method, route, status: res.statusCode });
  });
  next();
});

const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASSWORD;
if (!MONGO_USER || !MONGO_PASS) {
  console.error('FATAL: MONGO_USER and MONGO_PASSWORD must be set');
  process.exit(1);
}
const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_URI = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/itemsdb?authSource=admin`;

mongoose.connect(MONGO_URI)
  .then(() => { console.log('MongoDB connected'); dbConnectionGauge.set(1); })
  .catch(err => { console.error('MongoDB connection error:', err.message); dbConnectionGauge.set(0); });

mongoose.connection.on('disconnected', () => dbConnectionGauge.set(0));
mongoose.connection.on('connected', () => dbConnectionGauge.set(1));

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now },
});
const Item = mongoose.model('Item', itemSchema);

app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const itemCount = await Item.countDocuments().catch(() => -1);
  itemsGauge.set(itemCount >= 0 ? itemCount : 0);
  res.json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    pod: process.env.MY_POD_NAME || 'unknown',
    namespace: process.env.MY_NAMESPACE || 'unknown',
    db: dbStatus,
    itemCount,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/metrics', async (req, res) => {
  const itemCount = await Item.countDocuments().catch(() => 0);
  itemsGauge.set(itemCount);
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json({ pod: process.env.MY_POD_NAME || 'unknown', count: items.length, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/items', async (req, res) => {
  try {
    const { name, description, priority } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const item = await Item.create({ name, description, priority });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/:id', async (req, res) => {
  try {
    const result = await Item.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'item not found' });
    res.json({ message: 'deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.json({ service: 'fullstack-backend', version: '1.0.0', pod: process.env.MY_POD_NAME || 'unknown' }));

const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
