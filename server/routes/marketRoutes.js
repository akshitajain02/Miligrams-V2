const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const Buyer = require('../models/Buyer');
const Transaction = require('../models/Transaction');
const BlockModel = require('../models/BlockModel');
const { miligramsBlockchain } = require('../blockchain/blockchain');

/**
 * @route   GET /api/marketplace/browse
 * @desc    Browse all crops available for purchase (farm or warehouse stages)
 */
router.get('/browse', async (req, res) => {
  try {
    // Return all crops that are not yet marked as 'sold'
    const availableCrops = await Crop.find({ currentStage: { $ne: 'sold' } }).sort({ createdAt: -1 });
    const soldCrops = await Crop.find({ currentStage: 'sold' }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: availableCrops.length,
      crops: availableCrops,
      soldCount: soldCrops.length,
      soldCrops
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/marketplace/purchase
 * @desc    Buyer purchases a crop; updates stage to 'sold' and mints transaction block on blockchain
 */
router.post('/purchase', async (req, res) => {
  try {
    const { cropId, buyerId, amount } = req.body;

    if (!cropId || !buyerId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'cropId, buyerId, and amount are required'
      });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    if (crop.currentStage === 'sold') {
      return res.status(400).json({ success: false, message: 'This crop has already been sold.' });
    }

    let buyer = await Buyer.findOne({ uniqueId: buyerId });
    if (!buyer) {
      buyer = await Buyer.create({
        name: 'Spot Commodity Buyer',
        uniqueId: buyerId,
        contact: '',
        purchaseHistory: []
      });
    }

    // 1. Create Transaction record
    const transaction = await Transaction.create({
      cropId: crop._id,
      cropType: crop.cropType,
      buyerId: buyer.uniqueId,
      buyerName: buyer.name,
      farmerId: crop.farmerId,
      farmerName: crop.farmerName,
      amount: Number(amount),
      status: 'completed',
      timestamp: new Date()
    });

    // 2. Mint blockchain purchase block
    const blockPayload = {
      action: 'CROP_PURCHASED_AND_SETTLED',
      transactionId: transaction._id.toString(),
      cropId: crop._id.toString(),
      cropType: crop.cropType,
      quantity: crop.quantity,
      buyerId: buyer.uniqueId,
      buyerName: buyer.name,
      farmerId: crop.farmerId,
      amountInINR: Number(amount),
      stage: 'sold',
      settlementTimestamp: transaction.timestamp.toISOString()
    };

    const newBlock = miligramsBlockchain.addBlock(blockPayload);

    // 3. Update transaction & crop
    transaction.blockHash = newBlock.hash;
    await transaction.save();

    crop.currentStage = 'sold';
    crop.currentBuyerId = buyer.uniqueId;
    crop.blockHash = newBlock.hash;
    await crop.save();

    // 4. Update buyer purchase history
    buyer.purchaseHistory.push({
      cropId: crop._id,
      cropType: crop.cropType,
      quantity: crop.quantity,
      amount: Number(amount),
      blockHash: newBlock.hash,
      date: new Date()
    });
    await buyer.save();

    // 5. Persist block in database
    await BlockModel.create({
      index: newBlock.index,
      timestamp: newBlock.timestamp,
      data: newBlock.data,
      previousHash: newBlock.previousHash,
      hash: newBlock.hash,
      merkleRoot: newBlock.merkleRoot
    });

    res.json({
      success: true,
      message: `Purchase completed successfully! Block #${newBlock.index} permanently recorded on blockchain.`,
      transaction,
      crop,
      block: newBlock
    });

  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/marketplace/buyers
 * @desc    Get all registered buyers
 */
router.get('/buyers', async (req, res) => {
  try {
    const buyers = await Buyer.find().sort({ createdAt: -1 });
    res.json({ success: true, buyers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/marketplace/buyers/register
 * @desc    Register a new buyer
 */
router.post('/buyers/register', async (req, res) => {
  try {
    const { name, uniqueId, contact, organization } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Buyer name is required' });
    }

    const buyerId = uniqueId || `BUYER-${Math.floor(100 + Math.random() * 900)}`;
    const buyer = await Buyer.create({
      name,
      uniqueId: buyerId,
      contact: contact || '',
      organization: organization || 'Agri Merchant'
    });

    res.status(201).json({ success: true, message: 'Buyer registered', buyer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
