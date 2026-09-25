const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/tickets
router.post('/', async (req, res) => {
  const { customer_id, priority = 'normal' } = req.body;
  if (!customer_id) return res.status(400).json({ error: 'customer_id is required' });

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO tickets (tenant_id, customer_id, priority)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.tenantId, customer_id, priority]
    );
    const ticket = result.rows[0];
    await publish('ticket.created', { tenantId: req.tenantId, ticket });
    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// GET /api/tickets?status=open
router.get('/', async (req, res) => {
  const status = req.query.status;
  try {
    const result = status
      ? await tenantQuery(req.tenantId, `SELECT * FROM tickets WHERE status = $1 ORDER BY created_at DESC`, [status])
      : await tenantQuery(req.tenantId, `SELECT * FROM tickets ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list tickets' });
  }
});

// PATCH /api/tickets/:id/resolve
router.patch('/:id/resolve', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `UPDATE tickets SET status = 'resolved', resolved_at = now() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve ticket' });
  }
});

module.exports = router;
