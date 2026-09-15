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
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Farmer', FarmerSchema);
