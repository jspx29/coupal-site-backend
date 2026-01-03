const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  movieTitle: {
    type: String,
    required: true,
  },
  jasperRating: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  gianneRating: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Movie', MovieSchema);
