const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/budgets
router.post('/', async (req, res) => {
  const { name, planned_amount = 0, actual_amount = 0, period } = req.body;
  if (!name || !period) return res.status(400).json({ error: 'name and period are required' });

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO budgets (tenant_id, name, planned_amount, actual_amount, period)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.tenantId, name, planned_amount, actual_amount, period]
    );
    const budget = result.rows[0];
    await publish('budget.created', { tenantId: req.tenantId, budget });
    res.status(201).json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// GET /api/budgets
router.get('/', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM budgets ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// GET /api/budgets/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM budgets WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

module.exports = router;
