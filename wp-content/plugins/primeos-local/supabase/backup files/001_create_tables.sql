-- 1. Create your frontend table safely
CREATE TABLE IF NOT EXISTS your_new_table_name (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_by_id UUID
);

-- 2. Enable Row Level Security
ALTER TABLE your_new_table_name ENABLE ROW LEVEL SECURITY;

-- 3. FORCE DROP the old policy if it exists to prevent the 42710 error
DROP POLICY IF EXISTS "allow_all_your_new_table_name" ON your_new_table_name;

-- 4. Create the policy fresh without any name conflicts
CREATE POLICY "allow_all_your_new_table_name" 
ON your_new_table_name 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


create extension if not exists "uuid-ossp";

create table if not exists patient_records (
  id uuid primary key default uuid_generate_v4(),
  patient_name text, patient_email text, patient_phone text, patient_id text,
  date_of_birth date, blood_type text, allergies jsonb default '[]',
  current_medications jsonb default '[]', medical_conditions jsonb default '[]',
  past_treatments jsonb default '[]', consents jsonb default '[]',
  x_rays jsonb default '[]', dental_records jsonb, appointments_history jsonb default '[]',
  insurance_info jsonb, emergency_contact jsonb, notes text, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists dentists (
  id uuid primary key default uuid_generate_v4(),
  name text, email text, phone text, cro text, specialty text,
  color text, avatar_url text, slot_duration_minutes int default 30,
  working_hours jsonb, services jsonb default '[]', notes text, is_active boolean default true,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists dentist_blockouts (
  id uuid primary key default uuid_generate_v4(),
  dentist_id uuid, start_datetime timestamptz, end_datetime timestamptz,
  reason text, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  date date, time text, duration_minutes int,
  patient_id uuid, patient_name text, patient_phone text,
  dentist_id uuid, resource_id uuid, resource_name text,
  service_type text, status text default 'scheduled',
  payment_status text default 'pending', payment_method text,
  payment_date date, price numeric, invoice_number text, notes text,
  follow_up_required boolean default false, follow_up_notes text, follow_up_days int,
  reminder_sent boolean default false, reminder_confirmed boolean default false,
  ehr_synced boolean default false, ehr_id text, ehr_system text, ehr_sync_date timestamptz,
  provider text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists resources (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, status text default 'available', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists clinical_notes (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, appointment_id uuid, provider text,
  chief_complaint text, diagnosis text, treatment_plan text,
  medications jsonb default '[]', follow_up_required boolean default false,
  follow_up_date date, follow_up_notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists medical_records (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, title text, record_type text,
  content text, date date, provider text, medications jsonb default '[]',
  chronic_conditions jsonb default '[]', past_procedures jsonb default '[]',
  allergies jsonb default '[]', attachments jsonb default '[]',
  synced_to_ehr boolean default false, ehr_id text, last_ehr_sync timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text, email text, phone text, company text, profession text,
  city text, state text, birth_date date, source text, segment text, value_tier text,
  status text default 'active', tags jsonb default '[]', interests jsonb default '[]',
  custom_fields jsonb, lifetime_value numeric default 0, last_contact_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists customer_segments (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, criteria jsonb,
  customer_count int default 0, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  name text, email text, phone text, status text default 'novo',
  temperatura text, interesse text, segmento text, fonte_original text, canal_conversao text,
  campanha_id uuid, origem_canal_id uuid, lead_score numeric default 0,
  ai_score numeric, ai_classification text, ai_analysis jsonb, ai_conversion_probability numeric,
  valor_estimado numeric, lifetime_value numeric default 0, total_interacoes int default 0,
  taxa_resposta numeric, tempo_medio_resposta numeric, ultima_interacao timestamptz,
  data_entrada timestamptz default now(), tags jsonb default '[]', notas text,
  workflow_ativo boolean default false, workflow_etapa text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists lead_interactions (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid, type text, subject text, description text,
  outcome text, next_action text, next_action_date date,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists interactions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, type text, subject text, description text,
  outcome text, next_action text, next_action_date date,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists client_journeys (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, stage text, status text, notes text,
  started_at timestamptz, completed_at timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists crm_appointments (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, appointment_id uuid, crm_id text,
  status text, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

-- Safe Loop block that automatically verifies tables before applying RLS
DO $$ 
DECLARE 
  t TEXT;
BEGIN
  -- Loop through every single table in your system
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
  LOOP
    -- 1. Explicitly drop the policy first to prevent the 42710 error completely
    EXECUTE FORMAT('DROP POLICY IF EXISTS "allow_all_%s" ON public.%I', t, t);
    
    -- 2. Turn on RLS for the table
    EXECUTE FORMAT('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    
    -- 3. Create the fresh policy safely
    EXECUTE FORMAT('CREATE POLICY "allow_all_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;


create extension if not exists "uuid-ossp";

create table if not exists patient_records (
  id uuid primary key default uuid_generate_v4(),
  patient_name text, patient_email text, patient_phone text, patient_id text,
  date_of_birth date, blood_type text, allergies jsonb default '[]',
  current_medications jsonb default '[]', medical_conditions jsonb default '[]',
  past_treatments jsonb default '[]', consents jsonb default '[]',
  x_rays jsonb default '[]', dental_records jsonb, appointments_history jsonb default '[]',
  insurance_info jsonb, emergency_contact jsonb, notes text, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists dentists (
  id uuid primary key default uuid_generate_v4(),
  name text, email text, phone text, cro text, specialty text,
  color text, avatar_url text, slot_duration_minutes int default 30,
  working_hours jsonb, services jsonb default '[]', notes text, is_active boolean default true,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists dentist_blockouts (
  id uuid primary key default uuid_generate_v4(),
  dentist_id uuid, start_datetime timestamptz, end_datetime timestamptz,
  reason text, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  date date, time text, duration_minutes int,
  patient_id uuid, patient_name text, patient_phone text,
  dentist_id uuid, resource_id uuid, resource_name text,
  service_type text, status text default 'scheduled',
  payment_status text default 'pending', payment_method text,
  payment_date date, price numeric, invoice_number text, notes text,
  follow_up_required boolean default false, follow_up_notes text, follow_up_days int,
  reminder_sent boolean default false, reminder_confirmed boolean default false,
  ehr_synced boolean default false, ehr_id text, ehr_system text, ehr_sync_date timestamptz,
  provider text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists resources (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, status text default 'available', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists clinical_notes (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, appointment_id uuid, provider text,
  chief_complaint text, diagnosis text, treatment_plan text,
  medications jsonb default '[]', follow_up_required boolean default false,
  follow_up_date date, follow_up_notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists medical_records (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, title text, record_type text,
  content text, date date, provider text, medications jsonb default '[]',
  chronic_conditions jsonb default '[]', past_procedures jsonb default '[]',
  allergies jsonb default '[]', attachments jsonb default '[]',
  synced_to_ehr boolean default false, ehr_id text, last_ehr_sync timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text, email text, phone text, company text, profession text,
  city text, state text, birth_date date, source text, segment text, value_tier text,
  status text default 'active', tags jsonb default '[]', interests jsonb default '[]',
  custom_fields jsonb, lifetime_value numeric default 0, last_contact_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists customer_segments (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, criteria jsonb,
  customer_count int default 0, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  name text, email text, phone text, status text default 'novo',
  temperatura text, interesse text, segmento text, fonte_original text, canal_conversao text,
  campanha_id uuid, origem_canal_id uuid, lead_score numeric default 0,
  ai_score numeric, ai_classification text, ai_analysis jsonb, ai_conversion_probability numeric,
  valor_estimado numeric, lifetime_value numeric default 0, total_interacoes int default 0,
  taxa_resposta numeric, tempo_medio_resposta numeric, ultima_interacao timestamptz,
  data_entrada timestamptz default now(), tags jsonb default '[]', notas text,
  workflow_ativo boolean default false, workflow_etapa text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists lead_interactions (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid, type text, subject text, description text,
  outcome text, next_action text, next_action_date date,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists interactions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, type text, subject text, description text,
  outcome text, next_action text, next_action_date date,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists client_journeys (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, stage text, status text, notes text,
  started_at timestamptz, completed_at timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists crm_appointments (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, appointment_id uuid, crm_id text,
  status text, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);
DO $$ 
DECLARE 
  t TEXT;
BEGIN
  -- Loop through every single table in your system
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
  LOOP
    -- 1. Explicitly drop the policy first to prevent the 42710 error completely
    EXECUTE FORMAT('DROP POLICY IF EXISTS "allow_all_%s" ON public.%I', t, t);
    
    -- 2. Turn on RLS for the table
    EXECUTE FORMAT('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    
    -- 3. Create the fresh policy safely
    EXECUTE FORMAT('CREATE POLICY "allow_all_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;


create table if not exists crm_sync_settings (
  id uuid primary key default uuid_generate_v4(),
  entity_type text, sync_enabled boolean default false,
  sync_interval int, last_sync timestamptz, settings jsonb,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists crm_workflows (
  id uuid primary key default uuid_generate_v4(),
  name text, trigger text, actions jsonb default '[]',
  status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

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
  name text, category text, amount numeric, spent numeric default 0,
  period text, start_date date, end_date date, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  description text, category text, amount numeric, date date,
  payment_method text, supplier text, receipt_url text,
  status text default 'pending', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists assets (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, category text, value numeric, purchase_date date,
  depreciation_rate numeric, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, category text, sku text,
  price numeric, cost numeric, currency text default 'BRL',
  stock_quantity int default 0, min_stock_level int default 0,
  image_url text, status text default 'active',
  whatsapp_enabled boolean default false, whatsapp_message_template text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists sales (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, customer_name text, products jsonb default '[]',
  total_amount numeric, currency text default 'BRL',
  status text default 'pending', payment_status text default 'pending',
  channel text, whatsapp_order_id text, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists sales_scripts (
  id uuid primary key default uuid_generate_v4(),
  name text, content text, category text, status text default 'active',
  tags jsonb default '[]', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text, status text default 'draft', oferta text,
  canal_principal_id uuid, estrategia_id uuid, whatsapp_flow text, landing_page text,
  orcamento numeric, data_inicio date, data_fim date, meta_leads int, meta_conversao numeric,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists market_strategies (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, status text default 'active',
  goals jsonb default '[]', tactics jsonb default '[]', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists marketing_channels (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, status text default 'active',
  budget numeric, roi numeric, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists marketing_metrics (
  id uuid primary key default uuid_generate_v4(),
  name text, value numeric, unit text, period text,
  channel_id uuid, campaign_id uuid, date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists channels (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, status text default 'active', config jsonb, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists ab_tests (
  id uuid primary key default uuid_generate_v4(),
  name text, status text default 'draft', variant_a jsonb, variant_b jsonb,
  metric text, result text, start_date date, end_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists email_sequences (
  id uuid primary key default uuid_generate_v4(),
  name text, status text default 'draft', trigger text,
  steps jsonb default '[]', tags jsonb default '[]', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  titulo text, descricao text, status text default 'pendente',
  prioridade text default 'media', categoria text, progresso int default 0,
  data_vencimento timestamptz, data_conclusao timestamptz,
  responsaveis jsonb default '[]', checklist jsonb default '[]',
  subtarefas jsonb default '[]', observacoes text, pop_id uuid, pop_codigo text,
  tarefa_pai_id uuid, template_id uuid, recorrente boolean default false,
  frequencia_recorrencia text, proxima_ocorrencia timestamptz,
  notificacao_enviada boolean default false,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists pops (
  id uuid primary key default uuid_generate_v4(),
  codigo text, nome text, objetivo text, descricao text,
  responsavel text, frequencia text, categoria text, status text default 'ativo',
  versao text, arquivo_url text, favorito boolean default false,
  checklist jsonb default '[]', pontos_atencao jsonb default '[]',
  indicadores jsonb default '[]', tags jsonb default '[]',
  historico_versoes jsonb default '[]',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists sops (
  id uuid primary key default uuid_generate_v4(),
  name text, area text, owner text, goal text, primary_offer text,
  status text default 'active', last_update date, kpi_principal text, content jsonb,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  title text, description text, status text default 'pending',
  priority text default 'medium', category text, progress int default 0,
  start_date date, due_date date, assigned_to text,
  estimated_hours numeric, actual_hours numeric, pop_codigo text, file_url text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists automation_workflows (
  id uuid primary key default uuid_generate_v4(),
  name text, trigger text, actions jsonb default '[]',
  status text default 'active', last_run timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists knowledge_bases (
  id uuid primary key default uuid_generate_v4(),
  title text, content text, category text, tags jsonb default '[]',
  status text default 'published', author text, views int default 0,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  title text, content text, type text, file_url text,
  status text default 'active', tags jsonb default '[]', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text, category text, sku text, quantity int default 0,
  min_quantity int default 0, unit_price numeric, supplier text,
  status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  title text, description text, status text default 'open',
  priority text default 'medium', customer_id uuid, customer_name text,
  assigned_to text, resolved_at timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists follow_ups (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, appointment_id uuid, type text,
  status text default 'pending', scheduled_date timestamptz,
  completed_date timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists follow_up_logs (
  id uuid primary key default uuid_generate_v4(),
  follow_up_id uuid, action text, notes text, performed_by text,
  performed_at timestamptz, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists follow_up_rules (
  id uuid primary key default uuid_generate_v4(),
  name text, trigger text, delay_days int, message_template text,
  channel text, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists reminder_schedules (
  id uuid primary key default uuid_generate_v4(),
  entity_type text, entity_id uuid, reminder_date timestamptz,
  message text, channel text, status text default 'pending',
  sent_at timestamptz, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists user_engagements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid, action text, entity_type text, entity_id uuid,
  metadata jsonb, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists user_points (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid, points int default 0, reason text, entity_type text,
  entity_id uuid, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid, badge_name text, badge_icon text, earned_at timestamptz,
  reason text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists project_seos (
  id uuid primary key default uuid_generate_v4(),
  name text, status text default 'active', goals jsonb default '[]',
  start_date date, end_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists tarefa_seos (
  id uuid primary key default uuid_generate_v4(),
  title text, description text, status text default 'pending',
  priority text, project_id uuid, due_date date, assigned_to text, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists palavra_chaves (
  id uuid primary key default uuid_generate_v4(),
  keyword text, volume int, difficulty numeric, ranking int,
  url text, project_id uuid, status text default 'tracking', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists conteudo_seo (
  id uuid primary key default uuid_generate_v4(),
  title text, content text, keyword_id uuid, status text default 'draft',
  published_url text, views int default 0, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists back_links (
  id uuid primary key default uuid_generate_v4(),
  url text, source text, anchor_text text, domain_authority numeric,
  status text default 'active', acquired_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists relatorio_seos (
  id uuid primary key default uuid_generate_v4(),
  title text, period text, project_id uuid, metrics jsonb,
  insights text, recommendations text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists prime_growth_stages (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, order_index int, status text default 'active',
  metrics jsonb, goals jsonb, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists prime_funnel_leads (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid, stage text, status text, score numeric,
  entered_at timestamptz, converted_at timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists prime_delegation_tasks (
  id uuid primary key default uuid_generate_v4(),
  title text, description text, assigned_to text, status text default 'pending',
  priority text, due_date date, completed_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists report_schedules (
  id uuid primary key default uuid_generate_v4(),
  name text, report_type text, frequency text, recipients jsonb default '[]',
  last_sent timestamptz, next_send timestamptz, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists custom_dashboards (
  id uuid primary key default uuid_generate_v4(),
  name text, layout jsonb, widgets jsonb default '[]',
  is_default boolean default false, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists key_partners (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, description text, contact_name text,
  contact_email text, contact_phone text, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists value_propositions (
  id uuid primary key default uuid_generate_v4(),
  title text, description text, target_segment text,
  benefits jsonb default '[]', differentiators jsonb default '[]',
  status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists business_strategies (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, goals jsonb default '[]',
  initiatives jsonb default '[]', status text default 'active',
  start_date date, end_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists contents (
  id uuid primary key default uuid_generate_v4(),
  title text, body text, type text, status text default 'draft',
  tags jsonb default '[]', author text, published_at timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists app_analytics (
  id uuid primary key default uuid_generate_v4(),
  event text, user_id uuid, metadata jsonb, session_id text,
  platform text, version text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists app_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid, rating int, review text, platform text,
  version text, status text default 'pending', response text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists app_versions (
  id uuid primary key default uuid_generate_v4(),
  version text, release_notes text, platform text,
  status text default 'active', released_at timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists mobile_apps (
  id uuid primary key default uuid_generate_v4(),
  name text, platform text, version text, bundle_id text,
  status text default 'active', config jsonb, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

-- Enable RLS on all tables
DO $$ 
DECLARE 
  t TEXT;
BEGIN
  -- Loop through every single table in your system
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
  LOOP
    -- 1. Explicitly drop the policy first to prevent the 42710 error completely
    EXECUTE FORMAT('DROP POLICY IF EXISTS "allow_all_%s" ON public.%I', t, t);
    
    -- 2. Turn on RLS for the table
    EXECUTE FORMAT('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    
    -- 3. Create the fresh policy safely
    EXECUTE FORMAT('CREATE POLICY "allow_all_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;


create extension if not exists "uuid-ossp";

create table if not exists patient_records (
  id uuid primary key default uuid_generate_v4(),
  patient_name text, patient_email text, patient_phone text, patient_id text,
  date_of_birth date, blood_type text, allergies jsonb default '[]',
  current_medications jsonb default '[]', medical_conditions jsonb default '[]',
  past_treatments jsonb default '[]', consents jsonb default '[]',
  x_rays jsonb default '[]', dental_records jsonb, appointments_history jsonb default '[]',
  insurance_info jsonb, emergency_contact jsonb, notes text, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists dentists (
  id uuid primary key default uuid_generate_v4(),
  name text, email text, phone text, cro text, specialty text,
  color text, avatar_url text, slot_duration_minutes int default 30,
  working_hours jsonb, services jsonb default '[]', notes text, is_active boolean default true,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists dentist_blockouts (
  id uuid primary key default uuid_generate_v4(),
  dentist_id uuid, start_datetime timestamptz, end_datetime timestamptz,
  reason text, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  date date, time text, duration_minutes int,
  patient_id uuid, patient_name text, patient_phone text,
  dentist_id uuid, resource_id uuid, resource_name text,
  service_type text, status text default 'scheduled',
  payment_status text default 'pending', payment_method text,
  payment_date date, price numeric, invoice_number text, notes text,
  follow_up_required boolean default false, follow_up_notes text, follow_up_days int,
  reminder_sent boolean default false, reminder_confirmed boolean default false,
  ehr_synced boolean default false, ehr_id text, ehr_system text, ehr_sync_date timestamptz,
  provider text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists resources (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, status text default 'available', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists clinical_notes (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, appointment_id uuid, provider text,
  chief_complaint text, diagnosis text, treatment_plan text,
  medications jsonb default '[]', follow_up_required boolean default false,
  follow_up_date date, follow_up_notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists medical_records (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, title text, record_type text,
  content text, date date, provider text, medications jsonb default '[]',
  chronic_conditions jsonb default '[]', past_procedures jsonb default '[]',
  allergies jsonb default '[]', attachments jsonb default '[]',
  synced_to_ehr boolean default false, ehr_id text, last_ehr_sync timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text, email text, phone text, company text, profession text,
  city text, state text, birth_date date, source text, segment text, value_tier text,
  status text default 'active', tags jsonb default '[]', interests jsonb default '[]',
  custom_fields jsonb, lifetime_value numeric default 0, last_contact_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists customer_segments (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, criteria jsonb,
  customer_count int default 0, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  name text, email text, phone text, status text default 'novo',
  temperatura text, interesse text, segmento text, fonte_original text, canal_conversao text,
  campanha_id uuid, origem_canal_id uuid, lead_score numeric default 0,
  ai_score numeric, ai_classification text, ai_analysis jsonb, ai_conversion_probability numeric,
  valor_estimado numeric, lifetime_value numeric default 0, total_interacoes int default 0,
  taxa_resposta numeric, tempo_medio_resposta numeric, ultima_interacao timestamptz,
  data_entrada timestamptz default now(), tags jsonb default '[]', notas text,
  workflow_ativo boolean default false, workflow_etapa text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists lead_interactions (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid, type text, subject text, description text,
  outcome text, next_action text, next_action_date date,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists interactions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, type text, subject text, description text,
  outcome text, next_action text, next_action_date date,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists client_journeys (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, stage text, status text, notes text,
  started_at timestamptz, completed_at timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists crm_appointments (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, appointment_id uuid, crm_id text,
  status text, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists crm_sync_settings (
  id uuid primary key default uuid_generate_v4(),
  entity_type text, sync_enabled boolean default false,
  sync_interval int, last_sync timestamptz, settings jsonb,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists crm_workflows (
  id uuid primary key default uuid_generate_v4(),
  name text, trigger text, actions jsonb default '[]',
  status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

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
  name text, category text, amount numeric, spent numeric default 0,
  period text, start_date date, end_date date, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  description text, category text, amount numeric, date date,
  payment_method text, supplier text, receipt_url text,
  status text default 'pending', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists assets (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, category text, value numeric, purchase_date date,
  depreciation_rate numeric, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, category text, sku text,
  price numeric, cost numeric, currency text default 'BRL',
  stock_quantity int default 0, min_stock_level int default 0,
  image_url text, status text default 'active',
  whatsapp_enabled boolean default false, whatsapp_message_template text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists sales (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, customer_name text, products jsonb default '[]',
  total_amount numeric, currency text default 'BRL',
  status text default 'pending', payment_status text default 'pending',
  channel text, whatsapp_order_id text, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists sales_scripts (
  id uuid primary key default uuid_generate_v4(),
  name text, content text, category text, status text default 'active',
  tags jsonb default '[]', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text, status text default 'draft', oferta text,
  canal_principal_id uuid, estrategia_id uuid, whatsapp_flow text, landing_page text,
  orcamento numeric, data_inicio date, data_fim date, meta_leads int, meta_conversao numeric,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists market_strategies (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, status text default 'active',
  goals jsonb default '[]', tactics jsonb default '[]', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists marketing_channels (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, status text default 'active',
  budget numeric, roi numeric, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists marketing_metrics (
  id uuid primary key default uuid_generate_v4(),
  name text, value numeric, unit text, period text,
  channel_id uuid, campaign_id uuid, date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists channels (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, status text default 'active', config jsonb, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists ab_tests (
  id uuid primary key default uuid_generate_v4(),
  name text, status text default 'draft', variant_a jsonb, variant_b jsonb,
  metric text, result text, start_date date, end_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists email_sequences (
  id uuid primary key default uuid_generate_v4(),
  name text, status text default 'draft', trigger text,
  steps jsonb default '[]', tags jsonb default '[]', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  titulo text, descricao text, status text default 'pendente',
  prioridade text default 'media', categoria text, progresso int default 0,
  data_vencimento timestamptz, data_conclusao timestamptz,
  responsaveis jsonb default '[]', checklist jsonb default '[]',
  subtarefas jsonb default '[]', observacoes text, pop_id uuid, pop_codigo text,
  tarefa_pai_id uuid, template_id uuid, recorrente boolean default false,
  frequencia_recorrencia text, proxima_ocorrencia timestamptz,
  notificacao_enviada boolean default false,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists pops (
  id uuid primary key default uuid_generate_v4(),
  codigo text, nome text, objetivo text, descricao text,
  responsavel text, frequencia text, categoria text, status text default 'ativo',
  versao text, arquivo_url text, favorito boolean default false,
  checklist jsonb default '[]', pontos_atencao jsonb default '[]',
  indicadores jsonb default '[]', tags jsonb default '[]',
  historico_versoes jsonb default '[]',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists sops (
  id uuid primary key default uuid_generate_v4(),
  name text, area text, owner text, goal text, primary_offer text,
  status text default 'active', last_update date, kpi_principal text, content jsonb,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  title text, description text, status text default 'pending',
  priority text default 'medium', category text, progress int default 0,
  start_date date, due_date date, assigned_to text,
  estimated_hours numeric, actual_hours numeric, pop_codigo text, file_url text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists automation_workflows (
  id uuid primary key default uuid_generate_v4(),
  name text, trigger text, actions jsonb default '[]',
  status text default 'active', last_run timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists knowledge_bases (
  id uuid primary key default uuid_generate_v4(),
  title text, content text, category text, tags jsonb default '[]',
  status text default 'published', author text, views int default 0,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  title text, content text, type text, file_url text,
  status text default 'active', tags jsonb default '[]', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text, category text, sku text, quantity int default 0,
  min_quantity int default 0, unit_price numeric, supplier text,
  status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  title text, description text, status text default 'open',
  priority text default 'medium', customer_id uuid, customer_name text,
  assigned_to text, resolved_at timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists follow_ups (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, appointment_id uuid, type text,
  status text default 'pending', scheduled_date timestamptz,
  completed_date timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists follow_up_logs (
  id uuid primary key default uuid_generate_v4(),
  follow_up_id uuid, action text, notes text, performed_by text,
  performed_at timestamptz, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists follow_up_rules (
  id uuid primary key default uuid_generate_v4(),
  name text, trigger text, delay_days int, message_template text,
  channel text, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists reminder_schedules (
  id uuid primary key default uuid_generate_v4(),
  entity_type text, entity_id uuid, reminder_date timestamptz,
  message text, channel text, status text default 'pending',
  sent_at timestamptz, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists user_engagements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid, action text, entity_type text, entity_id uuid,
  metadata jsonb, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists user_points (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid, points int default 0, reason text, entity_type text,
  entity_id uuid, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid, badge_name text, badge_icon text, earned_at timestamptz,
  reason text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists project_seos (
  id uuid primary key default uuid_generate_v4(),
  name text, status text default 'active', goals jsonb default '[]',
  start_date date, end_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists tarefa_seos (
  id uuid primary key default uuid_generate_v4(),
  title text, description text, status text default 'pending',
  priority text, project_id uuid, due_date date, assigned_to text, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists palavra_chaves (
  id uuid primary key default uuid_generate_v4(),
  keyword text, volume int, difficulty numeric, ranking int,
  url text, project_id uuid, status text default 'tracking', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists conteudo_seo (
  id uuid primary key default uuid_generate_v4(),
  title text, content text, keyword_id uuid, status text default 'draft',
  published_url text, views int default 0, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists back_links (
  id uuid primary key default uuid_generate_v4(),
  url text, source text, anchor_text text, domain_authority numeric,
  status text default 'active', acquired_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists relatorio_seos (
  id uuid primary key default uuid_generate_v4(),
  title text, period text, project_id uuid, metrics jsonb,
  insights text, recommendations text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists prime_growth_stages (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, order_index int, status text default 'active',
  metrics jsonb, goals jsonb, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists prime_funnel_leads (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid, stage text, status text, score numeric,
  entered_at timestamptz, converted_at timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists prime_delegation_tasks (
  id uuid primary key default uuid_generate_v4(),
  title text, description text, assigned_to text, status text default 'pending',
  priority text, due_date date, completed_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists report_schedules (
  id uuid primary key default uuid_generate_v4(),
  name text, report_type text, frequency text, recipients jsonb default '[]',
  last_sent timestamptz, next_send timestamptz, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists custom_dashboards (
  id uuid primary key default uuid_generate_v4(),
  name text, layout jsonb, widgets jsonb default '[]',
  is_default boolean default false, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists key_partners (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, description text, contact_name text,
  contact_email text, contact_phone text, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists value_propositions (
  id uuid primary key default uuid_generate_v4(),
  title text, description text, target_segment text,
  benefits jsonb default '[]', differentiators jsonb default '[]',
  status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists business_strategies (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, goals jsonb default '[]',
  initiatives jsonb default '[]', status text default 'active',
  start_date date, end_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists contents (
  id uuid primary key default uuid_generate_v4(),
  title text, body text, type text, status text default 'draft',
  tags jsonb default '[]', author text, published_at timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists app_analytics (
  id uuid primary key default uuid_generate_v4(),
  event text, user_id uuid, metadata jsonb, session_id text,
  platform text, version text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists app_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid, rating int, review text, platform text,
  version text, status text default 'pending', response text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists app_versions (
  id uuid primary key default uuid_generate_v4(),
  version text, release_notes text, platform text,
  status text default 'active', released_at timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists mobile_apps (
  id uuid primary key default uuid_generate_v4(),
  name text, platform text, version text, bundle_id text,
  status text default 'active', config jsonb, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

-- Enable RLS on all tables
DO $$ 
DECLARE 
  t TEXT;
BEGIN
  -- Loop through every single table in your system
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
  LOOP
    -- 1. Explicitly drop the policy first to prevent the 42710 error completely
    EXECUTE FORMAT('DROP POLICY IF EXISTS "allow_all_%s" ON public.%I', t, t);
    
    -- 2. Turn on RLS for the table
    EXECUTE FORMAT('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    
    -- 3. Create the fresh policy safely
    EXECUTE FORMAT('CREATE POLICY "allow_all_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;
