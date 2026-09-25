const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/campaigns
router.post('/', async (req, res) => {
  const { channel_id, name, status = 'draft', budget = 0, spent = 0, impressions = 0, clicks = 0, leads_generated = 0, start_date, end_date } = req.body;
  if (!channel_id || !name) return res.status(400).json({ error: 'channel_id and name are required' });

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO campaigns (tenant_id, channel_id, name, status, budget, spent, impressions, clicks, leads_generated, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [req.tenantId, channel_id, name, status, budget, spent, impressions, clicks, leads_generated, start_date, end_date]
    );
    const campaign = result.rows[0];
    await publish('campaign.created', { tenantId: req.tenantId, campaign });
    res.status(201).json(campaign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// GET /api/campaigns
router.get('/', async (req, res) => {
  try {
    const { channel_id } = req.query;
    let query = `SELECT * FROM campaigns`;
    const params = [];
    if (channel_id) {
      query += ` WHERE channel_id = $1 ORDER BY created_at DESC`;
      params.push(channel_id);
    } else {
      query += ` ORDER BY created_at DESC`;
    }
    const result = await tenantQuery(req.tenantId, query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// GET /api/campaigns/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM campaigns WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

module.exports = router;
