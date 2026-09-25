const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/expenses
router.post('/', async (req, res) => {
  const { category_id, description, cost_type = 'FIXED', amount = 0, currency = 'BRL', supplier_id, incurred_on = new Date().toISOString().slice(0, 10), due_date, status = 'pending' } = req.body;
  if (!category_id || amount === undefined) {
    return res.status(400).json({ error: 'category_id and amount are required' });
  }

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO expenses (tenant_id, category_id, description, cost_type, amount, currency, supplier_id, incurred_on, due_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.tenantId, category_id, description, cost_type, amount, currency, supplier_id, incurred_on, due_date, status]
    );
    const expense = result.rows[0];
    await publish('expense.created', { tenantId: req.tenantId, expense });
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record expense' });
  }
});

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM expenses ORDER BY incurred_on DESC, created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// GET /api/expenses/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM expenses WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  const { category_id, description, cost_type, amount, currency, supplier_id, incurred_on, due_date, status } = req.body;
  try {
    const result = await tenantQuery(
      req.tenantId,
      `UPDATE expenses
       SET category_id = COALESCE($2, category_id),
           description = COALESCE($3, description),
           cost_type = COALESCE($4, cost_type),
           amount = COALESCE($5, amount),
           currency = COALESCE($6, currency),
           supplier_id = COALESCE($7, supplier_id),
           incurred_on = COALESCE($8, incurred_on),
           due_date = COALESCE($9, due_date),
           status = COALESCE($10, status),
           updated_at = now()
       WHERE id = $1 RETURNING *`,
      [req.params.id, category_id, description, cost_type, amount, currency, supplier_id, incurred_on, due_date, status]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    const expense = result.rows[0];
    await publish('expense.updated', { tenantId: req.tenantId, expense });
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

module.exports = router;
