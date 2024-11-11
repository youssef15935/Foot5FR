const express = require('express');
const Match = require('../models/Match');  
const router = express.Router();
const User = require('../models/User');  
const mongoose = require('mongoose');
const cron = require('node-cron');
const Message = require('../models/Message');

// Route to fetch all available matches
router.get('/matches/available', async (req, res) => {
  try {
    const matches = await Match.find({ playersNeeded: { $gt: 0 } })
      .populate('creatorId', 'fullname'); // Populate creatorId with the user's fullname

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Route to fetch a single match by ID
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

// Route to join a match and reduce playersNeeded
router.put('/join/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    const userId = req.body.userId;

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if the user is the creator of the match
    if (match.creatorId && match.creatorId.toString() === userId) {
      return res.status(400).json({ error: 'You cannot join a match you created' });
    }

    // Check if the user is already a participant
    if (match.participants.includes(userId)) {
      return res.status(400).json({ error: 'You have already joined this match' });
    }

    // Check if there are enough spots (max 10 players)
    if (match.playersNeeded > 0) {
      match.playersNeeded -= 1;
      match.participants.push(userId);
      await match.save();
      res.status(200).json(match);
    } else {
      return res.status(400).json({ error: 'Match is full, no more players can join' });
    }
  } catch (error) {
    console.error('Error joining match:', error);
    res.status(500).json({ error: 'Failed to join match' });
  }
});






// Route to create a new match with creator info
router.post('/create', async (req, res) => {
  const { location, date, time, playersNeeded, creatorId, creatorName } = req.body;

  if (!creatorId) {
    return res.status(400).json({ error: 'Creator ID is required' });
  }

  try {
    const newMatch = new Match({
      location,
      date,
      time,
      playersNeeded,
      creatorId,      
      creatorName,    
      participants: [creatorId] 
    });

    await newMatch.save();
    res.status(201).json(newMatch);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
});


// Route to quit a match and increase playersNeeded
router.put('/quit/:id', async (req, res) => {
  const { id } = req.params; // Match ID
  const { userId } = req.body; // User ID
  
  try {
    const match = await Match.findById(id);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Remove the user from the participants array
    match.participants = match.participants.filter(participant => participant.toString() !== userId);

    // Increment the playersNeeded count
    match.playersNeeded += 1;

    await match.save(); // Save the updated match to the database
    
    res.status(200).json({ message: 'Successfully quit the match', match });
  } catch (error) {
    console.error('Error quitting match:', error);
    res.status(500).json({ error: 'Failed to quit the match' });
  }
});

// Route to delete all matches for test only
router.delete('/delete-all-matches', async (req, res) => {
  try {
    await Match.deleteMany({});  // Deletes all matches
    res.status(200).json({ message: 'All matches deleted successfully' });
  } catch (error) {
    console.error('Error deleting matches:', error);
    res.status(500).json({ error: 'Failed to delete all matches' });
  }
});



cron.schedule('*/1 * * * * *', async () => { // Runs every 10 seconds
  const now = new Date();

  try {
    // Fetch all matches that have a date in the past or a time that's passed today
    const matches = await Match.find({
      date: { $lte: now }
    });

    const matchesToDelete = matches.filter(match => {
      const matchDate = new Date(match.date);
      const [hours, minutes] = match.time.split(':'); // Extract hours and minutes from the stored time
      matchDate.setHours(hours, minutes, 0, 0); // Set the correct time on the matchDate

      return matchDate < now; // Check if the match date and time are in the past
    });

    if (matchesToDelete.length > 0) {
      const result = await Match.deleteMany({ _id: { $in: matchesToDelete.map(m => m._id) } });
      console.log(`${result.deletedCount} expired match(es) deleted.`);
    } 
  } catch (error) {
    console.error('Error deleting expired matches:', error);
  }
}); 



// Route to fetch a single match by ID and populate the creatorId
router.get('/matches/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate('creatorId', 'fullname'); // Populate creatorId with fullname
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});


//get the partifipants by matchID
// Fetch participants of a match and include their level
router.get('/:matchId/participants', async (req, res) => {
  const { matchId } = req.params;

  // Validate matchId before querying the database
  if (!mongoose.Types.ObjectId.isValid(matchId)) {
    return res.status(400).json({ error: 'Invalid match ID' });
  }

  try {
    const match = await Match.findById(matchId).populate('participants', 'fullname email birthdate level'); // Include level
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.status(200).json(match.participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});



// Route to fetch matches created by a specific user (My Matches)
router.get('/matches/mymatches/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const myMatches = await Match.find({ creatorId: userId }).populate('participants', 'fullname email');
    res.status(200).json(myMatches);
  } catch (error) {
    console.error('Error fetching user matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});
// Fetch messages for a specific room (match)
router.get('/matches/:matchId/messages', async (req, res) => {
  const { matchId } = req.params;
  
  try {
    const messages = await Message.find({ roomId: matchId }).populate('userId', 'fullname'); // Populate user data
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
