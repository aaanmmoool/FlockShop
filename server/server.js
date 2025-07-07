const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import routes
const authRoutes = require('./routes/auth');
const wishlistRoutes = require('./routes/wishlists');
const templateRoutes = require('./routes/templates');
const invitationRoutes = require('./routes/invitations');
const userRoutes = require('./routes/users');
const uploadRoute = require('./routes/upload');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoute);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-wishlist', (wishlistId) => {
    socket.join(wishlistId);
    console.log(`User ${socket.id} joined wishlist ${wishlistId}`);
  });

  socket.on('leave-wishlist', (wishlistId) => {
    socket.leave(wishlistId);
    console.log(`User ${socket.id} left wishlist ${wishlistId}`);
  });

  socket.on('product-added', (data) => {
    socket.to(data.wishlistId).emit('product-added', data);
  });

  socket.on('product-updated', (data) => {
    socket.to(data.wishlistId).emit('product-updated', data);
  });

  socket.on('product-deleted', (data) => {
    socket.to(data.wishlistId).emit('product-deleted', data);
  });

  socket.on('comment-added', (data) => {
    socket.to(data.wishlistId).emit('comment-added', data);
  });

  socket.on('comment-deleted', (data) => {
    socket.to(data.wishlistId).emit('comment-deleted', data);
  });

  socket.on('reaction-added', (data) => {
    socket.to(data.wishlistId).emit('reaction-added', data);
  });

  socket.on('reaction-removed', (data) => {
    socket.to(data.wishlistId).emit('reaction-removed', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 