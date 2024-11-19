require('dotenv').config();
const express = require('express');
const http = require('http'); // Required for socket.io
const { Server } = require('socket.io'); // Socket.io server
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes');

const path = require('path');
const Message = require('./models/Message'); // MongoDB model for messages
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
const server = http.createServer(app); // Create server using HTTP for Socket.io

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
  }
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  // Handle user joining a specific match chat room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId); // Join the specific chat room
    console.log(`User joined room: ${roomId}`);
  });

  // Handle new chat message
  socket.on('chatMessage', async (data) => {
    const { roomId, userId, message } = data;

    try {
      // Fetch the user's fullname using the userId
      const user = await User.findById(userId);
      
      // Save the message in MongoDB 
      const newMessage = new Message({
        roomId,
        userId,
        message,
        timestamp: new Date(),
      });
      await newMessage.save();

      // Emit the message with the user's full name to everyone in the room
      io.to(roomId).emit('message', {
        username: user.fullname, // Emit fullname instead of userId
        message,
        timestamp: new Date(),
      });

    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// API routes for users and matches
app.use('/api', userRoutes);
app.use('/api', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);

// Serve static files for image uploads (profile photos, etc.)
app.use('/uploads', express.static(path.join(__dirname, './routes/uploads/')));

// Port for the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
