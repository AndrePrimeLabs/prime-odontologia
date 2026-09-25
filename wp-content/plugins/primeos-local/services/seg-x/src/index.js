require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { tenantContext } = require('./middleware/tenantContext');
const segmentsRouter = require('./routes/segments');
const personasRouter = require('./routes/personas');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — no tenant required
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'seg-x' }));

// Tenant-isolated endpoints
app.use('/api', tenantContext);
app.use('/api/segments', segmentsRouter);
app.use('/api/personas', personasRouter);

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`🚀 seg-x listening on port ${PORT}`);
});
