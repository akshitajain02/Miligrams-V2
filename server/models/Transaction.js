const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  cropType: {
    type: String,
    default: ''
  },
  buyerId: {
    type: String,
    required: true
  },
  buyerName: {
    type: String,
    default: ''
  },
  farmerId: {
    type: String,
    required: true
  },
  farmerName: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount (INR) is required']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  blockHash: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);
