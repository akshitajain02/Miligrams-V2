const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  warehouseId: {
    type: String,
    required: [true, 'Warehouse ID is required'],
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Warehouse location is required'],
    trim: true
  },
  capacity: {
    type: Number,
    default: 10000 // In metric kg
  },
  cropsStored: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Warehouse', WarehouseSchema);
