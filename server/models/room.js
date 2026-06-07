const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  host: String,
  hostName: String,
  participants: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Room', RoomSchema);