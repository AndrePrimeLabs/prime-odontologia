require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { tenantContext } = require('./middleware/tenantContext');
const channelsRouter = require('./routes/channels');
const campaignsRouter = require('./routes/campaigns');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — no tenant required
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'chan-x' }));

// Tenant-isolated endpoints
app.use('/api', tenantContext);
app.use('/api/channels', channelsRouter);
app.use('/api/campaigns', campaignsRouter);

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`🚀 chan-x listening on port ${PORT}`);
});
