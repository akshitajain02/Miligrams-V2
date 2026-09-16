const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true
  },
  uniqueId: {
    type: String,
    required: [true, 'Farmer unique ID is required'],
    unique: true,
    trim: true
  },
  contact: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: 'Punjab, India'
  },
  cropsOwned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  }],
  // KYC Authentication Fields (AgriStack, Aadhaar, Khatauni)
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  agriStackId: {
    type: String,
    trim: true,
    default: ''
  },
  aadhaarNumber: {
    type: String,
    trim: true,
    default: ''
  },
  photoUrl: {
    type: String,
    default: ''
  },
  khatauniNumber: {
    type: String,
    trim: true,
    default: ''
  },
  kycSubmittedAt: {
    type: Date,
    default: Date.now
  },
  kycReviewedAt: {
    type: Date,
    default: null
  },
  kycRejectionReason: {
    type: String,
    default: ''
  },
  // Rating & Review System
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    buyerId: { type: String, required: true },
    buyerName: { type: String, default: 'Mandi Buyer' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    cropType: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Farmer', FarmerSchema);
