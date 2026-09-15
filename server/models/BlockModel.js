const mongoose = require('mongoose');

const BlockModelSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true,
    unique: true
  },
  timestamp: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  previousHash: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  merkleRoot: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Block', BlockModelSchema);
