const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Job = require('./models/Job'); // Job model
const User = require('./models/User'); // User model

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ** Job routes **

// GET /api/jobs - Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/jobs - Create a new job
app.post('/api/jobs', async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error('Error adding job:', err);
    res.status(500).json({ error: 'Error adding job' });
  }
});

// GET /api/jobs/:id - Get job by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error('Error fetching job:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/jobs/search - Search for jobs based on filters
app.post('/api/jobs/search', async (req, res) => {
  const { keyword, minSalary, maxSalary, location, company } = req.body;

  try {
    const filters = {};

    // Add filters dynamically based on the provided data
    if (keyword) {
      filters.title = { $regex: keyword, $options: 'i' }; // Case-insensitive search
    }
    if (minSalary || maxSalary) {
      filters.salary = {};
      if (minSalary) filters.salary.$gte = Number(minSalary);
      if (maxSalary) filters.salary.$lte = Number(maxSalary);
    }
    if (location) {
      filters.location = { $regex: location, $options: 'i' }; // Case-insensitive search
    }
    if (company) {
      filters.company = { $regex: company, $options: 'i' }; // Case-insensitive search
    }

    const jobs = await Job.find(filters);
    res.json(jobs);
  } catch (err) {
    console.error('Error searching jobs:', err);
    res.status(500).json({ error: 'Error searching jobs' });
  }
});

// ** User routes **

// POST /api/users - Register a new user
app.post(
  '/api/users',
  [
    body('name').isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ error: 'This email is already registered' });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({ ...req.body, password: hashedPassword });
      await user.save();
      res.status(201).json(user);
    } catch (err) {
      console.error('User registration error:', err);
      res.status(500).json({ error: 'Unable to register user' });
    }
  }
);

// POST /api/login - User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No user found with that email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Default Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
