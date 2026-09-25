const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/interactions
router.post('/', async (req, res) => {
  const { customer_id, channel, notes } = req.body;
  if (!customer_id || !channel) {
    return res.status(400).json({ error: 'customer_id and channel are required' });
  }
  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO interactions (tenant_id, customer_id, channel, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.tenantId, customer_id, channel, notes]
    );
    const interaction = result.rows[0];
    await publish('interaction.logged', { tenantId: req.tenantId, interaction });
    res.status(201).json(interaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log interaction' });
  }
});

module.exports = router;
