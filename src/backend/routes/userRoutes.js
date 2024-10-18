const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const Match = require('../models/Match');  // Ensure the path is correct based on your project structure
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path'); 
const fs = require('fs'); 



// Register a new user
router.post('/register', async (req, res) => {
  const { email, fullname, password, birthdate, level } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Validate the level
    if (!['Good', 'Medium', 'Mediocre'].includes(level)) {
      return res.status(400).json({ error: 'Invalid level. Choose between Good, Medium, or Mediocre.' });
    }

    // Create and save the new user
    const newUser = new User({ fullname, email, password, birthdate, level });
    await newUser.save();

    res.status(201).json({ message: 'Account created successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});


// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    // If user is not found or password is incorrect
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // If login is successful, create a token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30m' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude the password field for security
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
//delete
router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id; // Extract the user ID from the URL

  try {
    const user = await User.findByIdAndDelete(userId); // Find the user by ID and delete
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


// Get a user by ID
router.get('/users/:id', async (req, res) => {
  const userId = req.params.id; // Extract the user ID from the URL

  try {
    const user = await User.findById(userId, '-password'); // Find user by ID and exclude password
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user); // Return the found user
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});



// PUT route to update user profile
router.put('/update/:userId', async (req, res) => {
  const { userId } = req.params;
  const { fullname, email, birthdate, password } = req.body;

  try {
    const updatedData = { fullname, email, birthdate };

    // If password is provided, hash it and update it
    if (password) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/:userId/joined-matches', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Ensure userId is valid
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Find matches where the user is a participant
    const matches = await Match.find({ participants: userId });
    
    if (matches.length === 0) {
      return res.status(404).json({ error: 'No joined matches found for this user' });
    }

    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching joined matches:', error);
    res.status(500).json({ error: 'Failed to fetch joined matches' });
  }
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, './uploads'));  // <-- Set the destination to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // <-- Generate unique filenames
  }
});

const upload = multer({ storage: storage });

// Route to upload user profile photo
router.post('/:id/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Save only the file name (not the full path) to the user's profile
    user.photo = req.file.filename;  // Save only the filename
    await user.save();

    res.json({ message: 'Photo uploaded successfully', photo: req.file.filename });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Route to delete user profile photo
router.delete('/:id/delete-photo', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.photo) {
      return res.status(400).json({ error: 'No profile photo to delete' });
    }

    const photoPath = path.join(__dirname, './uploads/', user.photo); // Build the path to the photo

    // Delete the photo from the filesystem
    fs.unlink(photoPath, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete photo from filesystem' });
      }

      // Remove the photo reference from the user's document
      user.photo = undefined;
      await user.save();

      res.json({ message: 'Profile photo deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    res.status(500).json({ error: 'Failed to delete profile photo' });
  }
});

// Route to delete all users
router.delete('/delete-all-users', async (req, res) => {
  try {
    await User.deleteMany({});  // This will delete all users
    res.status(200).json({ message: 'All users deleted successfully' });
  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).json({ error: 'Failed to delete all users' });
  }
});
module.exports = router;

