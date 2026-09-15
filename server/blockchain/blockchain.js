const crypto = require('crypto');

/**
 * ============================================================================
 * MILIGRAMS AGRICULTURAL BLOCKCHAIN LEDGER
 * ============================================================================
 * 
 * Educational Notes for Review:
 * 1. Cryptographic Hash (SHA-256): A one-way function that produces a unique
 *    64-character hexadecimal digest from any input data. Changing even a single
 *    character in the crop data completely changes the hash (Avalanche Effect).
 * 
 * 2. Previous Hash Linkage: Each block points to the cryptographic hash of the
 *    block immediately preceding it. This creates an unbroken chain.
 *    If an attacker modifies historical crop data in Block #2, its hash changes,
 *    which breaks the link stored in Block #3, immediately invalidating the entire
 *    subsequent chain.
 * 
 * 3. Merkle Root: A cryptographic summary of all key-value items inside the
 *    block's data payload. Leaf nodes are hashed in pairs up to a single root hash,
 *    providing fast and tamper-proof verification of data integrity.
 * ============================================================================
 */

class Block {
  /**
   * @param {number} index - Position of the block in the blockchain (0 = Genesis)
   * @param {string} timestamp - ISO-8601 timestamp when the block was minted
   * @param {object} data - Crop tracking details (cropId, type, quantity, farmer, stage, etc.)
   * @param {string} previousHash - SHA-256 hash of the previous block in the chain
   */
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.merkleRoot = this.calculateMerkleRoot(data);
    this.hash = this.calculateHash();
  }

  /**
   * Computes a deterministic Merkle Root from the crop data payload.
   * Treats each key-value pair in `data` as a transaction leaf, hashes each leaf,
   * and recursively pairs them until one root hash remains.
   * 
   * @param {object} data - The payload to construct the Merkle Tree from
   * @returns {string} 64-character SHA-256 Merkle root hash
   */
  calculateMerkleRoot(data) {
    if (!data || typeof data !== 'object') {
      return crypto.createHash('sha256').update(String(data)).digest('hex');
    }

    // Convert object properties into sorted deterministic string representations
    const entries = Object.keys(data).sort().map(key => {
      const val = typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]);
      return `${key}:${val}`;
    });

    if (entries.length === 0) {
      return crypto.createHash('sha256').update('empty_data').digest('hex');
    }

    // Step 1: Hash every entry into a leaf node
    let treeLevel = entries.map(entry =>
      crypto.createHash('sha256').update(entry).digest('hex')
    );

    // Step 2: Combine pairs of hashes until only the Merkle root remains
    while (treeLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < treeLevel.length; i += 2) {
        if (i + 1 < treeLevel.length) {
          // Combine left and right child hashes
          const combinedHash = crypto
            .createHash('sha256')
            .update(treeLevel[i] + treeLevel[i + 1])
            .digest('hex');
          nextLevel.push(combinedHash);
        } else {
          // If odd number of leaves, duplicate the last hash (standard Bitcoin/crypto Merkle tree pattern)
          const duplicateHash = crypto
            .createHash('sha256')
            .update(treeLevel[i] + treeLevel[i])
            .digest('hex');
          nextLevel.push(duplicateHash);
        }
      }
      treeLevel = nextLevel;
    }

    return treeLevel[0];
  }

  /**
   * Computes the SHA-256 cryptographic hash of this block.
   * Incorporates index, previousHash, timestamp, merkleRoot, and raw stringified data.
   * 
   * @returns {string} 64-character SHA-256 hash
   */
  calculateHash() {
    const payload = `${this.index}${this.previousHash}${this.timestamp}${this.merkleRoot}${JSON.stringify(this.data)}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.initializeGenesisBlock();
  }

  /**
   * Creates the initial Genesis Block (Block #0) of the Miligrams ledger.
   * Previous hash is set to "0" since there is no antecedent block.
   */
  initializeGenesisBlock() {
    const genesisData = {
      action: 'GENESIS_INITIALIZATION',
      project: 'Miligrams Agricultural Crop Ledger',
      description: 'Genesis block establishing immutable ledger for crop traceability.',
      initializedAt: new Date().toISOString()
    };
    const genesisBlock = new Block(0, new Date().toISOString(), genesisData, '0');
    this.chain.push(genesisBlock);
  }

  /**
   * Returns the most recently minted block in the chain.
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Mints and appends a new block to the blockchain ledger.
   * Automatically sets index to (latest + 1) and links previousHash.
   * 
   * @param {object} data - Crop activity data (e.g. upload, stage transfer, quality update)
   * @returns {Block} The newly created and validated block
   */
  addBlock(data) {
    const latestBlock = this.getLatestBlock();
    const newIndex = latestBlock.index + 1;
    const timestamp = new Date().toISOString();
    const previousHash = latestBlock.hash;

    const newBlock = new Block(newIndex, timestamp, data, previousHash);
    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Verifies the cryptographic integrity of the entire chain.
   * Checks:
   *  1. Has any block's content been tampered with? (re-calculates hash and merkle root)
   *  2. Is the chain of `previousHash` references strictly intact?
   * 
   * @returns {object} { isValid: boolean, chainLength: number, error: string|null, tamperedIndex: number|null }
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verification 1: Re-verify Merkle Root against current data
      const recalculatedMerkle = currentBlock.calculateMerkleRoot(currentBlock.data);
      if (currentBlock.merkleRoot !== recalculatedMerkle) {
        return {
          isValid: false,
          chainLength: this.chain.length,
          error: `Merkle Root mismatch at Block #${currentBlock.index}. Data payload has been modified.`,
          tamperedIndex: currentBlock.index
        };
      }

      // Verification 2: Re-verify SHA-256 Block Hash
      const recalculatedHash = currentBlock.calculateHash();
      if (currentBlock.hash !== recalculatedHash) {
        return {
          isValid: false,
          chainLength: this.chain.length,
          error: `Block #${currentBlock.index} hash corrupted. Expected: ${recalculatedHash}, Got: ${currentBlock.hash}`,
          tamperedIndex: currentBlock.index
        };
      }

      // Verification 3: Verify cryptographic link with previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          chainLength: this.chain.length,
          error: `Broken hash link at Block #${currentBlock.index}. previousHash does not match Block #${previousBlock.index} hash.`,
          tamperedIndex: currentBlock.index
        };
      }
    }

    return {
      isValid: true,
      chainLength: this.chain.length,
      error: null,
      tamperedIndex: null
    };
  }

  /**
   * Retrieves all blocks in chronological order that record events for a specific cropId.
   * 
   * @param {string} cropId - The unique ID of the crop
   * @returns {Array<Block>} Array of blocks tracking this crop's journey
   */
  getCropHistory(cropId) {
    if (!cropId) return [];
    const searchId = cropId.toString();

    return this.chain.filter(block => {
      if (!block.data) return false;
      const blockCropId = block.data.cropId ? block.data.cropId.toString() : null;
      return blockCropId === searchId;
    });
  }

  /**
   * Rehydrates blockchain state from saved database records.
   * Useful when server restarts so the ledger continues from previous state.
   * 
   * @param {Array} dbBlocks - Array of block documents from MongoDB
   */
  loadFromDatabase(dbBlocks) {
    if (dbBlocks && dbBlocks.length > 0) {
      this.chain = dbBlocks.map(b => {
        const blk = new Block(b.index, b.timestamp, b.data, b.previousHash);
        blk.hash = b.hash;
        blk.merkleRoot = b.merkleRoot;
        return blk;
      });
    }
  }
}

// Export singleton instance + classes
const miligramsBlockchain = new Blockchain();

module.exports = {
  Block,
  Blockchain,
  miligramsBlockchain
};
