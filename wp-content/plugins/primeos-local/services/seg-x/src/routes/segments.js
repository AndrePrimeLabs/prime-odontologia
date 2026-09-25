const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/segments
router.post('/', async (req, res) => {
  const {
    name,
    description,
    market_vertical = 'HEALTH',
    target_age_min = 0,
    target_age_max = 120,
    estimated_market_size = 0,
    avg_ltv = 0,
    is_active = true,
    criteria = {}
  } = req.body;

  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO customer_segments (
        tenant_id, name, description, market_vertical,
        target_age_min, target_age_max, estimated_market_size, avg_ltv, is_active, criteria
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.tenantId, name, description, market_vertical, target_age_min, target_age_max, estimated_market_size, avg_ltv, is_active, JSON.stringify(criteria)]
    );
    const segment = result.rows[0];
    await publish('segment.created', { tenantId: req.tenantId, segment });
    res.status(201).json(segment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create customer segment' });
  }
});

// GET /api/segments
router.get('/', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM customer_segments ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customer segments' });
  }
});

// GET /api/segments/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM customer_segments WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer segment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customer segment' });
  }
});

// PUT /api/segments/:id
router.put('/:id', async (req, res) => {
  const {
    name,
    description,
    market_vertical,
    target_age_min,
    target_age_max,
    estimated_market_size,
    avg_ltv,
    is_active,
    criteria
  } = req.body;

  try {
    const result = await tenantQuery(
      req.tenantId,
      `UPDATE customer_segments
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           market_vertical = COALESCE($4, market_vertical),
           target_age_min = COALESCE($5, target_age_min),
           target_age_max = COALESCE($6, target_age_max),
           estimated_market_size = COALESCE($7, estimated_market_size),
           avg_ltv = COALESCE($8, avg_ltv),
           is_active = COALESCE($9, is_active),
           criteria = COALESCE($10, criteria),
           updated_at = now()
       WHERE id = $1 RETURNING *`,
      [
        req.params.id,
        name,
        description,
        market_vertical,
        target_age_min,
        target_age_max,
        estimated_market_size,
        avg_ltv,
        is_active,
        criteria ? JSON.stringify(criteria) : null
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer segment not found' });
    const segment = result.rows[0];
    await publish('segment.updated', { tenantId: req.tenantId, segment });
    res.json(segment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update customer segment' });
  }
});

// DELETE /api/segments/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `DELETE FROM customer_segments WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer segment not found' });
    await publish('segment.deleted', { tenantId: req.tenantId, id: req.params.id });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete customer segment' });
  }
});

module.exports = router;
