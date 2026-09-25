require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { tenantContext } = require('./middleware/tenantContext');
const partnersRouter = require('./routes/partners');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — no tenant required
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'part-x' }));

// Tenant-isolated endpoints
app.use('/api', tenantContext);
app.use('/api/partners', partnersRouter);

const PORT = process.env.PORT || 4007;
app.listen(PORT, () => {
  console.log(`🚀 part-x listening on port ${PORT}`);
});
