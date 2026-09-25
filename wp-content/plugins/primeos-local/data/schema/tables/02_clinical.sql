-- PrimeOS schema: clinical & scheduling
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
  dentist_id uuid references dentists (id) on delete set null,
  date date, start_datetime timestamptz, end_datetime timestamptz,
  reason text, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  date date, time text, duration_minutes int,
  patient_id uuid, patient_name text, patient_phone text,
  dentist_id uuid references dentists (id) on delete set null,
  resource_id uuid, resource_name text,
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
  name text, type text, status text default 'available', is_active boolean default true,
  notes text, created_by_id uuid, is_sample boolean default false,
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

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, title text, file_url text, file_type text,
  category text, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create index if not exists idx_appointments_date on appointments (date);
create index if not exists idx_appointments_patient on appointments (patient_id);
create index if not exists idx_medical_records_patient on medical_records (patient_id);
