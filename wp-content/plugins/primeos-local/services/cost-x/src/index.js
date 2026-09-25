require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { tenantContext } = require('./middleware/tenantContext');
const expensesRouter = require('./routes/expenses');
const budgetsRouter = require('./routes/budgets');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — no tenant required
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'cost-x' }));

// Tenant-isolated endpoints
app.use('/api', tenantContext);
app.use('/api/expenses', expensesRouter);
app.use('/api/budgets', budgetsRouter);

const PORT = process.env.PORT || 4009;
app.listen(PORT, () => {
  console.log(`🚀 cost-x listening on port ${PORT}`);
});
