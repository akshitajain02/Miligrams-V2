const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');

/**
 * @route   POST /api/farmers/register
 * @desc    Register a new farmer in the system
 */
router.post('/register', async (req, res) => {
  try {
    const { name, uniqueId, contact, location, agriStackId, aadhaarNumber, photoUrl, khatauniNumber } = req.body;

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

    let cleanContact = '';
    if (contact) {
      cleanContact = contact.toString().replace(/\D/g, '').slice(0, 10);
      if (contact.toString().replace(/\D/g, '').length > 10) {
        return res.status(400).json({ success: false, message: 'Contact number must not exceed 10 digits.' });
      }
    }

    const newFarmer = await Farmer.create({
      name,
      uniqueId: farmerId,
      contact: cleanContact,
      location: location || 'Punjab, India',
      agriStackId: agriStackId || `AGRI-IN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      aadhaarNumber: aadhaarNumber || '',
      photoUrl: photoUrl || '',
      khatauniNumber: khatauniNumber || '',
      kycStatus: 'pending',
      kycSubmittedAt: new Date(),
      rating: 5.0,
      totalReviews: 0,
      reviews: [],
      cropsOwned: []
    });

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully. KYC verification is pending review.',
      farmer: newFarmer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/farmers/:id/kyc-submit
 * @desc    Farmer submits or updates KYC documents
 */
router.put('/:id/kyc-submit', async (req, res) => {
  try {
    const id = req.params.id;
    let farmer = await Farmer.findOne({ uniqueId: id });
    if (!farmer && id.match(/^[0-9a-fA-F]{24}$/)) {
      farmer = await Farmer.findById(id);
    }

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const { agriStackId, aadhaarNumber, photoUrl, khatauniNumber, name, contact, location } = req.body;

    if (agriStackId) farmer.agriStackId = agriStackId;
    if (aadhaarNumber) farmer.aadhaarNumber = aadhaarNumber;
    if (photoUrl) farmer.photoUrl = photoUrl;
    if (khatauniNumber) farmer.khatauniNumber = khatauniNumber;
    if (name) farmer.name = name;
    if (contact) {
      if (contact.toString().replace(/\D/g, '').length > 10) {
        return res.status(400).json({ success: false, message: 'Contact number must not exceed 10 digits.' });
      }
      farmer.contact = contact.toString().replace(/\D/g, '').slice(0, 10);
    }
    if (location) farmer.location = location;

    farmer.kycStatus = 'pending';
    farmer.kycSubmittedAt = new Date();
    farmer.kycRejectionReason = '';

    await farmer.save();

    res.json({
      success: true,
      message: 'KYC documents submitted successfully. Verification status: Pending.',
      farmer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/farmers/:id/kyc-status
 * @desc    Admin marks farmer KYC as verified or rejected
 */
router.put('/:id/kyc-status', async (req, res) => {
  try {
    const id = req.params.id;
    const { status, rejectionReason } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid KYC status' });
    }

    let farmer = await Farmer.findOne({ uniqueId: id });
    if (!farmer && id.match(/^[0-9a-fA-F]{24}$/)) {
      farmer = await Farmer.findById(id);
    }

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    farmer.kycStatus = status;
    farmer.kycReviewedAt = new Date();
    if (status === 'rejected') {
      farmer.kycRejectionReason = rejectionReason || 'Documents could not be verified.';
    } else if (status === 'verified') {
      farmer.kycRejectionReason = '';
    }

    await farmer.save();

    res.json({
      success: true,
      message: `Farmer KYC status updated to ${status}.`,
      farmer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/farmers/:id/review
 * @desc    Buyer rates and reviews a farmer
 */
router.post('/:id/review', async (req, res) => {
  try {
    const id = req.params.id;
    const { buyerId, buyerName, rating, comment, cropType } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }

    let farmer = await Farmer.findOne({ uniqueId: id });
    if (!farmer && id.match(/^[0-9a-fA-F]{24}$/)) {
      farmer = await Farmer.findById(id);
    }

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const reviewEntry = {
      buyerId: buyerId || 'ANON-BUYER',
      buyerName: buyerName || 'Mandi Merchant',
      rating: numRating,
      comment: comment || '',
      cropType: cropType || '',
      createdAt: new Date()
    };

    farmer.reviews.push(reviewEntry);
    farmer.totalReviews = farmer.reviews.length;

    // Compute updated average rating
    const totalScore = farmer.reviews.reduce((acc, r) => acc + r.rating, 0);
    farmer.rating = Number((totalScore / farmer.totalReviews).toFixed(1));

    await farmer.save();

    res.status(201).json({
      success: true,
      message: 'Review recorded successfully! Farmer rating updated.',
      farmer: {
        uniqueId: farmer.uniqueId,
        name: farmer.name,
        rating: farmer.rating,
        totalReviews: farmer.totalReviews,
        reviews: farmer.reviews
      }
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
