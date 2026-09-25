# Supabase Backend Setup for PrimeOS & OmniOS

## Step 1: Create Supabase Projects

### For PrimeOS (Dental Clinic)
1. Go to https://supabase.com
2. Click "New Project"
3. Name: `primeos-clinic`
4. Region: Closest to Brazil (São Paulo if available)
5. Create password
6. Wait for project to initialize

### For OmniOS (Generic Business)
1. Repeat above steps
2. Name: `omnios-business`

### Get Your Credentials
After each project is created, go to **Settings → API**:
- Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
- Copy **anon key** (for frontend)
- Copy **service role key** (for backend, keep secret!)

## Step 2: Update Environment Variables

### Local Development (.env)
```bash
# PrimeOS (Dental)
VITE_SUPABASE_URL_PRIMEOS=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY_PRIMEOS=eyJ...

# OmniOS (Business)
VITE_SUPABASE_URL_OMNIOS=https://yyyyy.supabase.co
VITE_SUPABASE_ANON_KEY_OMNIOS=eyJ...
```

### Production (.env.production)
Same as above, with production Supabase URLs

## Step 3: Database Schema

Create these tables in each Supabase project using the SQL below:

### Core Tables

#### customers
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE,
  phone VARCHAR,
  address VARCHAR,
  city VARCHAR,
  state VARCHAR,
  zip_code VARCHAR,
  country VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### patients
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  date_of_birth DATE,
  gender VARCHAR,
  cpf VARCHAR UNIQUE,
  address VARCHAR,
  city VARCHAR,
  state VARCHAR,
  zip_code VARCHAR,
  emergency_contact VARCHAR,
  emergency_phone VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### patient_records
```sql
CREATE TABLE patient_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  medical_history JSONB,
  allergies JSONB,
  medications JSONB,
  prescriptions JSONB,
  family_history JSONB,
  x_rays JSONB,
  documents JSONB,
  checkup_schedule JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### appointments
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  patient_name VARCHAR,
  appointment_date TIMESTAMP NOT NULL,
  appointment_time VARCHAR,
  service VARCHAR,
  dentist_name VARCHAR,
  status VARCHAR DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category VARCHAR,
  sku VARCHAR UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### sales
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  sale_date TIMESTAMP DEFAULT NOW(),
  payment_method VARCHAR,
  status VARCHAR DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### leads
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  company VARCHAR,
  status VARCHAR DEFAULT 'new',
  source VARCHAR,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  assigned_to VARCHAR,
  due_date DATE,
  priority VARCHAR DEFAULT 'medium',
  status VARCHAR DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  document_type VARCHAR,
  document_url VARCHAR NOT NULL,
  description TEXT,
  created_date TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### activities
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR,
  activity_type VARCHAR,
  description TEXT,
  entity_id VARCHAR,
  entity_type VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### expenses
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR,
  amount DECIMAL(10, 2),
  description TEXT,
  date TIMESTAMP DEFAULT NOW(),
  payment_method VARCHAR,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### user_engagement
```sql
CREATE TABLE user_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR,
  event_type VARCHAR,
  page VARCHAR,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### pop (Point of Presence / Configuration)
```sql
CREATE TABLE pop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Step 4: Enable Row Level Security (RLS)

Go to **Authentication → Policies** and enable RLS on all tables:

```sql
-- Example for patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own patients"
  ON patients FOR SELECT
  USING (auth.uid()::text = user_id OR true);
```

## Step 5: Update Frontend Environment

Create `.env.local`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=PrimeOS
```

## Step 6: Test Connection

Run: `npm run dev`

If tables are accessible, you're good to deploy!

## Multi-Domain Setup

### Automatic Domain Detection
Your app will auto-detect which domain is being used and connect to the appropriate Supabase project.

Add to `src/api/config.js`:
```javascript
const getDomainConfig = () => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('primeos.primeodontologia.com.br')) {
    return {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL_PRIMEOS,
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY_PRIMEOS,
      appName: 'PrimeOS'
    };
  }
  
  if (hostname.includes('omnios.omnios.com.br')) {
    return {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL_OMNIOS,
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY_OMNIOS,
      appName: 'OmniOS'
    };
  }
  
  // Default to PrimeOS for local dev
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    appName: 'PrimeOS'
  };
};
```

## Next Steps

1. Create both Supabase projects
2. Run SQL schema in each project
3. Get your API keys
4. Update `.env` files
5. Test locally
6. Deploy to VPS

**Need help?** Let me know!
