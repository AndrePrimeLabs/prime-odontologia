const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/activities
router.post('/', async (req, res) => {
  const { name, category, owner_id, status = 'active', priority = 3, kpi_target, kpi_actual, frequency = 'daily' } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'name and category are required' });

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO key_activities (tenant_id, name, category, owner_id, status, priority, kpi_target, kpi_actual, frequency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.tenantId, name, category, owner_id, status, priority, kpi_target, kpi_actual, frequency]
    );
    const activity = result.rows[0];
    await publish('activity.created', { tenantId: req.tenantId, activity });
    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create key activity' });
  }
});

// GET /api/activities
router.get('/', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM key_activities ORDER BY priority ASC, created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// GET /api/activities/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM key_activities WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Activity not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// PUT /api/activities/:id
router.put('/:id', async (req, res) => {
  const { name, category, owner_id, status, priority, kpi_target, kpi_actual, frequency } = req.body;
  try {
    const result = await tenantQuery(
      req.tenantId,
      `UPDATE key_activities
       SET name = COALESCE($2, name),
           category = COALESCE($3, category),
           owner_id = COALESCE($4, owner_id),
           status = COALESCE($5, status),
           priority = COALESCE($6, priority),
           kpi_target = COALESCE($7, kpi_target),
           kpi_actual = COALESCE($8, kpi_actual),
           frequency = COALESCE($9, frequency),
           updated_at = now()
       WHERE id = $1 RETURNING *`,
      [req.params.id, name, category, owner_id, status, priority, kpi_target, kpi_actual, frequency]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Activity not found' });
    const activity = result.rows[0];
    await publish('activity.updated', { tenantId: req.tenantId, activity });
    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

module.exports = router;
