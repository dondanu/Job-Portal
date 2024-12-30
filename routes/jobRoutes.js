const express = require('express');
const Joi = require('joi');
const Job = require('../models/Job'); // Job model

const router = express.Router();

// Validate Job Data
const validateJob = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    company: Joi.string().min(3).required(),
    location: Joi.string().min(3).required(),
    salary: Joi.number().optional(),
    skills: Joi.array().items(Joi.string()).optional(),
  });
  return schema.validate(data);
};

// POST /api/jobs - Create a new job
router.post('/jobs', async (req, res) => {
  const { error } = validateJob(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs - Fetch all jobs
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/:id - Fetch a job by ID
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/jobs/:id - Update a job by ID
router.put('/jobs/:id', async (req, res) => {
  const { error } = validateJob(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/jobs/:id - Delete a job by ID
router.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
