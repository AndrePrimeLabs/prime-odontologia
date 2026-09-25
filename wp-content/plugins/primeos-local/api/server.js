// ============================================================================
// PrimeOS Express API Server
// ============================================================================
// Custom backend for PrimeOS/OmniOS with Supabase integration
// Routes: /api/entities/* (CRUD operations)
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(morgan('combined'));
app.use(cors({
  origin: [
    'https://primeos.primeodontologia.com.br',
    'https://omnios.primeodontologia.com.br',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

const authenticateRequest = async (req, res, next) => {
  const serverApiKey = process.env.PRIMEOS_API_KEY;
  const providedApiKey = req.headers['x-primeos-key'];

  // 1. Check shared secret API key (for backend / cron callers)
  if (serverApiKey && providedApiKey === serverApiKey) {
    req.db = supabase;
    return next();
  }

  // 2. Check Supabase JWT Bearer token (for authenticated frontend users)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ') && supabaseAnonKey) {
    const token = authHeader.substring(7).trim();
    if (token) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          req.user = user;
          req.db = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } },
          });
          return next();
        }
      } catch (err) {
        // Token error handled below
      }
    }
  }

  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Valid authentication token (Bearer <token>) or x-primeos-key header required'
  });
};

// ============================================================================
// API ROUTES - CRUD for all entities
// ============================================================================

// Generic CRUD handler
const createCRUDRoutes = (router, tableName) => {
  // GET all records
  router.get(`/${tableName}`, async (req, res) => {
    try {
      const { data, error } = await req.db
        .from(tableName)
        .select('*')
        .limit(100);

      if (error) throw error;
      res.json(data || []);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET single record
  router.get(`/${tableName}/:id`, async (req, res) => {
    try {
      const { data, error } = await req.db
        .from(tableName)
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });

  // POST (Create)
  router.post(`/${tableName}`, async (req, res) => {
    try {
      const { data, error } = await req.db
        .from(tableName)
        .insert([req.body])
        .select();

      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // PUT (Update)
  router.put(`/${tableName}/:id`, async (req, res) => {
    try {
      const { data, error } = await req.db
        .from(tableName)
        .update(req.body)
        .eq('id', req.params.id)
        .select();

      if (error) throw error;
      res.json(data[0]);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE
  router.delete(`/${tableName}/:id`, async (req, res) => {
    try {
      const { error } = await req.db
        .from(tableName)
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // FILTER (Query)
  router.post(`/${tableName}/filter`, async (req, res) => {
    try {
      let query = req.db.from(tableName).select('*');

      // Apply filters from request body
      Object.entries(req.body).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      if (error) throw error;
      res.json(data || []);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
};

// Create API router
const apiRouter = express.Router();

// Register CRUD routes for all entities
const entities = [
  'customers',
  'patients',
  'patient_records',
  'appointments',
  'products',
  'sales',
  'leads',
  'tasks',
  'documents',
  'activities',
  'expenses',
  'user_engagement',
  'pop'
];

entities.forEach(entity => {
  createCRUDRoutes(apiRouter, entity);
});

app.use('/api/entities', authenticateRequest, apiRouter);

// ============================================================================
// SPECIAL ENDPOINTS
// ============================================================================

// Dashboard stats
app.get('/api/stats', authenticateRequest, async (req, res) => {
  try {
    const [customers, patients, sales, appointments] = await Promise.all([
      req.db.from('customers').select('id', { count: 'exact' }),
      req.db.from('patients').select('id', { count: 'exact' }),
      req.db.from('sales').select('total_amount'),
      req.db.from('appointments').select('id', { count: 'exact' })
    ]);

    const totalSales = sales.data?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;

    res.json({
      customers: customers.count || 0,
      patients: patients.count || 0,
      totalSales,
      appointments: appointments.count || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 PrimeOS API running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/entities`);
});
