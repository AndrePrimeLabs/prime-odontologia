const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/propositions
router.post('/', async (req, res) => {
  const { name, core_promise, segment_id, pillars = [], pain_relievers = [], gain_creators = [], fit_score = 80.0, is_active = true } = req.body;
  if (!name || !core_promise) return res.status(400).json({ error: 'name and core_promise are required' });

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO value_propositions (tenant_id, name, core_promise, segment_id, pillars, pain_relievers, gain_creators, fit_score, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.tenantId, name, core_promise, segment_id, JSON.stringify(pillars), JSON.stringify(pain_relievers), JSON.stringify(gain_creators), fit_score, is_active]
    );
    const proposition = result.rows[0];
    await publish('proposition.created', { tenantId: req.tenantId, proposition });
    res.status(201).json(proposition);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create value proposition' });
  }
});

// GET /api/propositions
router.get('/', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM value_propositions ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch value propositions' });
  }
});

// GET /api/propositions/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM value_propositions WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Value proposition not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch value proposition' });
  }
});

// PUT /api/propositions/:id
router.put('/:id', async (req, res) => {
  const { name, core_promise, segment_id, pillars, pain_relievers, gain_creators, fit_score, is_active } = req.body;
  try {
    const result = await tenantQuery(
      req.tenantId,
      `UPDATE value_propositions
       SET name = COALESCE($2, name),
           core_promise = COALESCE($3, core_promise),
           segment_id = COALESCE($4, segment_id),
           pillars = COALESCE($5, pillars),
           pain_relievers = COALESCE($6, pain_relievers),
           gain_creators = COALESCE($7, gain_creators),
           fit_score = COALESCE($8, fit_score),
           is_active = COALESCE($9, is_active),
           updated_at = now()
       WHERE id = $1 RETURNING *`,
      [
        req.params.id,
        name,
        core_promise,
        segment_id,
        pillars ? JSON.stringify(pillars) : null,
        pain_relievers ? JSON.stringify(pain_relievers) : null,
        gain_creators ? JSON.stringify(gain_creators) : null,
        fit_score,
        is_active
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Value proposition not found' });
    const proposition = result.rows[0];
    await publish('proposition.updated', { tenantId: req.tenantId, proposition });
    res.json(proposition);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update value proposition' });
  }
});

module.exports = router;
