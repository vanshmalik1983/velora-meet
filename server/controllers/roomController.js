const { v4: uuidv4 } = require('uuid');
const Room = require('../models/room');

// CREATE ROOM
const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    const roomId = uuidv4().slice(0, 8).toUpperCase();

    const room = await Room.create({
      id: roomId,
      name: name?.trim() || `Room ${roomId}`,
      host: req.user.id,
      hostName: req.user.name,
      participants: [],
    });

    return res.status(201).json({
      success: true,
      room,
    });

  } catch (error) {
    console.error("Create Room Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create room",
    });
  }
};

// GET SINGLE ROOM
const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ id: roomId.toUpperCase() });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    return res.json({
      success: true,
      room,
    });

  } catch (error) {
    console.error("Get Room Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch room",
    });
  }
};

// LIST ALL ROOMS
const listRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });

    const allRooms = rooms.map(r => ({
      id: r.id,
      name: r.name,
      hostName: r.hostName,
      participants: r.participants?.length || 0,
      createdAt: r.createdAt,
    }));

    return res.json({
      success: true,
      rooms: allRooms,
    });

  } catch (error) {
    console.error("List Rooms Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
    });
  }
};

module.exports = { createRoom, getRoom, listRooms };