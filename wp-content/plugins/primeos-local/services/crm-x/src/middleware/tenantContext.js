// In production this header is set by the API Gateway after validating the
// caller's JWT — it should never be trusted if it arrives directly from the
// public internet. For local dev without a gateway in front yet, we accept
// it directly so you can build service-by-service before wiring up Traefik.
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
module.exports.default = tenantContext;
