const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/personas
router.post('/', async (req, res) => {
  const {
    segment_id,
    persona_name,
    occupation,
    primary_pain_points = [],
    desired_gains = [],
    buying_criteria = []
  } = req.body;

  if (!segment_id || !persona_name) {
    return res.status(400).json({ error: 'segment_id and persona_name are required' });
  }

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO segment_personas (
        tenant_id, segment_id, persona_name, occupation,
        primary_pain_points, desired_gains, buying_criteria
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        req.tenantId,
        segment_id,
        persona_name,
        occupation,
        JSON.stringify(primary_pain_points),
        JSON.stringify(desired_gains),
        JSON.stringify(buying_criteria)
      ]
    );
    const persona = result.rows[0];
    await publish('persona.created', { tenantId: req.tenantId, persona });
    res.status(201).json(persona);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create segment persona' });
  }
});

// GET /api/personas
router.get('/', async (req, res) => {
  try {
    const { segment_id } = req.query;
    let query = `SELECT * FROM segment_personas`;
    const params = [];
    if (segment_id) {
      query += ` WHERE segment_id = $1 ORDER BY created_at DESC`;
      params.push(segment_id);
    } else {
      query += ` ORDER BY created_at DESC`;
    }
    const result = await tenantQuery(req.tenantId, query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch segment personas' });
  }
});

// GET /api/personas/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM segment_personas WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Persona not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch persona' });
  }
});

module.exports = router;
