# 🌾 Miligrams: Agricultural Crop-Tracking & Blockchain Ledger

A full-stack agricultural supply chain web platform that tracks crops from the farm gate through warehouses to commercial buyers, cryptographically sealing every milestone onto a custom SHA-256 blockchain ledger.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+)
- *MongoDB is optional!* Miligrams includes an automatic embedded in-memory MongoDB fallback, so the application runs immediately without requiring a local `mongod` service to be installed or configured.

### 1-Command Startup
From the project root directory (`macro/`):
```bash
# 1. Install all dependencies (both server and client)
npm run install:all

# 2. Start both backend server and frontend client concurrently
npm run dev
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **Standalone Blockchain Test Suite**: `npm run test:blockchain`

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React.js (Vite), React Router v7, Lucide Icons, Modern responsive CSS
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB with Mongoose schemas (supports MongoDB Atlas / local MongoDB / embedded in-memory fallback)
- **Blockchain Engine**: Custom lightweight SHA-256 blockchain module (`server/blockchain/blockchain.js`) built with Node's native `crypto` module, featuring cryptographic previousHash chaining and Merkle root verification.

---

## 📁 Project Structure

```
miligrams/
├── package.json                 # Monorepo scripts (concurrent dev runner)
├── README.md                    # System documentation & presentation notes
├── server/
│   ├── package.json
│   ├── server.js                # Express API entry point
│   ├── test-blockchain.js       # Standalone blockchain test runner
│   ├── .env.example
│   ├── config/
│   │   └── db.js                # Mongoose connection manager + memory fallback
│   ├── models/
│   │   ├── Farmer.js            # Farmer schema (name, uniqueId, contact, location)
│   │   ├── Crop.js              # Crop schema (cropType, quantity, stage, blockHash)
│   │   ├── Warehouse.js         # Warehouse schema (warehouseId, location, cropsStored)
│   │   ├── Buyer.js             # Buyer schema (name, uniqueId, purchaseHistory)
│   │   ├── Transaction.js       # Transaction schema (cropId, buyerId, amount)
│   │   └── BlockModel.js        # Persistent ledger block schema
│   ├── blockchain/
│   │   └── blockchain.js        # Block & Blockchain classes, SHA-256 & Merkle root
│   ├── routes/
│   │   ├── farmerRoutes.js      # /api/farmers
│   │   ├── cropRoutes.js        # /api/crops
│   │   ├── warehouseRoutes.js   # /api/warehouse
│   │   ├── marketRoutes.js      # /api/marketplace
│   │   └── ledgerRoutes.js      # /api/ledger
│   └── utils/
│       └── seedData.js          # Auto-seeder with initial farmers, warehouse, crops
└── client/
    ├── package.json
    ├── vite.config.js           # Vite config with /api proxy to port 5000
    ├── index.html
    └── src/
        ├── App.jsx              # Main router
        ├── index.css            # Custom CSS styling (badges, timelines, cards)
        ├── components/
        │   ├── Navbar.jsx       # Header navigation & live chain health badge
        │   ├── BlockCard.jsx    # Block UI with hash, prevHash, and Merkle root
        │   └── CropHistoryModal.jsx # Visual audit trail timeline for a crop
        └── pages/
            ├── Dashboard.jsx    # Farmer dashboard & crop list
            ├── UploadCrop.jsx   # Crop upload form with instant block hash receipt
            ├── WarehouseView.jsx# Warehouse inventory & stage transition trigger
            ├── MarketplaceView.jsx # Buyer marketplace & purchase settlement
            ├── LedgerView.jsx   # Public Blockchain Ledger Explorer & tamper test
            └── RegisterView.jsx # Supply chain participant registration
```

---

## 🔗 How the Blockchain Module Works (`blockchain.js`)

### 1. The `Block` Class
Each block contains:
- `index`: Monotonically increasing position in the chain (0 = Genesis).
- `timestamp`: Precise ISO-8601 creation timestamp.
- `data`: Payload containing event action, crop ID, weight, quality grade, actor, and location.
- `previousHash`: The SHA-256 hash of the block directly before this one.
- `merkleRoot`: Deterministic cryptographic summary of all key-value items in the block's data.
- `hash`: SHA-256 cryptographic digest of `(index + previousHash + timestamp + merkleRoot + JSON.stringify(data))`.

### 2. The `Blockchain` Class
- `createGenesisBlock()`: Initializes the chain at Block #0 with `previousHash: "0"`.
- `addBlock(data)`: Links `newBlock.previousHash = latestBlock.hash`, computes hash and Merkle root, appends to the chain, and persists to MongoDB.
- `isChainValid()`: Traverses the chain and recalculates the SHA-256 hash and Merkle root for every block. If any block's data was modified or any link was broken, it identifies the corrupted block index.
- `getCropHistory(cropId)`: Extracts all blocks tied to a specific crop for complete seed-to-sale traceability.

---

## 📡 Core REST APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/farmers/register` | Registers a farmer with unique ID, name, and location |
| `GET` | `/api/farmers` | Lists registered farmers |
| `POST` | `/api/crops/upload` | Saves crop, automatically mints a new block to blockchain, and updates farmer |
| `GET` | `/api/crops/:id` | Fetches crop details and its chained ledger blocks |
| `GET` | `/api/crops` | Lists all crops (supports `?farmerId=` and `?stage=`) |
| `PUT` | `/api/warehouse/update-stock` | Updates crop stage to `'warehouse'` and mints transition block |
| `GET` | `/api/warehouse/stock` | Lists warehouses and their stored crops |
| `GET` | `/api/marketplace/browse` | Returns commodities available for sale |
| `POST` | `/api/marketplace/purchase` | Buyer purchases crop, marks as `'sold'`, and records settlement block |
| `GET` | `/api/ledger/verify-chain` | Cryptographically verifies entire blockchain integrity |
| `GET` | `/api/ledger/crop-history/:cropId` | Returns chronological block history for a specific crop |
| `GET` | `/api/ledger/blocks` | Returns all blocks in the ledger |
| `POST` | `/api/ledger/simulate-tamper` | Educational endpoint: modifies a block in-memory to trigger validation failure |
| `POST` | `/api/ledger/restore-chain` | Restores chain from persistent DB to clear tampered state |

---

## 🎓 Professor / Teacher Presentation Guide

When presenting this 2-week checkpoint to your professor, follow this walkthrough:

1. **Demonstrate End-to-End Crop Minting**:
   - Go to **Upload Crop** (`/upload`).
   - Select farmer **Ramesh Patel**, enter crop type **"Organic Basmati Rice"**, quantity **750 kg**, and click **"Register & Mint Block"**.
   - Show the professor the **Receipt Card** highlighting the newly created **Block Hash (SHA-256)** and previous hash link.

2. **Demonstrate Crop Provenance / Audit Trail**:
   - Go to **Farmer Dashboard** (`/`).
   - Show the crop in the table with its initial status `🌱 Farm`.
   - Click **"View Ledger History"**: Explain how the modal queries `/api/ledger/crop-history/:cropId` and displays the exact cryptographic block minted for this crop.

3. **Demonstrate Stage Transitions**:
   - Go to **Warehouse** (`/warehouse`).
   - Find the crop under "Incoming Farm Batches" and click **"Receive into WH-CENTRAL-01"**.
   - Show how the stage advances to `📦 Warehouse` and a second block is minted linking to the first.
   - Go to **Marketplace** (`/marketplace`) and click **"Buy & Settle"**.
   - Open the **Full Lifecycle Chain** to show all 3 blocks (Harvest → Warehouse → Sale) chaining seamlessly.

4. **Demonstrate Cryptographic Tamper-Proofing (The "Aha!" Moment)**:
   - Go to **Ledger Explorer** (`/ledger`).
   - Point out the green **"Blockchain Integrity: 100% Verified"** banner.
   - Click the **"Simulate Tampering Block #1"** button.
   - The validator immediately detects that the Merkle root and hash no longer match and displays a red warning: *Tampering Detected at Block #1!*
   - Click **"Restore Legitimate Chain"** to show how the persistent database restores the untampered state.
