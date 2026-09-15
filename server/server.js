require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { seedInitialData } = require('./utils/seedData');

// Import routes
const farmerRoutes = require('./routes/farmerRoutes');
const cropRoutes = require('./routes/cropRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const marketRoutes = require('./routes/marketRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for easy debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/marketplace', marketRoutes);
app.use('/api/ledger', ledgerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Miligrams Agricultural Supply Chain Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root welcome message
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Miligrams API</title></head>
      <body style="font-family: sans-serif; padding: 40px; background: #f4fbf7; color: #1e3a2b;">
        <h1>🌾 Miligrams Agricultural Platform API</h1>
        <p>Full-Stack Agricultural Crop-Tracking with SHA-256 Blockchain Ledger.</p>
        <ul>
          <li><a href="/api/health">GET /api/health</a> - System status</li>
          <li><a href="/api/farmers">GET /api/farmers</a> - Farmer list</li>
          <li><a href="/api/crops">GET /api/crops</a> - Crops catalog</li>
          <li><a href="/api/warehouse/stock">GET /api/warehouse/stock</a> - Warehouse inventory</li>
          <li><a href="/api/marketplace/browse">GET /api/marketplace/browse</a> - Marketplace</li>
          <li><a href="/api/ledger/verify-chain">GET /api/ledger/verify-chain</a> - Blockchain verification</li>
          <li><a href="/api/ledger/blocks">GET /api/ledger/blocks</a> - Blockchain blocks explorer</li>
        </ul>
      </body>
    </html>
  `);
});

// Start Server after connecting to Database
const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();

    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🌾 Miligrams Server running on http://localhost:${PORT}`);
      console.log(`🔗 Blockchain Ledger initialized and active`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
  }
};

startServer();
