import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entitiesDir = path.join(__dirname, '../src/api/entities');

// map entity name to supabase table name
const tableMap = {
  ABTest: 'ab_tests',
  Activity: 'activities',
  AppAnalytics: 'app_analytics',
  AppReview: 'app_reviews',
  AppVersion: 'app_versions',
  Appointment: 'appointments',
  Asset: 'assets',
  AutomationWorkflow: 'automation_workflows',
  BackLink: 'back_links',
  Budget: 'budgets',
  BusinessStrategy: 'business_strategies',
  Campaign: 'campaigns',
  Channel: 'channels',
  ClientJourney: 'client_journeys',
  ClinicalNote: 'clinical_notes',
  Content: 'contents',
  ConteudoSEO: 'conteudo_seo',
  CrmAppointment: 'crm_appointments',
  CrmSyncSettings: 'crm_sync_settings',
  CrmWorkflow: 'crm_workflows',
  CustomDashboard: 'custom_dashboards',
  Customer: 'customers',
  CustomerSegment: 'customer_segments',
  Dentist: 'dentists',
  DentistBlockout: 'dentist_blockouts',
  Document: 'documents',
  EmailSequence: 'email_sequences',
  Expense: 'expenses',
  FinancialGoal: 'financial_goals',
  FinancialTransaction: 'financial_transactions',
  FollowUp: 'follow_ups',
  FollowUpLog: 'follow_up_logs',
  FollowUpRule: 'follow_up_rules',
  Interaction: 'interactions',
  InventoryItem: 'inventory_items',
  KeyPartner: 'key_partners',
  KnowledgeBase: 'knowledge_bases',
  Lead: 'leads',
  LeadInteraction: 'lead_interactions',
  MarketingChannel: 'marketing_channels',
  MarketingMetric: 'marketing_metrics',
  MarketStrategy: 'market_strategies',
  MedicalRecord: 'medical_records',
  MobileApp: 'mobile_apps',
  PalavraChave: 'palavra_chaves',
  PatientRecord: 'patient_records',
  POP: 'pops',
  PrimeDelegationTask: 'prime_delegation_tasks',
  PrimeFunnelLead: 'prime_funnel_leads',
  PrimeGrowthStage: 'prime_growth_stages',
  Product: 'products',
  ProjectSEO: 'project_seos',
  RelatorioSEO: 'relatorio_seos',
  ReminderSchedule: 'reminder_schedules',
  ReportSchedule: 'report_schedules',
  Resource: 'resources',
  Sale: 'sales',
  SalesScript: 'sales_scripts',
  SOP: 'sops',
  SupportTicket: 'support_tickets',
  TarefaSEO: 'tarefa_seos',
  Task: 'tasks',
  UserBadge: 'user_badges',
  UserEngagement: 'user_engagements',
  UserPoints: 'user_points',
  ValuePropisition: 'value_propositions',
};

const template = (entityName, tableName) => `import { createEntity } from './base';
export const ${entityName} = createEntity('${tableName}');
`;

let fixed = 0;
for (const [entity, table] of Object.entries(tableMap)) {
  const filePath = path.join(entitiesDir, `${entity}.js`);
  fs.writeFileSync(filePath, template(entity, table));
  console.log(`✅ Fixed: ${entity}.js -> ${table}`);
  fixed++;
}

console.log(`\n🎉 Done! Fixed ${fixed} entity files.`);
