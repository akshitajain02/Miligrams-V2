const Farmer = require('../models/Farmer');
const Warehouse = require('../models/Warehouse');
const Buyer = require('../models/Buyer');
const Crop = require('../models/Crop');
const BlockModel = require('../models/BlockModel');
const { miligramsBlockchain } = require('../blockchain/blockchain');

async function seedInitialData() {
  try {
    const farmerCount = await Farmer.countDocuments();
    if (farmerCount === 0) {
      console.log('Seeding initial demonstration data...');

      // Seed Farmers
      const farmer1 = await Farmer.create({
        name: 'Ramesh Patel',
        uniqueId: 'FARMER-101',
        contact: '+91 98765 43210',
        location: 'Ludhiana, Punjab',
        cropsOwned: []
      });

      const farmer2 = await Farmer.create({
        name: 'Sita Devi',
        uniqueId: 'FARMER-102',
        contact: '+91 98111 22334',
        location: 'Karnal, Haryana',
        cropsOwned: []
      });

      // Seed Warehouse
      const warehouse1 = await Warehouse.create({
        warehouseId: 'WH-CENTRAL-01',
        location: 'Ambala Logistics Hub, Haryana',
        capacity: 25000,
        cropsStored: []
      });

      await Warehouse.create({
        warehouseId: 'WH-NORTH-02',
        location: 'Patiala Grain Depot, Punjab',
        capacity: 15000,
        cropsStored: []
      });

      // Seed Buyers
      await Buyer.create({
        name: 'Punjab Agri Commodities Ltd.',
        uniqueId: 'BUYER-501',
        contact: '+91 94000 11223',
        organization: 'Wholesale Grain Merchant',
        purchaseHistory: []
      });

      await Buyer.create({
        name: 'GreenEarth Organics Inc.',
        uniqueId: 'BUYER-502',
        contact: '+91 97777 88990',
        organization: 'Organic Retail Distributor',
        purchaseHistory: []
      });

      // Seed a starter Crop and automatically append its block to blockchain
      const initialCrop = await Crop.create({
        cropType: 'Sharbati Organic Wheat',
        quantity: 1200,
        harvestDate: new Date('2026-09-01'),
        qualityStatus: 'Organic Premium',
        farmerId: farmer1.uniqueId,
        farmerName: farmer1.name,
        currentStage: 'farm',
        blockHash: ''
      });

      farmer1.cropsOwned.push(initialCrop._id);
      await farmer1.save();

      // Mint block in blockchain
      const cropBlock = miligramsBlockchain.addBlock({
        action: 'CROP_HARVESTED_AND_REGISTERED',
        cropId: initialCrop._id.toString(),
        cropType: initialCrop.cropType,
        quantity: initialCrop.quantity,
        harvestDate: initialCrop.harvestDate,
        qualityStatus: initialCrop.qualityStatus,
        farmerId: farmer1.uniqueId,
        farmerName: farmer1.name,
        stage: 'farm',
        note: 'Demonstration crop record minted on chain'
      });

      initialCrop.blockHash = cropBlock.hash;
      await initialCrop.save();

      // Persist block in DB
      await BlockModel.create({
        index: cropBlock.index,
        timestamp: cropBlock.timestamp,
        data: cropBlock.data,
        previousHash: cropBlock.previousHash,
        hash: cropBlock.hash,
        merkleRoot: cropBlock.merkleRoot
      });

      console.log(' Starter data and initial blockchain block seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding demo data:', error.message);
  }
}

module.exports = { seedInitialData };
