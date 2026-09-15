const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');

/**
 * @route   POST /api/farmers/register
 * @desc    Register a new farmer in the system
 */
router.post('/register', async (req, res) => {
  try {
    const { name, uniqueId, contact, location } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Farmer name is required' });
    }

    // Generate unique ID if not explicitly provided
    const farmerId = uniqueId && uniqueId.trim() !== '' 
      ? uniqueId.trim() 
      : `FARMER-${Math.floor(100 + Math.random() * 900)}`;

    const existing = await Farmer.findOne({ uniqueId: farmerId });
    if (existing) {
      return res.status(400).json({ success: false, message: `Farmer with ID ${farmerId} already exists.` });
    }

    const newFarmer = await Farmer.create({
      name,
      uniqueId: farmerId,
      contact: contact || '',
      location: location || 'Punjab, India',
      cropsOwned: []
    });

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      farmer: newFarmer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/farmers
 * @desc    Get all registered farmers
 */
router.get('/', async (req, res) => {
  try {
    const farmers = await Farmer.find().populate('cropsOwned').sort({ createdAt: -1 });
    res.json({ success: true, farmers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/farmers/:id
 * @desc    Get single farmer by uniqueId or ObjectId
 */
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let farmer = await Farmer.findOne({ uniqueId: id }).populate('cropsOwned');
    if (!farmer && id.match(/^[0-9a-fA-F]{24}$/)) {
      farmer = await Farmer.findById(id).populate('cropsOwned');
    }

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    res.json({ success: true, farmer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
