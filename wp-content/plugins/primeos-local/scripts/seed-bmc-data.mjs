/**
 * scripts/seed-bmc-data.mjs
 * 
 * Comprehensive seed script for PrimeOS 9-Block BMC Microservices.
 * Reads configurations and specifications from Desktop/Prime Labs and seeds
 * them through the Traefik API Gateway with multi-tenant X-Tenant-Id isolation.
 */

const API_BASE_URL = process.env.PRIMEOS_API_URL || 'http://localhost:5001/api';
const TENANT_ID = process.env.TENANT_ID || '00000000-0000-4000-a000-000000000001';

async function api(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': TENANT_ID,
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${method} ${path} failed (${res.status}): ${errorText}`);
  }
  return res.json();
}

async function seedSegments() {
  console.log('📌 Seeding SEG-X (Customer Segments & Personas)...');
  const existing = await api('/segments');
  const existingNames = new Set(existing.map((s) => s.name));

  const segmentsToSeed = [
    {
      name: 'Aesthetic Orthodontics & Clear Aligners',
      description: 'High-ticket orthodontic patients seeking discreet smile transformation via Invisalign',
      market_vertical: 'HEALTH',
      target_age_min: 20,
      target_age_max: 50,
      estimated_market_size: 1500,
      avg_ltv: 14500.00,
      is_active: true,
      criteria: { keywords: ['invisalign', 'alinhador', 'estetica', 'sorriso'] },
      personas: [
        {
          persona_name: 'Camila - Executive / Professional',
          occupation: 'Corporate Executive',
          primary_pain_points: ['Doesn’t want metallic braces in meetings', 'Tight schedule'],
          desired_gains: ['Discreet treatment', 'Quick appointments', 'Predictable results'],
          buying_criteria: ['Doctor reputation', '3D simulation preview', 'Boutique clinic comfort']
        }
      ]
    },
    {
      name: 'DTM, Orofacial Pain & Sleep Bruxism',
      description: 'Patients with chronic jaw pain, tension headaches, and sleep clenching',
      market_vertical: 'HEALTH',
      target_age_min: 25,
      target_age_max: 60,
      estimated_market_size: 2200,
      avg_ltv: 4500.00,
      is_active: true,
      criteria: { keywords: ['dor', 'estalo', 'bruxismo', 'masseter', 'apertamento'] },
      personas: [
        {
          persona_name: 'Rafael - High-Stress Professional',
          occupation: 'Tech Lead / Entrepreneur',
          primary_pain_points: ['Morning headaches', 'Worn teeth', 'Jaw stiffness'],
          desired_gains: ['Quality sleep', 'Pain elimination', 'Tooth protection'],
          buying_criteria: ['3D printed precision splint', 'Therapeutic botox option']
        }
      ]
    },
    {
      name: 'Full Smile Rehabilitation & Porcelain Ceramics',
      description: 'Comprehensive restorative cases involving veneers, crowns, and implants',
      market_vertical: 'HEALTH',
      target_age_min: 35,
      target_age_max: 65,
      estimated_market_size: 800,
      avg_ltv: 28000.00,
      is_active: true,
      criteria: { keywords: ['lente', 'porcelana', 'implante', 'facetas'] },
      personas: []
    },
    {
      name: 'Preventive Care & Dental Maintenance',
      description: 'Regular checkups, ultrasound prophylaxis, and fluoride therapy',
      market_vertical: 'HEALTH',
      target_age_min: 10,
      target_age_max: 75,
      estimated_market_size: 5000,
      avg_ltv: 850.00,
      is_active: true,
      criteria: { keywords: ['limpeza', 'profilaxia', 'checkup', 'revisao'] },
      personas: []
    }
  ];

  for (const segData of segmentsToSeed) {
    if (existingNames.has(segData.name)) {
      console.log(`   ⏭️  Segment "${segData.name}" already exists`);
      continue;
    }
    const { personas, ...segPayload } = segData;
    const created = await api('/segments', 'POST', segPayload);
    console.log(`   ✅ Created Segment: ${created.name} (${created.id})`);

    for (const persona of personas) {
      await api('/personas', 'POST', { ...persona, segment_id: created.id });
      console.log(`      ↳ Created Persona: ${persona.persona_name}`);
    }
  }
}

async function seedValuePropositions() {
  console.log('📌 Seeding VALUE-X (Value Propositions)...');
  const existing = await api('/propositions');
  const existingNames = new Set(existing.map((v) => v.name));

  const propsToSeed = [
    {
      name: 'Invisalign High-Precision Treatment',
      core_promise: '100% digital smile simulation with comfortable clear aligners and predictable outcomes',
      fit_score: 95.0,
      pillars: ['Sub-millimeter 3D Scanning', 'Boutique Concierge Experience', 'Permanent Stability Guarantee'],
      pain_relievers: ['No metallic wires or brackets', 'Fewer clinic visits needed'],
      gain_creators: ['Confident radiant smile', 'Virtual ClinCheck 3D treatment preview']
    },
    {
      name: 'Biomimetic Ceramic Rehabilitation',
      core_promise: 'Ultra-thin porcelain veneers preserving maximum natural tooth structure',
      fit_score: 90.0,
      pillars: ['Micro-invasive Dentistry', 'Digital Smile Design', '5-Year Ceramic Warranty'],
      pain_relievers: ['Natural appearance with zero aggressive tooth grinding'],
      gain_creators: ['Harmonious facial aesthetics', 'Instant transformation']
    }
  ];

  for (const prop of propsToSeed) {
    if (existingNames.has(prop.name)) {
      console.log(`   ⏭️  Value Proposition "${prop.name}" already exists`);
      continue;
    }
    const created = await api('/propositions', 'POST', prop);
    console.log(`   ✅ Created Value Proposition: ${created.name} (${created.id})`);
  }
}

async function seedChannels() {
  console.log('📌 Seeding CHAN-X (Channels)...');
  const existing = await api('/channels');
  const existingNames = new Set(existing.map((c) => c.name));

  const channelsToSeed = [
    {
      name: 'WhatsApp Direct Concierge',
      channel_type: 'DIGITAL',
      phase: 'PURCHASE',
      cost_per_acquisition: 45.00,
      conversion_rate: 35.0,
      is_active: true
    },
    {
      name: 'Meta Ads (Instagram & FB)',
      channel_type: 'DIGITAL',
      phase: 'AWARENESS',
      cost_per_acquisition: 120.00,
      conversion_rate: 8.5,
      is_active: true
    },
    {
      name: 'Google Ads Search & Local Maps',
      channel_type: 'DIGITAL',
      phase: 'EVALUATION',
      cost_per_acquisition: 180.00,
      conversion_rate: 14.0,
      is_active: true
    },
    {
      name: 'Chairside 3D Scanner Live Experience',
      channel_type: 'PHYSICAL',
      phase: 'EVALUATION',
      cost_per_acquisition: 50.00,
      conversion_rate: 72.0,
      is_active: true
    }
  ];

  for (const ch of channelsToSeed) {
    if (existingNames.has(ch.name)) {
      console.log(`   ⏭️  Channel "${ch.name}" already exists`);
      continue;
    }
    const created = await api('/channels', 'POST', ch);
    console.log(`   ✅ Created Channel: ${created.name} (${created.id})`);
  }
}

async function seedProducts() {
  console.log('📌 Seeding REV-X (Products & Revenue Streams)...');
  const existing = await api('/products');
  const existingSkus = new Set(existing.map((p) => p.sku));

  const productsToSeed = [
    {
      sku: 'PROD-ALN-COMP',
      name: 'Invisalign Comprehensive',
      category: 'Orthodontics',
      base_price: 14500.00,
      currency: 'BRL',
      max_installments: 24,
      is_active: true
    },
    {
      sku: 'PROD-CER-LEN',
      name: 'Lente de Contato em Porcelana (Elemento)',
      category: 'Aesthetics',
      base_price: 2800.00,
      currency: 'BRL',
      max_installments: 12,
      is_active: true
    },
    {
      sku: 'PROD-BRX-PLA',
      name: 'Placa Bruxismo Impressa 3D',
      category: 'Therapeutics',
      base_price: 1200.00,
      currency: 'BRL',
      max_installments: 6,
      is_active: true
    },
    {
      sku: 'PROD-TOX-MAS',
      name: 'Botox Terapêutico Masseter',
      category: 'Therapeutics',
      base_price: 1800.00,
      currency: 'BRL',
      max_installments: 6,
      is_active: true
    }
  ];

  for (const prod of productsToSeed) {
    if (existingSkus.has(prod.sku)) {
      console.log(`   ⏭️  Product "${prod.name}" already exists`);
      continue;
    }
    const created = await api('/products', 'POST', prod);
    console.log(`   ✅ Created Product: ${created.name} [${created.sku}]`);
  }
}

async function seedKeyPartners() {
  console.log('📌 Seeding PART-X (Key Partners)...');
  const existing = await api('/partners');
  const existingNames = new Set(existing.map((p) => p.name));

  const partnersToSeed = [
    {
      name: 'Align Technology (Invisalign & iTero)',
      category: 'fornecedor_estrategico',
      dependency_level: 'alta',
      strategic_importance: 'critica',
      contact_info: 'suporte@aligntech.com',
      contract_details: 'VIP Advantage Platinum Tier Partner',
      on_time_delivery_rate: 98.5,
      status: 'ativo'
    },
    {
      name: 'Laboratório Protético Especializado',
      category: 'laboratorio_dental',
      dependency_level: 'media',
      strategic_importance: 'alta',
      contact_info: 'contato@labdentalpro.com.br',
      contract_details: 'Milling de Dissilicato de Lítio (E-Max) e Zircônia',
      on_time_delivery_rate: 96.0,
      status: 'ativo'
    },
    {
      name: 'Straumann Group / Neodent',
      category: 'implantes_cirurgia',
      dependency_level: 'media',
      strategic_importance: 'alta',
      contact_info: 'comercial@neodent.com.br',
      contract_details: 'Fornecimento de implantes cônicos Grand Morse',
      on_time_delivery_rate: 99.0,
      status: 'ativo'
    }
  ];

  for (const partner of partnersToSeed) {
    if (existingNames.has(partner.name)) {
      console.log(`   ⏭️  Partner "${partner.name}" already exists`);
      continue;
    }
    const created = await api('/partners', 'POST', partner);
    console.log(`   ✅ Created Partner: ${created.name} (${created.id})`);
  }
}

async function seedKeyResources() {
  console.log('📌 Seeding RES-X (Key Resources)...');
  const existing = await api('/resources');
  const existingNames = new Set(existing.map((r) => r.name));

  const resourcesToSeed = [
    {
      name: 'Scanner Intraoral 3D iTero Element 5D',
      resource_type: 'PHYSICAL',
      unit_value: 195000.00,
      currency: 'BRL',
      quantity: 1,
      location: 'Consultório Principal - Lourdes/BH',
      status: 'available',
      last_maintenance_date: '2026-08-01',
      next_maintenance_date: '2026-11-01'
    },
    {
      name: 'Nvidia Jetson Edge AI Node',
      resource_type: 'PHYSICAL',
      unit_value: 8500.00,
      currency: 'BRL',
      quantity: 1,
      location: 'Server Rack Local',
      status: 'available'
    },
    {
      name: 'Digital Smile Design (DSD) Clinical Library',
      resource_type: 'INTELLECTUAL',
      unit_value: 15000.00,
      currency: 'BRL',
      quantity: 1,
      location: 'Cloud / PrimeOS',
      status: 'available'
    }
  ];

  for (const res of resourcesToSeed) {
    if (existingNames.has(res.name)) {
      console.log(`   ⏭️  Resource "${res.name}" already exists`);
      continue;
    }
    const created = await api('/resources', 'POST', res);
    console.log(`   ✅ Created Resource: ${created.name} (${created.id})`);
  }
}

async function seedKeyActivitiesAndSOPs() {
  console.log('📌 Seeding ACT-X (Key Activities & SOPs)...');
  const existingAct = await api('/activities');
  const existingActNames = new Set(existingAct.map((a) => a.name));

  const activitiesToSeed = [
    {
      name: 'Escaneamento Intraoral 3D & Simulação Virtual',
      category: 'CLINICAL',
      status: 'active',
      priority: 1,
      kpi_target: 30.00,
      kpi_actual: 28.00,
      frequency: 'daily'
    },
    {
      name: 'Planejamento e Aprovação ClinCheck',
      category: 'CLINICAL',
      status: 'active',
      priority: 1,
      kpi_target: 15.00,
      kpi_actual: 14.00,
      frequency: 'weekly'
    },
    {
      name: 'Concierge Follow-up & Monitoramento de Alinhadores',
      category: 'CUSTOMER_SUCCESS',
      status: 'active',
      priority: 2,
      kpi_target: 95.00,
      kpi_actual: 98.00,
      frequency: 'daily'
    }
  ];

  for (const act of activitiesToSeed) {
    if (existingActNames.has(act.name)) {
      console.log(`   ⏭️  Activity "${act.name}" already exists`);
      continue;
    }
    const created = await api('/activities', 'POST', act);
    console.log(`   ✅ Created Activity: ${created.name} (${created.id})`);
  }

  const existingSops = await api('/sops');
  const existingSopCodes = new Set(existingSops.map((s) => s.code));

  const sopsToSeed = [
    {
      code: 'POP-ACT-01',
      title: 'Digital 3D Intraoral Scanning Protocol',
      category: 'CLINICAL',
      version: '1.2',
      steps: [
        'Ligar e calibrar scanner iTero',
        'Fazer isolamento relativo e secagem da arcada inferior',
        'Escanear arcada inferior em ziguezague oclusal',
        'Escanear arcada superior e palato',
        'Registrar mordida em oclusão cêntrica bilateral'
      ],
      is_active: true
    },
    {
      code: 'POP-ACT-02',
      title: 'ClinCheck & 3D Aligner Simulation Protocol',
      category: 'CLINICAL',
      version: '2.0',
      steps: [
        'Importar escaneamento 3D no portal Align VIP',
        'Definir plano de movimentação com attachment otimizado',
        'Checar espaçamento interproximal (IPR) planejado',
        'Aprovação final pelo ortodontista responsável'
      ],
      is_active: true
    }
  ];

  for (const sop of sopsToSeed) {
    if (existingSopCodes.has(sop.code)) {
      console.log(`   ⏭️  SOP "${sop.code}" already exists`);
      continue;
    }
    const created = await api('/sops', 'POST', sop);
    console.log(`   ✅ Created SOP: ${created.code} - ${created.title}`);
  }
}

async function seedCostStructure() {
  console.log('📌 Seeding COST-X (Cost Structure & Budgets)...');
  const existingBudgets = await api('/budgets');
  const existingBudgetNames = new Set(existingBudgets.map((b) => b.name));

  const budgetsToSeed = [
    {
      name: 'Marketing Digital (Meta + Google)',
      planned_amount: 8000.00,
      actual_amount: 6500.00,
      period: '2026-09'
    },
    {
      name: 'Custos Laboratoriais & Align Tech Fees',
      planned_amount: 25000.00,
      actual_amount: 21500.00,
      period: '2026-09'
    },
    {
      name: 'Infraestrutura & Consultório',
      planned_amount: 14000.00,
      actual_amount: 13800.00,
      period: '2026-09'
    }
  ];

  for (const b of budgetsToSeed) {
    if (existingBudgetNames.has(b.name)) {
      console.log(`   ⏭️  Budget "${b.name}" already exists`);
      continue;
    }
    const created = await api('/budgets', 'POST', b);
    console.log(`   ✅ Created Budget: ${created.name} (${created.id})`);
  }
}

async function seedCustomersAndInteractions() {
  console.log('📌 Seeding CRM-X (Customers & Interactions)...');
  const existing = await api('/customers');
  const existingEmails = new Set(existing.map((c) => c.email));

  const customersToSeed = [
    {
      name: 'Camila Fernandes Silveira',
      email: 'camila.silveira@exemplo.com.br',
      phone: '+55 31 99876-5432'
    },
    {
      name: 'Rafael Mendes de Castro',
      email: 'rafael.castro@exemplo.com.br',
      phone: '+55 31 98765-4321'
    },
    {
      name: 'Beatriz Vasconcelos Costa',
      email: 'beatriz.costa@exemplo.com.br',
      phone: '+55 31 97654-3210'
    }
  ];

  for (const cust of customersToSeed) {
    if (existingEmails.has(cust.email)) {
      console.log(`   ⏭️  Customer "${cust.name}" already exists`);
      continue;
    }
    const created = await api('/customers', 'POST', cust);
    console.log(`   ✅ Created Customer: ${created.name} (${created.id})`);

    // Create an initial interaction
    await api('/interactions', 'POST', {
      customer_id: created.id,
      channel: 'WhatsApp Concierge',
      notes: 'Primeira consulta de avaliação agendada. Interesse em Invisalign Comprehensive.'
    });
    console.log(`      ↳ Created initial Concierge interaction`);
  }
}

async function main() {
  console.log(`🚀 Seeding PrimeOS BMC Microservices at ${API_BASE_URL}`);
  console.log(`🔒 Active Tenant: ${TENANT_ID}\n`);

  try {
    await seedSegments();
    await seedValuePropositions();
    await seedChannels();
    await seedProducts();
    await seedKeyPartners();
    await seedKeyResources();
    await seedKeyActivitiesAndSOPs();
    await seedCostStructure();
    await seedCustomersAndInteractions();

    console.log('\n✨ Multi-service seed completed successfully!');
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  }
}

main();
