require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { tenantContext } = require('./middleware/tenantContext');
const customersRouter = require('./routes/customers');
const interactionsRouter = require('./routes/interactions');
const ticketsRouter = require('./routes/tickets');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — no tenant required, used by Docker/K3s liveness probes
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'crm-x' }));

// Everything below this line requires a resolved tenant
app.use('/api', tenantContext);
app.use('/api/customers', customersRouter);
app.use('/api/interactions', interactionsRouter);
app.use('/api/tickets', ticketsRouter);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🚀 crm-x listening on port ${PORT}`);
});
