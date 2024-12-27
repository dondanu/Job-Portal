const mongoose = require('mongoose');

// பயனர் ஸ்கீமா
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
});

// பயனர் மாடல்
module.exports = mongoose.model('User', userSchema);
