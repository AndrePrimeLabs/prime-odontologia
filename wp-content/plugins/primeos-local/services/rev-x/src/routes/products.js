const express = require('express');
const { tenantQuery } = require('../db');
const { publish } = require('../events');

const router = express.Router();

// POST /api/products
router.post('/', async (req, res) => {
  const { sku, name, category, base_price = 0, currency = 'BRL', max_installments = 12, is_active = true } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'name and category are required' });

  try {
    const result = await tenantQuery(
      req.tenantId,
      `INSERT INTO products (tenant_id, sku, name, category, base_price, currency, max_installments, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.tenantId, sku, name, category, base_price, currency, max_installments, is_active]
    );
    const product = result.rows[0];
    await publish('product.created', { tenantId: req.tenantId, product });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM products ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await tenantQuery(
      req.tenantId,
      `SELECT * FROM products WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  const { sku, name, category, base_price, currency, max_installments, is_active } = req.body;
  try {
    const result = await tenantQuery(
      req.tenantId,
      `UPDATE products
       SET sku = COALESCE($2, sku),
           name = COALESCE($3, name),
           category = COALESCE($4, category),
           base_price = COALESCE($5, base_price),
           currency = COALESCE($6, currency),
           max_installments = COALESCE($7, max_installments),
           is_active = COALESCE($8, is_active),
           updated_at = now()
       WHERE id = $1 RETURNING *`,
      [req.params.id, sku, name, category, base_price, currency, max_installments, is_active]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const product = result.rows[0];
    await publish('product.updated', { tenantId: req.tenantId, product });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

module.exports = router;
