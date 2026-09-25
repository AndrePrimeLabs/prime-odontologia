require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { tenantContext } = require('./middleware/tenantContext');
const activitiesRouter = require('./routes/activities');
const sopsRouter = require('./routes/sops');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — no tenant required
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'act-x' }));

// Tenant-isolated endpoints
app.use('/api', tenantContext);
app.use('/api/activities', activitiesRouter);
app.use('/api/sops', sopsRouter);

const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
  console.log(`🚀 act-x listening on port ${PORT}`);
});
