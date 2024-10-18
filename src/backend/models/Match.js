const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  location: { type: String, required: true }, // Location of the match
  date: { type: Date, required: true }, // Date of the match
  time: { type: String, required: true }, // Time in HH:MM format
  playersNeeded: {
    type: Number,
    default: 10, // Default 10 players needed
  },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the creator (User ID)
  creatorName: { type: String, required: false, }, // Name of the creator, optional
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs (references)

  // Additional Fields
  isExpired: { type: Boolean, default: false } // Mark the match as expired
});

// Add a pre-save hook to check and update `isExpired` based on the date and time
matchSchema.pre('save', function (next) {
  const currentDate = new Date();
  const matchDate = new Date(this.date);

  // Check if the match date and time have already passed
  if (matchDate < currentDate || (matchDate.getTime() === currentDate.getTime() && this.time < currentDate.toTimeString().split(' ')[0])) {
    this.isExpired = true; // Mark the match as expired
  }

  next();
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;

