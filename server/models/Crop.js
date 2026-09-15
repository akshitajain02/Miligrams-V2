const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  cropType: {
    type: String,
    required: [true, 'Crop type is required (e.g. Wheat, Rice, Corn)'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity (in kg) is required'],
    min: [0, 'Quantity cannot be negative']
  },
  harvestDate: {
    type: Date,
    required: [true, 'Harvest date is required']
  },
  qualityStatus: {
    type: String,
    enum: ['Grade A', 'Grade B', 'Grade C', 'Organic Premium', 'Standard'],
    default: 'Grade A'
  },
  farmerId: {
    type: String,
    required: [true, 'Farmer ID is required'],
    trim: true
  },
  farmerName: {
    type: String,
    trim: true,
    default: 'Independent Farmer'
  },
  currentStage: {
    type: String,
    enum: ['farm', 'warehouse', 'sold'],
    default: 'farm'
  },
  currentWarehouseId: {
    type: String,
    default: null
  },
  currentBuyerId: {
    type: String,
    default: null
  },
  blockHash: {
    type: String,
    default: ''
  },
  // Extended Verification Cycle & Aging Fields
  listedDate: {
    type: Date,
    default: Date.now
  },
  lastVerifiedDate: {
    type: Date,
    default: Date.now
  },
  verificationCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['listed', 'aged-relisted', 'sold', 'unsellable'],
    default: 'listed'
  },
  suggestedPriceDrop: {
    type: Boolean,
    default: false
  },
  discountPercent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Crop', CropSchema);
