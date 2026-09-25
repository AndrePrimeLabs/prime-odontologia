require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { tenantContext } = require('./middleware/tenantContext');
const resourcesRouter = require('./routes/resources');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — no tenant required
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'res-x' }));

// Tenant-isolated endpoints
app.use('/api', tenantContext);
app.use('/api/resources', resourcesRouter);

const PORT = process.env.PORT || 4008;
app.listen(PORT, () => {
  console.log(`🚀 res-x listening on port ${PORT}`);
});
