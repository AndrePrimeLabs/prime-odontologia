import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const db = primeos.asServiceRole;

    // Fetch all data in parallel
    const [customers, appointments, transactions] = await Promise.all([
      db.entities.Customer.list(),
      db.entities.Appointment.list('-date', 500),
      db.entities.FinancialTransaction.filter({ type: 'receita' }, '-date', 500),
    ]);

    const today = new Date();

    // Build enriched patient profiles
    const profiles = customers.map(c => {
      const cApts = appointments.filter(a =>
        a.patient_id === c.id || a.patient_name === c.name
      );
      const cTxns = transactions.filter(t =>
        t.patient_id === c.id || t.patient_name === c.name
      );

      const totalSpent = cTxns.filter(t => t.status === 'pago').reduce((s, t) => s + (t.amount || 0), 0);
      const pendingAmount = cTxns.filter(t => t.status === 'pendente').reduce((s, t) => s + (t.amount || 0), 0);
      const paidCount = cTxns.filter(t => t.status === 'pago').length;
      const totalTxns = cTxns.length;

      const lastApt = cApts.filter(a => a.status !== 'cancelled').sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const lastAptDaysAgo = lastApt ? Math.floor((today - new Date(lastApt.date)) / 86400000) : null;
      const aptCount = cApts.filter(a => a.status === 'completed' || a.status === 'confirmed').length;

      const services = [...new Set(cApts.map(a => a.service_type).filter(Boolean))];

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: c.status,
        tags: c.tags || [],
        source: c.source,
        city: c.city,
        state: c.state,
        totalSpent,
        pendingAmount,
        paidCount,
        totalTxns,
        paymentRate: totalTxns > 0 ? Math.round((paidCount / totalTxns) * 100) : null,
        aptCount,
        lastAptDaysAgo,
        services,
      };
    });

    // Compute summary stats for AI context
    const avgSpent = profiles.length > 0 ? profiles.reduce((s, p) => s + p.totalSpent, 0) / profiles.length : 0;
    const topSpenders = profiles.filter(p => p.totalSpent > avgSpent * 2);
    const inactive = profiles.filter(p => p.lastAptDaysAgo !== null && p.lastAptDaysAgo > 90);
    const highPending = profiles.filter(p => p.pendingAmount > 500);
    const frequent = profiles.filter(p => p.aptCount >= 5);
    const neverReturned = profiles.filter(p => p.aptCount <= 1 && p.status !== 'lead');

    const summary = {
      total: profiles.length,
      avgSpent: Math.round(avgSpent),
      topSpendersCount: topSpenders.length,
      inactiveCount: inactive.length,
      highPendingCount: highPending.length,
      frequentCount: frequent.length,
      neverReturnedCount: neverReturned.length,
    };

    // Prepare compact data for LLM (avoid sending huge payloads)
    const compactProfiles = profiles.slice(0, 80).map(p => ({
      name: p.name,
      status: p.status,
      totalSpent: p.totalSpent,
      pendingAmount: p.pendingAmount,
      aptCount: p.aptCount,
      lastAptDaysAgo: p.lastAptDaysAgo,
      paymentRate: p.paymentRate,
      services: p.services.slice(0, 3),
      tags: p.tags.slice(0, 5),
      source: p.source,
    }));

    const prompt = `
Você é um especialista em CRM para clínicas odontológicas. Analise os dados dos ${profiles.length} pacientes abaixo e retorne EXATAMENTE o JSON solicitado.

RESUMO GERAL:
- Total de pacientes: ${summary.total}
- Gasto médio por paciente: R$ ${summary.avgSpent}
- Pacientes inativos (+90 dias sem visita): ${summary.inactiveCount}
- Top gastadores (2x acima da média): ${summary.topSpendersCount}
- Com valores pendentes altos: ${summary.highPendingCount}
- Frequentes (5+ consultas): ${summary.frequentCount}
- Nunca retornaram: ${summary.neverReturnedCount}

DADOS DOS PACIENTES (amostra):
${JSON.stringify(compactProfiles, null, 1)}

Crie 5 a 7 segmentos inteligentes baseados nos padrões encontrados. Para cada segmento:
- Identifique padrões reais nos dados
- Sugira ações específicas e práticas
- Estime o impacto financeiro potencial
- Calcule quantos pacientes pertencem a cada segmento com base nos dados reais

Os segmentos devem cobrir: pacientes VIP/fiéis, inativos para reativação, com pagamentos pendentes, novos leads a converter, frequentes para fidelização, e outros padrões relevantes que você encontrar.
`;

    const result = await db.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overview: {
            type: 'object',
            properties: {
              total_patients: { type: 'number' },
              key_insight: { type: 'string' },
              revenue_opportunity: { type: 'string' },
              health_score: { type: 'number', description: '0-100 CRM health score' },
            }
          },
          segments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                icon: { type: 'string', description: 'emoji icon' },
                color: { type: 'string', enum: ['indigo', 'emerald', 'amber', 'rose', 'purple', 'blue', 'orange', 'teal'] },
                count: { type: 'number' },
                criteria: { type: 'string', description: 'How these patients were identified' },
                actions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      description: { type: 'string' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                      channel: { type: 'string', enum: ['email', 'whatsapp', 'call', 'in-person', 'discount', 'campaign'] },
                    }
                  }
                },
                financial_impact: { type: 'string' },
                urgency: { type: 'string', enum: ['high', 'medium', 'low'] },
                patient_names: { type: 'array', items: { type: 'string' }, description: 'Up to 5 example patient names from the data' },
              }
            }
          },
          patterns: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                insight: { type: 'string' },
                recommendation: { type: 'string' },
              }
            }
          }
        }
      }
    });

    return Response.json({ success: true, analysis: result, summary });

  } catch (error) {
    console.error('analyzePatientSegments error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
