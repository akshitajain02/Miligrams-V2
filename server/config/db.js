const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const BlockModel = require('../models/BlockModel');
const { miligramsBlockchain } = require('../blockchain/blockchain');

let mongodInstance = null;

const connectDB = async () => {
  const customUri = process.env.MONGODB_URI;

  try {
    if (customUri) {
      console.log(`Connecting to MongoDB URI: ${customUri.replace(/:\/\/.*@/, '://<credentials>@')}`);
      await mongoose.connect(customUri, { serverSelectionTimeoutMS: 5000 });
      console.log(' Connected to MongoDB successfully.');
    } else {
      // Try local standard MongoDB first
      try {
        console.log('Attempting local MongoDB connection (mongodb://127.0.0.1:27017/miligrams)...');
        await mongoose.connect('mongodb://127.0.0.1:27017/miligrams', { serverSelectionTimeoutMS: 2000 });
        console.log(' Connected to local MongoDB.');
      } catch (localErr) {
        console.log('Local MongoDB not running. Initializing embedded in-memory MongoDB engine...');
        mongodInstance = await MongoMemoryServer.create();
        const memoryUri = mongodInstance.getUri();
        await mongoose.connect(memoryUri);
        console.log(` Connected to Embedded In-Memory MongoDB (${memoryUri})`);
      }
    }

    // Synchronize blockchain with database
    await syncBlockchainWithDB();

  } catch (error) {
    console.error(' MongoDB connection failed:', error.message);
    console.log('Starting In-Memory MongoDB fallback to guarantee application operation...');
    try {
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(' Connected to In-Memory MongoDB fallback.');
      await syncBlockchainWithDB();
    } catch (fallbackError) {
      console.error('Fatal: Could not initialize database:', fallbackError.message);
      process.exit(1);
    }
  }
};

/**
 * Synchronizes the in-memory blockchain with the database:
 * - If blocks exist in DB, loads them into the blockchain singleton.
 * - If no blocks exist, saves the Genesis Block to DB.
 */
async function syncBlockchainWithDB() {
  try {
    const existingBlocks = await BlockModel.find().sort({ index: 1 });
    if (existingBlocks.length > 0) {
      console.log(` Found ${existingBlocks.length} block(s) in DB. Rehydrating blockchain ledger...`);
      miligramsBlockchain.loadFromDatabase(existingBlocks);
    } else {
      console.log(' Initializing database ledger with Genesis Block #0...');
      const genesis = miligramsBlockchain.chain[0];
      await BlockModel.create({
        index: genesis.index,
        timestamp: genesis.timestamp,
        data: genesis.data,
        previousHash: genesis.previousHash,
        hash: genesis.hash,
        merkleRoot: genesis.merkleRoot
      });
    }
  } catch (err) {
    console.error('Error synchronizing blockchain with DB:', err.message);
  }
}

module.exports = { connectDB };
