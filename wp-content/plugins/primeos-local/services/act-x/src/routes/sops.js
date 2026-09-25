const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/sops
router.post('/', async (req, res) => {
  const { code, title, category, version = '1.0', steps = [], is_active = true } = req.body;
  if (!code || !title) return res.status(400).json({ error: 'code and title are required' });

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO sops (tenant_id, code, title, category, version, steps, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.tenantId, code, title, category, version, JSON.stringify(steps), is_active]
    );
    const sop = result.rows[0];
    await publish('sop.created', { tenantId: req.tenantId, sop });
    res.status(201).json(sop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create SOP' });
  }
});

// GET /api/sops
router.get('/', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM sops ORDER BY code ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch SOPs' });
  }
});

// GET /api/sops/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM sops WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'SOP not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch SOP' });
  }
});

module.exports = router;
