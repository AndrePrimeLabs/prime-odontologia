const hasUnresolvedTemplate = (value) => {
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes('${{') ||
    normalized.includes('{{') ||
    normalized.includes('}}') ||
    normalized.includes('%7b%7b') ||
    normalized.includes('secrets.')
  );
};

const normalizeBase = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || hasUnresolvedTemplate(trimmed)) return null;
  return trimmed.replace(/\/+$/, '');
};

export const resolveFunctionsBaseUrl = () => {
  const viteEnv = /** @type {any} */ (import.meta)?.env || {};

  const explicitFunctionsBase = normalizeBase(viteEnv.VITE_FUNCTIONS_API_URL);
  if (explicitFunctionsBase) return explicitFunctionsBase;

  const backendBase = normalizeBase(viteEnv.VITE_BACKEND_API_URL);
  if (backendBase) return `${backendBase}/api/functions`;

  return '/api/functions';
};

export const resolveFunctionUrl = (name) => {
  const safeName = String(name || '').replace(/^\/+/, '');
  return `${resolveFunctionsBaseUrl()}/${safeName}`;
};
