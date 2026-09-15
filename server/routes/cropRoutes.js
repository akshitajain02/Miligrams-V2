const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const Farmer = require('../models/Farmer');
const BlockModel = require('../models/BlockModel');
const { miligramsBlockchain } = require('../blockchain/blockchain');

/**
 * @route   POST /api/crops/upload
 * @desc    Upload crop details, automatically create and append a new block to the blockchain ledger
 */
router.post('/upload', async (req, res) => {
  try {
    const { cropType, quantity, harvestDate, qualityStatus, farmerId, farmerName } = req.body;

    if (!cropType || !quantity || !harvestDate || !farmerId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: cropType, quantity, harvestDate, and farmerId are required.'
      });
    }

    // Lookup farmer details for linkage
    let resolvedFarmerName = farmerName || 'Farmer';
    const farmerRecord = await Farmer.findOne({ uniqueId: farmerId });
    if (farmerRecord && farmerRecord.name) {
      resolvedFarmerName = farmerRecord.name;
    }

    // 1. Create crop in MongoDB with initial status 'listed' and stage 'farm'
    const newCrop = new Crop({
      cropType,
      quantity: Number(quantity),
      harvestDate: new Date(harvestDate),
      qualityStatus: qualityStatus || 'Grade A',
      farmerId,
      farmerName: resolvedFarmerName,
      currentStage: 'farm',
      listedDate: new Date(),
      lastVerifiedDate: new Date(),
      verificationCount: 0,
      status: 'listed',
      suggestedPriceDrop: false,
      discountPercent: 0
    });

    await newCrop.save();

    // 2. Mint a new immutable Block in the custom blockchain module
    const blockPayload = {
      action: 'CROP_HARVESTED_AND_REGISTERED',
      cropId: newCrop._id.toString(),
      cropType: newCrop.cropType,
      quantity: newCrop.quantity,
      harvestDate: newCrop.harvestDate.toISOString(),
      qualityStatus: newCrop.qualityStatus,
      farmerId: newCrop.farmerId,
      farmerName: newCrop.farmerName,
      stage: 'farm',
      status: 'listed',
      listedDate: newCrop.listedDate.toISOString(),
      metadata: {
        recordedBy: 'Miligrams Farm Gate Portal',
        clientIp: req.ip || '127.0.0.1'
      }
    };

    const newBlock = miligramsBlockchain.addBlock(blockPayload);

    // 3. Attach block hash to the crop document
    newCrop.blockHash = newBlock.hash;
    await newCrop.save();

    // 4. Update farmer's cropsOwned array
    if (farmerRecord) {
      farmerRecord.cropsOwned.push(newCrop._id);
      await farmerRecord.save();
    }

    // 5. Persist block in MongoDB Block collection
    await BlockModel.create({
      index: newBlock.index,
      timestamp: newBlock.timestamp,
      data: newBlock.data,
      previousHash: newBlock.previousHash,
      hash: newBlock.hash,
      merkleRoot: newBlock.merkleRoot
    });

    res.status(201).json({
      success: true,
      message: 'Crop registered and permanently minted onto the blockchain ledger!',
      crop: newCrop,
      block: {
        index: newBlock.index,
        timestamp: newBlock.timestamp,
        hash: newBlock.hash,
        previousHash: newBlock.previousHash,
        merkleRoot: newBlock.merkleRoot,
        data: newBlock.data
      }
    });

  } catch (error) {
    console.error('Crop upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/crops/check-aging
 * @desc    Checks unsold crops for 15-day aging cycles and mints re-verification blocks
 */
router.get('/check-aging', async (req, res) => {
  try {
    const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
    const now = new Date();

    // Find all unsold active crops
    const crops = await Crop.find({
      status: { $in: ['listed', 'aged-relisted'] },
      currentStage: { $ne: 'sold' }
    });

    const updatedCrops = [];
    let reverifiedCount = 0;
    let unsellableCount = 0;

    for (const crop of crops) {
      let changed = false;
      let newBlock = null;

      // Cycle 1: Listed for 15+ days without sale -> mark aged-relisted with 20% price drop
      if (crop.status === 'listed') {
        const timeDiff = now.getTime() - new Date(crop.listedDate || crop.createdAt).getTime();
        if (timeDiff >= FIFTEEN_DAYS_MS) {
          crop.verificationCount += 1;
          crop.lastVerifiedDate = now;
          crop.status = 'aged-relisted';
          crop.suggestedPriceDrop = true;
          crop.discountPercent = 20;

          // Mint blockchain re-verification block
          newBlock = miligramsBlockchain.addBlock({
            action: 'CROP_REVERIFIED_AGING',
            cropId: crop._id.toString(),
            cropType: crop.cropType,
            event: 're-verification',
            newStatus: 'aged-relisted',
            verificationCount: crop.verificationCount,
            suggestedPriceDrop: true,
            discountPercent: 20,
            originalListedDate: crop.listedDate,
            reverifiedAt: now.toISOString(),
            reason: 'Crop remained unsold 15 days past listing. Quality re-verified with 20% suggested price drop.'
          });

          changed = true;
          reverifiedCount++;
        }
      } 
      // Cycle 2: Already aged-relisted for another 15+ days -> mark unsellable
      else if (crop.status === 'aged-relisted') {
        const timeDiff = now.getTime() - new Date(crop.lastVerifiedDate).getTime();
        if (timeDiff >= FIFTEEN_DAYS_MS) {
          crop.verificationCount += 1;
          crop.lastVerifiedDate = now;
          crop.status = 'unsellable';

          // Mint blockchain unsellable block
          newBlock = miligramsBlockchain.addBlock({
            action: 'CROP_MARKED_UNSELLABLE',
            cropId: crop._id.toString(),
            cropType: crop.cropType,
            event: 'crop_expired',
            newStatus: 'unsellable',
            verificationCount: crop.verificationCount,
            expiredAt: now.toISOString(),
            reason: 'Crop unsold after secondary 15-day verification period. Deemed unsellable for retail consumption.'
          });

          changed = true;
          unsellableCount++;
        }
      }

      if (changed && newBlock) {
        crop.blockHash = newBlock.hash;
        await crop.save();

        await BlockModel.create({
          index: newBlock.index,
          timestamp: newBlock.timestamp,
          data: newBlock.data,
          previousHash: newBlock.previousHash,
          hash: newBlock.hash,
          merkleRoot: newBlock.merkleRoot
        });

        updatedCrops.push({
          cropId: crop._id,
          cropType: crop.cropType,
          newStatus: crop.status,
          verificationCount: crop.verificationCount,
          blockHash: newBlock.hash,
          blockIndex: newBlock.index
        });
      }
    }

    res.json({
      success: true,
      message: `Aging verification completed. ${reverifiedCount} crop(s) re-verified, ${unsellableCount} crop(s) marked unsellable.`,
      reverifiedCount,
      unsellableCount,
      totalChecked: crops.length,
      updatedCrops
    });

  } catch (error) {
    console.error('Aging check error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/crops/simulate-aging
 * @desc    Simulate 15-day aging for a specific crop for live demonstration
 */
router.post('/simulate-aging', async (req, res) => {
  try {
    const { cropId, daysFastForward = 16 } = req.body;

    if (!cropId) {
      return res.status(400).json({ success: false, message: 'cropId is required' });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    if (crop.currentStage === 'sold') {
      return res.status(400).json({ success: false, message: 'Sold crops cannot undergo aging re-verification.' });
    }

    const now = new Date();
    let newBlock = null;

    if (crop.status === 'listed') {
      // Advance to aged-relisted
      crop.verificationCount = (crop.verificationCount || 0) + 1;
      crop.listedDate = new Date(now.getTime() - (daysFastForward * 24 * 60 * 60 * 1000));
      crop.lastVerifiedDate = now;
      crop.status = 'aged-relisted';
      crop.suggestedPriceDrop = true;
      crop.discountPercent = 20;

      newBlock = miligramsBlockchain.addBlock({
        action: 'CROP_REVERIFIED_AGING',
        cropId: crop._id.toString(),
        cropType: crop.cropType,
        event: 're-verification',
        newStatus: 'aged-relisted',
        verificationCount: crop.verificationCount,
        suggestedPriceDrop: true,
        discountPercent: 20,
        simulatedDays: daysFastForward,
        reverifiedAt: now.toISOString(),
        reason: 'Simulated 15-day unsold aging test. Quality re-verified with 20% suggested price drop.'
      });
    } else if (crop.status === 'aged-relisted') {
      // Advance to unsellable
      crop.verificationCount = (crop.verificationCount || 1) + 1;
      crop.lastVerifiedDate = now;
      crop.status = 'unsellable';

      newBlock = miligramsBlockchain.addBlock({
        action: 'CROP_MARKED_UNSELLABLE',
        cropId: crop._id.toString(),
        cropType: crop.cropType,
        event: 'crop_expired',
        newStatus: 'unsellable',
        verificationCount: crop.verificationCount,
        simulatedDays: daysFastForward,
        expiredAt: now.toISOString(),
        reason: 'Simulated secondary 15-day period expired. Marked unsellable.'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Crop is already in terminal status: ${crop.status}`
      });
    }

    crop.blockHash = newBlock.hash;
    await crop.save();

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
      message: `Crop #${crop.cropType} successfully aged by ${daysFastForward} days! Block #${newBlock.index} minted.`,
      crop,
      block: newBlock
    });

  } catch (error) {
    console.error('Simulate aging error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/crops
 * @desc    Get all crops (optionally filter by ?farmerId=...)
 */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.farmerId) {
      filter.farmerId = req.query.farmerId;
    }
    if (req.query.stage) {
      filter.currentStage = req.query.stage;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const crops = await Crop.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: crops.length, crops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/crops/:id
 * @desc    Get details of a single crop by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    const ledgerHistory = miligramsBlockchain.getCropHistory(crop._id.toString());

    res.json({
      success: true,
      crop,
      ledgerHistory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
