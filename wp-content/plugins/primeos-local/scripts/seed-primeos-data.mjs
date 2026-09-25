#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://foeahubnrbclbelsqikp.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_MnURfwn0NCO-70pR4pF4Vw_Sl4r3CLA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_CANVAS_ID = "00000000-0000-0000-0000-000000000002";

async function runSeed() {
  console.log("🌱 Starting PrimeOS Multi-Tenant & Data Seed...");

  // 1. Ensure Default Tenant
  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .upsert({
      id: DEFAULT_TENANT_ID,
      name: "Prime Odontologia",
      segment: "dental",
      settings: { city: "Belo Horizonte", state: "MG", currency: "BRL" },
    })
    .select()
    .single();

  if (tenantErr) {
    console.warn("Notice on tenants table (if table does not exist yet or permission denied):", tenantErr.message);
  } else {
    console.log("✅ Seeded Tenant:", tenant.name);
  }

  // 2. Ensure Default Canvas
  const { error: canvasErr } = await supabase
    .from("canvases")
    .upsert({
      id: DEFAULT_CANVAS_ID,
      tenant_id: DEFAULT_TENANT_ID,
      name: "Prime Odontologia — Business Model Canvas",
    });

  if (!canvasErr) {
    console.log("✅ Seeded Business Model Canvas");

    // 3. Seed 9-Block Canvas Items
    const bmcItems = [
      { block_type: "key_partners", content: "Align Technology (Invisalign & iTero Scanner)" },
      { block_type: "key_partners", content: "Laboratórios Protéticos Especializados" },
      { block_type: "key_partners", content: "Pomelli Branding & Comunicação Estratégica" },
      { block_type: "key_activities", content: "Escaneamento Intraoral 3D e Planejamento Digital de Sorrisos" },
      { block_type: "key_activities", content: "Tratamento Ortodôntico com Alinhadores Invisíveis" },
      { block_type: "key_activities", content: "Instalação e Monitoramento de Contenções Vivera" },
      { block_type: "key_resources", content: "Scanner Intraoral 3D iTero" },
      { block_type: "key_resources", content: "Sistema Operacional PrimeOS (Gestão Clínica & Funil)" },
      { block_type: "key_resources", content: "Equipe Clínica Especializada e Consultório Lourdes/BH" },
      { block_type: "value_propositions", content: "Tratamento Invisalign de Alta Precisão com Máximo Conforto e Estética" },
      { block_type: "value_propositions", content: "Contenção Invisalign Vivera Original (3 unidades para estabilidade permanente)" },
      { block_type: "customer_relationships", content: "Atendimento Humanizado e Próximo com Suporte Contínuo via WhatsApp" },
      { block_type: "customer_relationships", content: "Portal do Paciente para Acompanhamento de Consultas e Orientações" },
      { block_type: "channels", content: "Landing Page Otimizada Contenção Invisalign (/contencao-invisalign)" },
      { block_type: "channels", content: "Instagram Oficial e Campanhas de Tráfego Pago (@primeodontologia)" },
      { block_type: "channels", content: "Indicações de Pacientes Ativos e Parcerias Locais" },
      { block_type: "customer_segments", content: "Adultos e Jovens que buscam correção ortodôntica discreta e rápida" },
      { block_type: "customer_segments", content: "Pacientes pós-tratamento ortodôntico que necessitam proteger seus resultados" },
      { block_type: "cost_structure", content: "Aquisição de Insumos Align Technology (Invisalign & Vivera)" },
      { block_type: "cost_structure", content: "Despesas Operacionais e Clínicas Fixas" },
      { block_type: "cost_structure", content: "Investimento em Marketing Digital e Mídia Paga" },
      { block_type: "revenue_streams", content: "Planos de Tratamento Ortodôntico Invisalign" },
      { block_type: "revenue_streams", content: "Pacotes de Contenção Vivera (3 unidades por R$2.500 em até 12x)" },
      { block_type: "revenue_streams", content: "Procedimentos Estéticos e Clínicos Gerais" },
    ];

    for (let i = 0; i < bmcItems.length; i++) {
      await supabase.from("canvas_block_items").insert({
        canvas_id: DEFAULT_CANVAS_ID,
        tenant_id: DEFAULT_TENANT_ID,
        block_type: bmcItems[i].block_type,
        content: bmcItems[i].content,
        position: i + 1,
      });
    }
    console.log(`✅ Seeded ${bmcItems.length} Business Model Canvas items across 9 blocks.`);
  }

  // 4. Ingest CSV Patients / CRM Leads
  const csvPath = path.resolve(
    process.cwd(),
    "../Desktop/Prime Labs/7.Key Partners/Prime Os/Data/clientes_crm_2026-08-08.csv"
  );

  if (fs.existsSync(csvPath)) {
    const rawContent = fs.readFileSync(csvPath, "utf-8");
    const lines = rawContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    console.log(`📄 Found CRM CSV with ${lines.length - 1} records.`);

    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      // Parse CSV line handling quotes
      const parts = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const cleanParts = parts.map(p => p.replace(/^"|"$/g, "").trim());
      const [nome, email, telefone, statusStr, empresa, profissao, cidade, estado, tags, valorStr] = cleanParts;

      if (!nome) continue;

      const isLead = statusStr?.toLowerCase().includes("lead") || statusStr?.toLowerCase().includes("prospect");

      if (isLead) {
        await supabase.from("leads").insert({
          tenant_id: DEFAULT_TENANT_ID,
          name: nome,
          email: email || null,
          phone: telefone || null,
          source: "crm_import",
          stage: "new",
          estimated_value: parseFloat(valorStr) || 2500,
          notes: `Empresa: ${empresa || "-"}, Profissão: ${profissao || "-"}`,
        });
      } else {
        await supabase.from("patients").insert({
          tenant_id: DEFAULT_TENANT_ID,
          name: nome,
          email: email || null,
          phone: telefone || null,
          status: "active",
          address: { cidade: cidade || "Belo Horizonte", estado: estado || "MG" },
          medical_history: { empresa, profissao, valor_vitalicio: parseFloat(valorStr) || 0 },
        });
      }
      count++;
    }
    console.log(`✅ Processed ${count} CRM records from clientes_crm_2026-08-08.csv.`);
  }

  console.log("✨ PrimeOS Data Seeding Complete!");
}

runSeed().catch(err => {
  console.error("Seed execution note:", err.message);
});
