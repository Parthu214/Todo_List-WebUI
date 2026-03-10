require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

const tasksRoute = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || '';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/tasks', tasksRoute);

app.get('/health', (req, res) => res.json({ ok: true, timestamp: Date.now() }));

// Always serve index.html for unhandled routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let memoryServer;

const startServer = async () => {
  try {
    const connection = MONGODB_URI || (await (async () => {
      memoryServer = await MongoMemoryServer.create();
      return memoryServer.getUri();
    })());

    await mongoose.connect(connection, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      if (!MONGODB_URI) {
        console.log('Using in-memory MongoDB (no MONGODB_URI provided)');
      }
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('If you want to use a local MongoDB instance, set MONGODB_URI in .env');
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
  process.exit(0);
});
