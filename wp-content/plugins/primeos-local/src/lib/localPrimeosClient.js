import databaseSeed from '../../data/database.json' with { type: 'json' };
import { resolveFunctionUrl } from '@/lib/functionsApi';

const clone = (value) => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

const nowIso = () => new Date().toISOString();

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const state = clone(databaseSeed?.data || {});
const subscribers = new Map();
const entityApiCache = new Map();

const ensureEntity = (entityName) => {
  if (!Array.isArray(state[entityName])) state[entityName] = [];
  if (!subscribers.has(entityName)) subscribers.set(entityName, new Set());
};

const notify = (entityName, payload) => {
  const listeners = subscribers.get(entityName);
  if (!listeners) return;
  listeners.forEach((callback) => {
    try {
      callback(payload);
    } catch {
      // no-op
    }
  });
};

const compareValues = (a, b) => {
  const left = a ?? '';
  const right = b ?? '';

  if (typeof left === 'number' && typeof right === 'number') return left - right;

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base'
  });
};

const sortItems = (items, orderBy) => {
  if (!orderBy) return items;

  const direction = orderBy.startsWith('-') ? -1 : 1;
  const field = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;

  return [...items].sort((a, b) => compareValues(a?.[field], b?.[field]) * direction);
};

const buildFromSchema = (schema) => {
  if (!schema || typeof schema !== 'object') return null;

  if (schema.type === 'object') {
    const output = {};
    Object.entries(schema.properties || {}).forEach(([key, childSchema]) => {
      output[key] = buildFromSchema(childSchema);
    });
    return output;
  }

  if (schema.type === 'array') return [];
  if (schema.type === 'number' || schema.type === 'integer') return 0;
  if (schema.type === 'boolean') return false;

  return '';
};

const getEntityApi = (entityName) => {
  if (entityApiCache.has(entityName)) return entityApiCache.get(entityName);

  ensureEntity(entityName);

  const api = {
    async list(orderBy, limit) {
      ensureEntity(entityName);
      const items = sortItems(state[entityName], orderBy);
      return clone(typeof limit === 'number' ? items.slice(0, limit) : items);
    },

    async filter(filters = {}) {
      ensureEntity(entityName);
      const entries = Object.entries(filters || {});
      const filtered = state[entityName].filter((item) =>
        entries.every(([key, value]) => item?.[key] === value)
      );
      return clone(filtered);
    },

    async get(id) {
      ensureEntity(entityName);
      const item = state[entityName].find((record) => String(record?.id) === String(id));
      if (!item) throw new Error(`${entityName} record not found`);
      return clone(item);
    },

    async create(payload = {}) {
      ensureEntity(entityName);
      const item = {
        ...payload,
        id: payload.id || generateId(),
        created_date: payload.created_date || nowIso(),
        updated_date: nowIso()
      };

      state[entityName].push(item);
      const result = clone(item);
      notify(entityName, { type: 'create', record: result });
      return result;
    },

    async update(id, payload = {}) {
      ensureEntity(entityName);
      const index = state[entityName].findIndex((item) => String(item?.id) === String(id));
      if (index === -1) throw new Error(`${entityName} record not found`);

      const updated = {
        ...state[entityName][index],
        ...payload,
        id: state[entityName][index].id,
        updated_date: nowIso()
      };

      state[entityName][index] = updated;
      const result = clone(updated);
      notify(entityName, { type: 'update', record: result });
      return result;
    },

    async delete(id) {
      ensureEntity(entityName);
      const index = state[entityName].findIndex((item) => String(item?.id) === String(id));
      if (index === -1) return { success: true };

      const [deleted] = state[entityName].splice(index, 1);
      notify(entityName, { type: 'delete', record: clone(deleted) });
      return { success: true };
    },

    subscribe(callback) {
      ensureEntity(entityName);
      const listeners = subscribers.get(entityName);
      listeners.add(callback);
      return () => listeners.delete(callback);
    }
  };

  entityApiCache.set(entityName, api);
  return api;
};

export const createLocalPrimeosClient = () => ({
  entities: new Proxy(
    {},
    {
      get(_target, entityName) {
        if (typeof entityName !== 'string') return undefined;
        return getEntityApi(entityName);
      }
    }
  ),

  auth: {
    async me() {
      return {
        id: 'local-user',
        email: 'local@primeos.app',
        name: 'Local User'
      };
    }
  },

  functions: {
    async invoke(name, payload = {}) {
      try {
        const response = await fetch(resolveFunctionUrl(name), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Function ${name} failed with status ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) return await response.json();
        return { result: await response.text() };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Local function invocation failed'
        };
      }
    }
  },

  integrations: {
    Core: {
      async InvokeLLM({ response_json_schema }) {
        return buildFromSchema(response_json_schema) || { result: 'LLM unavailable in local mode' };
      }
    }
  }
});
