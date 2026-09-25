-- PrimeOS schema: finance
create table if not exists financial_transactions (
  id uuid primary key default uuid_generate_v4(),
  description text, type text, category text, amount numeric, amount_paid numeric,
  status text default 'pending', date date, due_date date,
  scheduled_payment_date date, payment_method text, payment_date date,
  invoice_number text, invoice_url text, patient_id uuid, patient_name text,
  patient_email text, supplier text, is_recurring boolean default false,
  recurrence_period text, recurrence_day int, partial_payments jsonb default '[]',
  boleto_id text, boleto_url text, boleto_barcode text, boleto_status text,
  boleto_generated_at timestamptz, boleto_paid_at timestamptz,
  stripe_session_id text, stripe_payment_link text, bank_statement_ref text,
  reminder_sent_at timestamptz, reminder_count int default 0, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists financial_goals (
  id uuid primary key default uuid_generate_v4(),
  name text, target_amount numeric, current_amount numeric default 0,
  deadline date, status text default 'active', category text, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists budgets (
  id uuid primary key default uuid_generate_v4(),
  name text, category text, amount numeric, period text,
  start_date date, end_date date, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  description text, category text, amount numeric, date date,
  payment_method text, status text default 'pending', supplier text, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists assets (
  id uuid primary key default uuid_generate_v4(),
  name text, category text, value numeric, acquisition_date date,
  depreciation_rate numeric, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, category text, price numeric,
  status text default 'active', sku text, image_url text, tags jsonb default '[]',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists sales (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, product_id uuid, quantity int default 1,
  unit_price numeric, total_amount numeric, channel text, status text default 'completed',
  sale_date date, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create index if not exists idx_financial_transactions_date on financial_transactions (date);
create index if not exists idx_financial_transactions_status on financial_transactions (status);
