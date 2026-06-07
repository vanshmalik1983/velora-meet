const express = require('express');
const router = express.Router();
const { createRoom, getRoom, listRooms } = require('../controllers/roomController');
const authMiddleware = require('../config/authMiddleware');

router.post('/', authMiddleware, createRoom);
router.get('/', authMiddleware, listRooms);
router.get('/:roomId', authMiddleware, getRoom);

module.exports = router;
