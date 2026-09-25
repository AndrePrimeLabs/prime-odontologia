# PrimeOS App - Documentação

## Visão geral

O PrimeOS App é o sistema operacional digital da Prime Odontologia. Ele reúne gestão clínica, relacionamento com pacientes, marketing, vendas, finanças, inteligência artificial e rotinas de crescimento em um único ambiente web.

O produto faz parte do ecossistema PrimeOSHub e vive no repositório [PrimeOsHub/primeos](https://github.com/PrimeOsHub/primeos).

## Objetivo do produto

O PrimeOS App foi desenhado para transformar a clínica em uma operação previsível, mensurável e escalável.

Ele centraliza:

- Gestão diária da clínica.
- Agenda, pacientes, prontuários e EHR.
- CRM, funis, segmentação e jornada do cliente.
- Marketing OS, conteúdo, campanhas, SEO e automações.
- Vendas, scripts, pipeline e receita.
- Finanças, cobranças, contas, fluxo de caixa e relatórios.
- AI Hub com assistentes, recomendações e análises.
- Base operacional com POPs, SOPs, tarefas, estoque e suporte.
- Painéis executivos para decisões de crescimento.

## Públicos

O app atende diferentes papéis dentro da operação:

- Diretoria e gestão: visão de métricas, receita, estratégia e crescimento.
- Atendimento e recepção: agenda, leads, pacientes, follow-up e suporte.
- Comercial: pipeline, scripts, oportunidades, previsões e fechamento.
- Marketing: campanhas, conteúdo, SEO, canais, automações e análise.
- Financeiro: transações, cobranças, contas, metas e relatórios.
- Equipe clínica: prontuários, histórico, prescrições, exames, documentos e EHR.
- Operações: tarefas, POPs, SOPs, estoque, processos e delegação.

## Módulos principais

### Gestão e operação

O núcleo operacional organiza a rotina da clínica:

- Dashboard geral.
- Pipeline de pacientes.
- Agenda clínica e agenda CRM.
- Agendamento online.
- Tarefas e calendário de tarefas.
- Atividades.
- POPs e SOPs.
- Follow-up automático.
- Catálogo Prime.
- Estoque e relatórios de estoque.
- Canais de atendimento.
- Suporte ao cliente.

Arquivos relacionados:

- `src/pages/Dashboard.jsx`
- `src/pages/Agenda.jsx`
- `src/pages/Tasks.jsx`
- `src/pages/POPs.jsx`
- `src/pages/SOPs.jsx`
- `src/pages/Inventory.jsx`
- `src/pages/CustomerSupport.jsx`

### CRM e pacientes

O módulo de CRM conecta relacionamento, segmentação e jornada do paciente:

- CRM simples e CRM avançado.
- Segmentação de pacientes e clientes.
- Jornada do cliente.
- Portal do cliente.
- Pipeline de clientes.
- Perfil do paciente e histórico de interações.
- Recomendações de próxima ação.
- Análises preditivas e lead scoring.

Arquivos relacionados:

- `src/pages/CRM.jsx`
- `src/pages/CRMAvancado.jsx`
- `src/pages/CustomerSegments.jsx`
- `src/pages/JornadaCliente.jsx`
- `src/pages/JourneyMapping.jsx`
- `src/pages/ClientPortal.jsx`
- `src/components/crm/*`
- `src/components/segments/*`

### Vendas

O módulo comercial acompanha oportunidades do primeiro contato até o fechamento:

- Leads.
- Pipeline de vendas.
- Registro de vendas.
- Revenue streams.
- Scripts de vendas.
- Relatórios comerciais.
- Forecasting e sugestões com IA.

Arquivos relacionados:

- `src/pages/LeadsPipeline.jsx`
- `src/pages/SalesPipeline.jsx`
- `src/pages/Sales.jsx`
- `src/pages/ScriptsVendas.jsx`
- `src/pages/SalesReports.jsx`
- `src/components/sales/*`
- `src/components/ai/DealForecasting.jsx`

### Marketing

O Marketing OS centraliza aquisição, conteúdo, canais e automações:

- Marketing OS.
- Campanhas.
- Conteúdos.
- AI Content Creator.
- Email automation.
- Marketing automation.
- Canais de marketing.
- Estratégia omnichannel para conectar aquisição, vendas e atendimento.
- Métricas de marketing.
- SEO, keywords, backlinks e relatórios.

Arquivos relacionados:

- `src/pages/MarketingOS.jsx`
- `src/pages/Campanhas.jsx`
- `src/pages/Conteudos.jsx`
- `src/pages/ContentCreator.jsx`
- `src/pages/EmailAutomation.jsx`
- `src/pages/MarketingAutomation.jsx`
- `src/components/marketing/*`
- `docs/OMNICHANNEL_STRATEGY.md`

### Finanças

O módulo financeiro dá visibilidade sobre caixa, cobrança e performance:

- Dashboard financeiro.
- Contas a pagar e receber.
- Contas a vencer.
- Transações.
- Conciliação bancária.
- Cobranças e links de pagamento.
- Nota/invoice digital.
- Planejamento de orçamento.
- Metas financeiras.
- Fluxo de caixa projetado.
- Relatórios personalizados.

Arquivos relacionados:

- `src/pages/DashboardFinanceiro.jsx`
- `src/pages/Financeiro.jsx`
- `src/pages/CostStructure.jsx`
- `src/pages/Revenue.jsx`
- `src/components/financeiro/*`

### AI Hub

O AI Hub reúne recursos de inteligência artificial para apoio operacional, comercial e estratégico:

- Assistente IA.
- AI Insights.
- Recomendações.
- Geração de conteúdo.
- Lead scoring.
- Análise de feedback.
- Sugestões de follow-up.
- Previsão de fechamento.
- Sugestões de retorno e remarcação.
- Chatbot e suporte assistido.

Arquivos relacionados:

- `src/pages/AIAssistant.jsx`
- `src/pages/AIInsights.jsx`
- `src/components/ai/*`
- `functions/invokeLLM.ts`
- `functions/generateAIInsights.ts`
- `functions/scoreLeadAI.ts`
- `functions/analyzeFeedback.ts`

### PrimeOS HQ

A página `PrimeOS` funciona como um centro de crescimento, SEO e delegação.

Ela organiza:

- Growth stages.
- Projetos SEO.
- Tarefas SEO.
- Palavras-chave.
- Conteúdo.
- Backlinks.
- Funil Prime.
- Delegation OS.

Entidades principais:

- `PrimeGrowthStage`
- `ProjetoSEO`
- `TarefaSEO`
- `PalavraChave`
- `ConteudoSEO`
- `BackLink`
- `RelatorioSEO`
- `PrimeFunnelLead`
- `PrimeDelegationTask`

Arquivos relacionados:

- `src/pages/PrimeOS.jsx`
- `src/components/primeos/PrimeFunnel`
- `src/components/primeos/DelegationOS`

## Arquitetura

### Frontend

O frontend usa React com Vite.

Pontos centrais:

- `src/App.jsx`: inicializa providers, rotas e layout autenticado.
- `src/Layout.jsx`: navegação lateral, busca global, tema e atalhos.
- `src/pages.config.js`: registra páginas do diretório `src/pages`.
- `src/pages/*`: telas principais.
- `src/components/*`: componentes por domínio.
- `src/components/ui/*`: componentes base de interface.

### Dados e SDK interno

O app usa Supabase como backend principal.

O cliente interno fica em:

- `src/api/primeosClient.js`

Ele expõe:

- `primeos.entities.<Entity>.list()`
- `primeos.entities.<Entity>.create(data)`
- `primeos.entities.<Entity>.update(id, data)`
- `primeos.database.from(table)`
- `primeos.functions.invoke(name, body)`
- `primeos.auth.*`
- `primeos.storage.*`

O mapeamento de entidades para tabelas Postgres é mantido em `DATABASE_REGISTRY`, dentro de `src/api/primeosClient.js`.

### Banco de dados

O schema versionado fica em:

- `database/schema/tables/*`
- `database/schema/views/*`
- `database/schema/functions/*`
- `database/schema/procedures/*`
- `database/migrations/*`
- `database/seeds/*`

Módulos de schema:

- Auth e perfis.
- Clínico.
- CRM.
- Financeiro.
- Marketing.
- Operações.
- Plataforma.

Há também diretórios legados ou espelhados, como `data/`, `database-repo/` e `supabase/backup files/`. Para trabalho novo de banco, prefira `database/`.

### Funções server-side

As funções de domínio ficam em `functions/`.

Exemplos:

- `aiChatbot.ts`
- `analyzePatient.ts`
- `calculateLeadScore.ts`
- `createDigitalInvoice.ts`
- `generateMarketingContent.ts`
- `paymentFollowUp.ts`
- `processOnlineBooking.ts`
- `sendAppointmentReminder.ts`
- `syncGoogleCalendar.ts`
- `triageTicket.ts`

### APIs Vercel

Endpoints server-side ficam em `api/`.

Hostinger:

- `GET /api/hostinger`
- `GET /api/hostinger/domains`
- `GET /api/hostinger/dns/{domain}`
- `PUT /api/hostinger/dns/{domain}`
- `GET /api/hostinger/vps`
- `POST /api/hostinger/deploy`

Todos exigem:

```http
x-primeos-key: <PRIMEOS_API_KEY>
```

## Entidades importantes

O app trabalha com entidades de domínio em `src/api/entities`, `entities`, `database` e `data`.

Principais grupos:

- Operação: `Task`, `Activity`, `SOP`, `POP`, `SupportTicket`, `InventoryItem`.
- Agenda e clínica: `Appointment`, `Dentist`, `DentistBlockout`, `PatientRecord`, `MedicalRecord`, `ClinicalNote`, `Document`.
- CRM: `Customer`, `CustomerSegment`, `Interaction`, `ClientJourney`, `CrmAppointment`, `CrmWorkflow`, `CrmSyncSettings`.
- Marketing: `Campaign`, `Content`, `EmailSequence`, `MarketingChannel`, `MarketingMetric`, `AutomationWorkflow`, `ABTest`.
- SEO e growth: `ProjetoSEO`, `TarefaSEO`, `PalavraChave`, `ConteudoSEO`, `BackLink`, `RelatorioSEO`, `PrimeGrowthStage`.
- Vendas: `Lead`, `LeadInteraction`, `Sale`, `SalesScript`, `Product`, `PrimeFunnelLead`.
- Finanças: `FinancialTransaction`, `FinancialGoal`, `Expense`, `Budget`, `Asset`.
- Plataforma: `AppAnalytics`, `AppReview`, `AppVersion`, `MobileApp`, `UserBadge`, `UserEngagement`, `UserPoints`.

## Navegação do app

A navegação principal é definida em `src/Layout.jsx`.

Seções:

- Operacional.
- CRM & Pacientes.
- Vendas.
- Marketing.
- Finanças.
- Analytics & Métricas.
- Estratégia & IA.
- Sistema.

Para adicionar uma página:

1. Crie o arquivo em `src/pages/NomeDaPagina.jsx`.
2. Registre ou gere a entrada em `src/pages.config.js`, seguindo o padrão existente.
3. Adicione o item de menu em `src/Layout.jsx`.
4. Conecte a página às entidades ou funções necessárias via `primeosClient`.

## Ambiente local

Instalação:

```bash
npm install
```

Execução:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Variáveis de ambiente

Servidor/Vercel:

- `HOSTINGER_API_TOKEN`: token da API Hostinger.
- `PRIMEOS_API_KEY`: segredo compartilhado para `/api/hostinger/*`.
- `GITHUB_TOKEN`: PAT com `actions:write`, usado pelo endpoint de deploy.
- `GITHUB_REPO`: repositório `owner/repo`, usado pelo endpoint de deploy.

Deploy FTP local:

- `FTP_PASSWORD`: senha usada por `scripts/deploy.mjs`.

Supabase:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Variáveis equivalentes presentes nos arquivos `.env.example` e `.env.local`.

Nunca versionar tokens reais. A configuração MCP fica em `.mcp.json` e lê `HOSTINGER_API_TOKEN` do ambiente do processo, sem hardcode.

## Deploy

O projeto é hospedado em Hostinger, com build gerado por Vite.

Fluxo comum:

```bash
npm run deploy
```

Esse script executa:

```bash
npm run build:primeos
node scripts/deploy.mjs
```

Também existe suporte a deploy via GitHub Actions.

## Integrações

Integrações presentes ou previstas na base:

- Supabase Auth, Postgres, Storage e Functions.
- Hostinger API para domínio, DNS, VPS e deploy.
- GitHub Actions para automação de deploy.
- Google Calendar para agenda.
- Stripe para checkout/pagamentos.
- Provedores de marketing como Google Ads e Facebook Ads.
- EHR e sincronização clínica.
- Notion via `primeos-notion-manager`.

## Segurança

Princípios do projeto:

- Não expor chaves no frontend além de chaves públicas/anon permitidas.
- Proteger APIs server-side com `x-primeos-key`.
- Usar Supabase Auth para sessão.
- Usar RLS no banco conforme migrations em `database` e `supabase`.
- Não hardcodar tokens em MCPs, scripts ou documentação.
- Validar payloads em funções server-side antes de gravar dados sensíveis.

## Convenções de desenvolvimento

Ao evoluir o app:

- Preserve os módulos de domínio já existentes.
- Use `primeosClient` para acesso a entidades e Supabase.
- Reutilize componentes de `src/components/ui`.
- Coloque componentes específicos em pastas de domínio, como `crm`, `financeiro`, `marketing`, `agenda` ou `ai`.
- Prefira alterações pequenas e rastreáveis.
- Atualize esta documentação quando adicionar módulos, entidades, integrações ou rotas relevantes.

## Roadmap sugerido

Prioridades naturais do PrimeOS App:

- Consolidar todos os módulos no mesmo padrão visual e de dados.
- Auditar entidades duplicadas entre `data`, `database`, `database-repo` e `entities`.
- Fortalecer RLS e políticas por perfil de usuário.
- Criar documentação de API para funções server-side.
- Criar seeds realistas para demonstração.
- Adicionar testes para SDK interno, entidades críticas e fluxos financeiros.
- Integrar observabilidade de erros e métricas de uso.
- Formalizar o AI Hub com prompts, guardrails, logs e avaliações.

## Referências internas

- `AGENTS.md`: instruções operacionais para agentes no repositório.
- `SELF_HOSTING_GUIDE.md`: guia de self-hosting.
- `SECURITY.md`: política de segurança.
- `CONTRIBUTING.md`: contribuição.
- `database/README.md`: documentação do banco de dados.
- `api/_lib/hostinger.js`: cliente server-side da Hostinger.
- `scripts/deploy.mjs`: deploy FTP para Hostinger.
