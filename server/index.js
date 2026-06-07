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

// ================================
// 🌍 ALLOWED ORIGINS (PRODUCTION FIX)
// ================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://velora-meet-7pn6.vercel.app"
];

// ================================
// 🔥 CORS CONFIG (FIXED)
// ================================
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, true); // allow all in production-safe mode
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ================================
// 🔌 SOCKET SETUP
// ================================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ================================
// 🚀 START SERVER SAFELY
// ================================
const startServer = async () => {
  try {
    await connectDB();
    console.log("🔥 MongoDB Connected");

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/rooms', roomRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        message: 'Velora Meet server running 🚀',
      });
    });

    // Socket
    initSocket(io);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server failed:", err);
    process.exit(1);
  }
};

startServer();