const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/customers
router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO customers (tenant_id, name, email, phone)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.tenantId, name, email, phone]
    );
    const customer = result.rows[0];

    // Other blocks (SEG-X for segmentation, Marketing for onboarding flows)
    // react to this without CRM-X needing to know about them.
    await publish('customer.created', { tenantId: req.tenantId, customer });

    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM customers WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// GET /api/customers/:id/history — merges interactions + tickets, matching
// the API shape from the original architecture doc.
router.get('/:id/history', async (req, res) => {
  try {
    const interactions = await tenantQuery(
      req.tenantId,
      `SELECT id, channel, notes, occurred_at AS "when", 'interaction' AS type
       FROM interactions WHERE customer_id = $1`,
      [req.params.id]
    );
    const tickets = await tenantQuery(
      req.tenantId,
      `SELECT id, status, priority, created_at AS "when", 'ticket' AS type
       FROM tickets WHERE customer_id = $1`,
      [req.params.id]
    );
    const history = [...interactions.rows, ...tickets.rows].sort(
      (a, b) => new Date(b.when) - new Date(a.when)
    );
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/customers — list (paginated)
router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 25, 100);
  const offset = parseInt(req.query.offset) || 0;
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM customers ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list customers' });
  }
});

module.exports = router;
