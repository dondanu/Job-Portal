const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const Job = require('./models/Job'); // Job மாடல்
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS enablement
app.use(cors());

// Middleware
app.use(bodyParser.json());

// MongoDB இணைப்பு
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 விநாடிகளுக்கு பின்னர் சேவையகம் தொடர்பு கொள்ளவில்லை என செய்தி விடுதல்
})
  .then(() => console.log('MongoDB இணைக்கப்பட்டது'))
  .catch(err => console.error('MongoDB இணைப்பு பிழை:', err));

// **Job வழிகள்**
// GET /api/jobs - எல்லா வேலைகளையும் பெறுதல்
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find(); // DB-இல் இருந்து வேலைகளை பெறுதல்
    res.json(jobs);  // வேலைகளை JSON வடிவத்தில் காட்டுதல்
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/jobs - புதிய வேலை உருவாக்குதல்
app.post('/api/jobs', async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save(); // புதிய வேலை DB-இல் சேமிக்கப்படுதல்
    res.status(201).json(job); // சேமிக்கப்பட்ட வேலைக்கு பதிலளித்தல்
  } catch (err) {
    res.status(500).json({ error: 'வேலை சேர்க்க தவறியது' });
  }
});

// Static கோப்புகளை பரிமாறுதல்
app.use(express.static(path.join(__dirname, 'public')));

// Default Route (root-க்கு index.html சேவையை வழங்குதல்)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// பிழை மேலாண்மை
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// சேவையை தொடங்குதல்
app.listen(PORT, () => {
  console.log(`சேவை http://localhost:${PORT} என்ற முகவரியில் இயக்கப்படுகிறேன்`);
});
