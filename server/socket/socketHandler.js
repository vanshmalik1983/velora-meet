const roomParticipants = new Map();

// roomId -> Map(socketId -> { userId, userName, socketId })

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── JOIN ROOM ─────────────────────────────
    socket.on('join-room', ({ roomId, userId, userName }) => {
      socket.join(roomId);

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map());
      }

      const participants = roomParticipants.get(roomId);

      participants.set(socket.id, {
        userId,
        userName,
        socketId: socket.id,
      });

      // notify others
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        userId,
        userName,
        participants: Array.from(participants.values()),
      });

      // send existing to new user
      socket.emit('existing-participants', {
        participants: Array.from(participants.values()).filter(
          p => p.socketId !== socket.id
        ),
      });

      // system message
      io.to(roomId).emit('chat-message', {
        id: Date.now(),
        system: true,
        text: `${userName} joined the room`,
        timestamp: new Date().toISOString(),
      });

      console.log(`👤 ${userName} joined room ${roomId}`);
    });

    // ─── WEBRTC SIGNALING ──────────────────────
    socket.on('webrtc-offer', ({ offer, targetSocketId, fromSocketId, fromUserName }) => {
      io.to(targetSocketId).emit('webrtc-offer', {
        offer,
        fromSocketId,
        fromUserName,
      });
    });

    socket.on('webrtc-answer', ({ answer, targetSocketId, fromSocketId }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        answer,
        fromSocketId,
      });
    });

    socket.on('webrtc-ice-candidate', ({ candidate, targetSocketId, fromSocketId }) => {
      io.to(targetSocketId).emit('webrtc-ice-candidate', {
        candidate,
        fromSocketId,
      });
    });

    // ─── CHAT ──────────────────────────────────
    socket.on('send-message', ({ roomId, message, userName, userId }) => {
      io.to(roomId).emit('chat-message', {
        id: Date.now(),
        system: false,
        text: message,
        userName,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    // ─── MEDIA STATE ───────────────────────────
    socket.on('media-state-change', ({ roomId, audioEnabled, videoEnabled }) => {
      socket.to(roomId).emit('peer-media-state-change', {
        socketId: socket.id,
        audioEnabled,
        videoEnabled,
      });
    });

    // ─── LEAVE ROOM ────────────────────────────
    const handleLeave = (roomId) => {
      if (!roomId) return;

      const participants = roomParticipants.get(roomId);
      if (!participants) return;

      const user = participants.get(socket.id);
      participants.delete(socket.id);

      if (participants.size === 0) {
        roomParticipants.delete(roomId);
      }

      if (user) {
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          userName: user.userName,
        });

        io.to(roomId).emit('chat-message', {
          id: Date.now(),
          system: true,
          text: `${user.userName} left the room`,
          timestamp: new Date().toISOString(),
        });
      }
    };

    socket.on('leave-room', ({ roomId }) => {
      handleLeave(roomId);
      socket.leave(roomId);
    });

    socket.on('disconnecting', () => {
      const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
      rooms.forEach(handleLeave);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };