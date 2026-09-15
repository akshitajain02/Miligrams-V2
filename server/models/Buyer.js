const mongoose = require('mongoose');

const BuyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Buyer name is required'],
    trim: true
  },
  uniqueId: {
    type: String,
    required: [true, 'Buyer unique ID is required'],
    unique: true,
    trim: true
  },
  contact: {
    type: String,
    trim: true,
    default: ''
  },
  organization: {
    type: String,
    trim: true,
    default: 'Agri-Commodities Trader'
  },
  purchaseHistory: [{
    cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    cropType: String,
    quantity: Number,
    amount: Number,
    blockHash: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Buyer', BuyerSchema);
