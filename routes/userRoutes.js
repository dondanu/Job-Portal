const express = require('express');
const Joi = require('joi'); // சரிபார்ப்பு உத்தி
const User = require('../models/User'); // பயனர் மாடல்

const router = express.Router();

// **பயனரை சரிபார்க்கும் செயலி**
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(1).required(),
  });
  return schema.validate(data);
};

// **பயனரை உருவாக்குதல் (POST /api/users)**
router.post('/users', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **எல்லா பயனர்களையும் பெறுதல் (GET /api/users)**
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **ஒரு பயனரை ID மூலம் பெறுதல் (GET /api/users/:id)**
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'பயனர் கண்டறியப்படவில்லை' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **பயனரை புதுப்பித்தல் (PUT /api/users/:id)**
router.put('/users/:id', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'பயனர் கண்டறியப்படவில்லை' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **பயனரை அழித்தல் (DELETE /api/users/:id)**
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'பயனர் கண்டறியப்படவில்லை' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
