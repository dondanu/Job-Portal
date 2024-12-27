const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // CORS import செய்கிறேன்
const userRoutes = require('./routes/userRoutes');
require('dotenv').config(); // Environment variables ஐ ஏற்றுங்கள்

const app = express();
const PORT = process.env.PORT || 3000;

// CORS ஐ enable செய்கிறோம்
app.use(cors()); 

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Time out after 5 seconds
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api', userRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Error Handling
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});