const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/resources
router.post('/', async (req, res) => {
  const { name, resource_type = 'PHYSICAL', unit_value = 0, currency = 'BRL', quantity = 1, location, status = 'available', last_maintenance_date, next_maintenance_date } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO key_resources (tenant_id, name, resource_type, unit_value, currency, quantity, location, status, last_maintenance_date, next_maintenance_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.tenantId, name, resource_type, unit_value, currency, quantity, location, status, last_maintenance_date, next_maintenance_date]
    );
    const resource = result.rows[0];
    await publish('resource.created', { tenantId: req.tenantId, resource });
    res.status(201).json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create key resource' });
  }
});

// GET /api/resources
router.get('/', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM key_resources ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch key resources' });
  }
});

// GET /api/resources/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM key_resources WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Resource not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// PUT /api/resources/:id
router.put('/:id', async (req, res) => {
  const { name, resource_type, unit_value, currency, quantity, location, status, last_maintenance_date, next_maintenance_date } = req.body;
  try {
    const result = await tenantQuery(
      req.tenantId,
      `UPDATE key_resources
       SET name = COALESCE($2, name),
           resource_type = COALESCE($3, resource_type),
           unit_value = COALESCE($4, unit_value),
           currency = COALESCE($5, currency),
           quantity = COALESCE($6, quantity),
           location = COALESCE($7, location),
           status = COALESCE($8, status),
           last_maintenance_date = COALESCE($9, last_maintenance_date),
           next_maintenance_date = COALESCE($10, next_maintenance_date),
           updated_at = now()
       WHERE id = $1 RETURNING *`,
      [req.params.id, name, resource_type, unit_value, currency, quantity, location, status, last_maintenance_date, next_maintenance_date]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Resource not found' });
    const resource = result.rows[0];
    await publish('resource.updated', { tenantId: req.tenantId, resource });
    res.json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

module.exports = router;
