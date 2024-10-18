const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },  // ID of the match room
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the user
  message: { type: String, required: true },  // Chat message content
  timestamp: { type: Date, default: Date.now }  // When the message was sent
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
