const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const Crop = require('../models/Crop');
const BlockModel = require('../models/BlockModel');
const { miligramsBlockchain } = require('../blockchain/blockchain');

/**
 * @route   PUT /api/warehouse/update-stock
 * @desc    Receive crop stock into a warehouse and mint an update block on the blockchain
 */
router.put('/update-stock', async (req, res) => {
  try {
    const { cropId, warehouseId, notes } = req.body;

    if (!cropId || !warehouseId) {
      return res.status(400).json({
        success: false,
        message: 'cropId and warehouseId are required'
      });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    let warehouse = await Warehouse.findOne({ warehouseId });
    if (!warehouse) {
      // Auto-create warehouse if it doesn't exist yet for seamless testing
      warehouse = await Warehouse.create({
        warehouseId,
        location: 'Central Storage Hub',
        capacity: 20000,
        cropsStored: []
      });
    }

    // 1. Update crop stage to 'warehouse'
    const previousStage = crop.currentStage;
    crop.currentStage = 'warehouse';
    crop.currentWarehouseId = warehouseId;

    // 2. Add crop to warehouse inventory if not already present
    if (!warehouse.cropsStored.includes(crop._id)) {
      warehouse.cropsStored.push(crop._id);
      await warehouse.save();
    }

    // 3. Mint a new transition block onto the blockchain ledger
    const blockPayload = {
      action: 'WAREHOUSE_STOCK_RECEIVED',
      cropId: crop._id.toString(),
      cropType: crop.cropType,
      quantity: crop.quantity,
      farmerId: crop.farmerId,
      warehouseId,
      warehouseLocation: warehouse.location,
      previousStage,
      currentStage: 'warehouse',
      notes: notes || 'Stock received and inspected at warehouse storage.',
      inspectedAt: new Date().toISOString()
    };

    const newBlock = miligramsBlockchain.addBlock(blockPayload);

    // 4. Update crop with the latest block hash
    crop.blockHash = newBlock.hash;
    await crop.save();

    // 5. Persist the new block in MongoDB
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
      message: `Crop #${crop.cropType} successfully received into Warehouse ${warehouseId}. New block #${newBlock.index} minted.`,
      crop,
      block: newBlock
    });

  } catch (error) {
    console.error('Warehouse update-stock error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/warehouse/stock
 * @desc    Get all warehouses with populated stored crops
 */
router.get('/stock', async (req, res) => {
  try {
    const warehouses = await Warehouse.find().populate('cropsStored');
    res.json({ success: true, warehouses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/warehouse/register
 * @desc    Register a new warehouse
 */
router.post('/register', async (req, res) => {
  try {
    const { warehouseId, location, capacity } = req.body;
    if (!warehouseId || !location) {
      return res.status(400).json({ success: false, message: 'warehouseId and location are required' });
    }

    const existing = await Warehouse.findOne({ warehouseId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Warehouse ID already exists' });
    }

    const warehouse = await Warehouse.create({
      warehouseId,
      location,
      capacity: capacity || 20000,
      cropsStored: []
    });

    res.status(201).json({ success: true, message: 'Warehouse registered', warehouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
