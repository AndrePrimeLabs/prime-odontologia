const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function tenantContext(req, res, next) {
  const tenantId = req.header('X-Tenant-Id');
  if (!tenantId) {
    return res.status(401).json({ error: 'Missing X-Tenant-Id header' });
  }
  if (!UUID_REGEX.test(tenantId)) {
    return res.status(400).json({ error: 'Invalid X-Tenant-Id format: must be a valid UUID' });
  }
  req.tenantId = tenantId;
  next();
}

module.exports = { tenantContext };
