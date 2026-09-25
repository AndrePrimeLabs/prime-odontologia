const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/transactions
router.post('/', async (req, res) => {
  const { customer_id, stream_id, amount, currency = 'BRL', payment_method = 'pix', installments = 1, status = 'pending', paid_at } = req.body;
  if (!customer_id || amount === undefined) {
    return res.status(400).json({ error: 'customer_id and amount are required' });
  }

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO transactions (tenant_id, customer_id, stream_id, amount, currency, payment_method, installments, status, paid_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.tenantId, customer_id, stream_id, amount, currency, payment_method, installments, status, paid_at]
    );
    const transaction = result.rows[0];
    await publish('transaction.created', { tenantId: req.tenantId, transaction });
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const { customer_id, status } = req.query;
    let query = `SELECT * FROM transactions`;
    const params = [];
    const conditions = [];

    if (customer_id) {
      params.push(customer_id);
      conditions.push(`customer_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ` ORDER BY created_at DESC`;

    const result = await tenantQuery(req.tenantId, query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM transactions WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

module.exports = router;
