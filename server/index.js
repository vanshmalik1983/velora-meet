require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const { initSocket } = require('./socket/socketHandler');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// 🔥 DATABASE (IMPORTANT: await-safe startup)
const startServer = async () => {
  try {
    await connectDB();

    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Middleware
    app.use(cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }));

    app.use(express.json());

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/rooms', roomRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        message: 'Velora Meet server is running 🚀',
      });
    });

    // Socket
    initSocket(io);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Velora Meet server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

startServer();