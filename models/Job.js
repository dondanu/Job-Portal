const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number },
  skills: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);