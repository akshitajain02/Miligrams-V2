const { Blockchain, Block } = require('./blockchain/blockchain');

console.log('----------------------------------------------------');
console.log('Testing Miligrams Blockchain Ledger Module');
console.log('----------------------------------------------------\n');

const testChain = new Blockchain();
console.log('1. Genesis Block Created:');
console.log(`   Index: ${testChain.chain[0].index}`);
console.log(`   Hash: ${testChain.chain[0].hash}`);
console.log(`   PrevHash: ${testChain.chain[0].previousHash}`);
console.log(`   MerkleRoot: ${testChain.chain[0].merkleRoot}\n`);

console.log('2. Adding Crop Harvest Block for Crop #CROP-901...');
const b1 = testChain.addBlock({
  action: 'CROP_HARVESTED',
  cropId: 'CROP-901',
  cropType: 'Organic Wheat',
  quantity: 500,
  farmerId: 'FARMER-101',
  farmerName: 'Ramesh Kumar',
  stage: 'farm'
});
console.log(`   Block #${b1.index} added!`);
console.log(`   Hash: ${b1.hash}`);
console.log(`   PreviousHash: ${b1.previousHash}`);
console.log(`   MerkleRoot: ${b1.merkleRoot}\n`);

console.log('3. Adding Warehouse Transfer Block for Crop #CROP-901...');
const b2 = testChain.addBlock({
  action: 'WAREHOUSE_RECEIVED',
  cropId: 'CROP-901',
  warehouseId: 'WH-CENTRAL-01',
  location: 'Ludhiana, Punjab',
  stage: 'warehouse'
});
console.log(`   Block #${b2.index} added!`);
console.log(`   Hash: ${b2.hash}`);
console.log(`   PreviousHash: ${b2.previousHash}\n`);

console.log('4. Adding Unrelated Block for Crop #CROP-902...');
const b3 = testChain.addBlock({
  action: 'CROP_HARVESTED',
  cropId: 'CROP-902',
  cropType: 'Basmati Rice',
  quantity: 300,
  farmerId: 'FARMER-102',
  farmerName: 'Sita Devi',
  stage: 'farm'
});
console.log(`   Block #${b3.index} added! Hash: ${b3.hash}\n`);

console.log('5. Validating Blockchain:');
const validResult = testChain.isChainValid();
console.log('   Chain validity:', validResult.isValid ? 'VALID' : 'CORRUPTED', validResult);

console.log('\n6. Checking Crop History Query for CROP-901:');
const history = testChain.getCropHistory('CROP-901');
console.log(`   Found ${history.length} block(s) for CROP-901 (expected 2: harvest & warehouse transfer).`);
history.forEach((blk, i) => {
  console.log(`   [History #${i+1}] Block Index: ${blk.index} | Action: ${blk.data.action} | Hash: ${blk.hash.substring(0, 16)}...`);
});

console.log('\n7. Tamper Detection Test (Modifying Block #1 crop quantity):');
// Tampering test
testChain.chain[1].data.quantity = 99999;
const tamperResult = testChain.isChainValid();
console.log('   Chain validity after tampering:', tamperResult.isValid ? 'VALID' : 'DETECTED TAMPERING!');
console.log('   Error reported by validator:', tamperResult.error);

if (!tamperResult.isValid) {
  console.log('\n SUCCESS: Tampering was accurately detected by the blockchain validator!');
} else {
  console.error('\n FAILURE: Tamper was not detected!');
  process.exit(1);
}
