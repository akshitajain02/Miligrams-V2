const express = require('express');
const router = express.Router();
const BlockModel = require('../models/BlockModel');
const { miligramsBlockchain } = require('../blockchain/blockchain');

/**
 * @route   GET /api/ledger/verify-chain
 * @desc    Cryptographically verifies the entire blockchain ledger
 */
router.get('/verify-chain', (req, res) => {
  try {
    const result = miligramsBlockchain.isChainValid();
    res.json({
      success: true,
      isValid: result.isValid,
      chainLength: result.chainLength,
      error: result.error,
      tamperedIndex: result.tamperedIndex,
      checkedAt: new Date().toISOString(),
      summary: result.isValid
        ? 'Chain integrity 100% verified. All SHA-256 block hashes, previous links, and Merkle roots are intact.'
        : `CRITICAL ALERT: Tampering detected at Block #${result.tamperedIndex}: ${result.error}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/ledger/crop-history/:cropId
 * @desc    Returns the full chronological chained block history for a specific crop
 */
router.get('/crop-history/:cropId', (req, res) => {
  try {
    const { cropId } = req.params;
    const history = miligramsBlockchain.getCropHistory(cropId);

    res.json({
      success: true,
      cropId,
      totalBlocksInHistory: history.length,
      history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/ledger/blocks
 * @desc    Returns all blocks in the ledger for public auditing and exploration
 */
router.get('/blocks', (req, res) => {
  try {
    res.json({
      success: true,
      totalBlocks: miligramsBlockchain.chain.length,
      chain: miligramsBlockchain.chain
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/ledger/add-entry
 * @desc    General endpoint to add a custom ledger entry
 */
router.post('/add-entry', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, message: 'Data payload is required' });
    }

    const newBlock = miligramsBlockchain.addBlock(data);

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
      message: `Block #${newBlock.index} added to blockchain ledger`,
      block: newBlock
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/ledger/simulate-tamper
 * @desc    Educational demonstration helper: allows temporarily altering a block's data
 *          in-memory to demonstrate the cryptographic avalanche and validation failure.
 */
router.post('/simulate-tamper', (req, res) => {
  try {
    const { blockIndex, tamperedField, newValue } = req.body;
    const targetIndex = Number(blockIndex) || 1;

    if (targetIndex < 1 || targetIndex >= miligramsBlockchain.chain.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid blockIndex. Valid range: 1 to ${miligramsBlockchain.chain.length - 1}`
      });
    }

    const block = miligramsBlockchain.chain[targetIndex];
    if (!block.data) block.data = {};
    const originalValue = block.data[tamperedField || 'quantity'];
    block.data[tamperedField || 'quantity'] = newValue || 999999;

    res.json({
      success: true,
      message: `Block #${targetIndex} data tampered for academic demonstration. Check GET /api/ledger/verify-chain now to see detection in action!`,
      targetBlock: targetIndex,
      originalValue,
      tamperedValue: block.data[tamperedField || 'quantity']
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/ledger/restore-chain
 * @desc    Re-syncs chain from database to restore original untampered state
 */
router.post('/restore-chain', async (req, res) => {
  try {
    const dbBlocks = await BlockModel.find().sort({ index: 1 });
    miligramsBlockchain.loadFromDatabase(dbBlocks);

    res.json({
      success: true,
      message: 'Blockchain state restored from database records.',
      validation: miligramsBlockchain.isChainValid()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
