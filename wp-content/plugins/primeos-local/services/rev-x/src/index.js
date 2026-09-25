require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { tenantContext } = require('./middleware/tenantContext');
const productsRouter = require('./routes/products');
const transactionsRouter = require('./routes/transactions');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — no tenant required
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'rev-x' }));

// Tenant-isolated endpoints
app.use('/api', tenantContext);
app.use('/api/products', productsRouter);
app.use('/api/transactions', transactionsRouter);

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`🚀 rev-x listening on port ${PORT}`);
});
