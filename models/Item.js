const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['movies', 'places', 'things'],
    required: true,
  },
  status: {
    type: String,
    enum: ['todo', 'done'],
    default: 'todo',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Item', ItemSchema);
