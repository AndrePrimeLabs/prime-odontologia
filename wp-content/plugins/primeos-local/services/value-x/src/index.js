require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { tenantContext } = require('./middleware/tenantContext');
const propositionsRouter = require('./routes/propositions');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — no tenant required
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'value-x' }));

// Tenant-isolated endpoints
app.use('/api', tenantContext);
app.use('/api/propositions', propositionsRouter);

const PORT = process.env.PORT || 4006;
app.listen(PORT, () => {
  console.log(`🚀 value-x listening on port ${PORT}`);
});
