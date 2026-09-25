// @ts-nocheck
import { Activity, BarChart3, ListChecks, Calendar, TrendingUp, Zap } from "lucide-react";

export const metricsTour = {
  id: 'metrics-tour',
  steps: [
    {
      selector: '[data-tour="sync-card"]',
      icon: Zap,
      title: 'Sincronização Automática',
      description: 'Conecte suas contas do Google Ads e Facebook Ads para importar métricas automaticamente. Configure os secrets no Dashboard.',
      tip: 'A sincronização roda todo dia às 8h automaticamente!'
    },
    {
      selector: '[data-tour="kpi-cards"]',
      icon: TrendingUp,
      title: 'KPIs Principais',
      description: 'Acompanhe receita, investimento, ROI, CAC e outras métricas essenciais em tempo real.',
      tip: 'O ROI verde indica lucro, vermelho indica prejuízo.'
    },
    {
      selector: '[data-tour="engagement-tab"]',
      icon: Activity,
      title: 'Métricas de Engajamento',
      description: 'Monitore DAU, WAU, MAU, duração de sessão e adoção de features pela sua equipe.',
      tip: 'Use estas métricas para identificar onde sua equipe precisa de treinamento.'
    },
    {
      selector: '[data-tour="funnel"]',
      icon: BarChart3,
      title: 'Funil de Conversão',
      description: 'Visualize o caminho completo desde impressões até conversões e identifique gargalos.',
      tip: 'Percentuais baixos entre etapas indicam onde otimizar sua estratégia.'
    }
  ]
};

export const tasksTour = {
  id: 'tasks-tour',
  steps: [
    {
      selector: '[data-tour="create-task"]',
      icon: ListChecks,
      title: 'Criar Tarefas',
      description: 'Crie tarefas manualmente ou baseadas em POPs. Adicione subtarefas, checklists e atribua para múltiplos responsáveis.',
      tip: 'Use POPs como templates para garantir consistência nos processos!'
    },
    {
      selector: '[data-tour="task-filters"]',
      icon: ListChecks,
      title: 'Filtros e Busca',
      description: 'Filtre tarefas por status, prioridade ou categoria. Use a busca para encontrar rapidamente.',
      tip: 'Combine múltiplos filtros para visualizações específicas.'
    },
    {
      selector: '[data-tour="recurring-tasks"]',
      icon: Calendar,
      title: 'Tarefas Recorrentes',
      description: 'Configure tarefas que se repetem automaticamente (diária, semanal, mensal, etc).',
      tip: 'O sistema cria automaticamente a próxima ocorrência quando você completa uma tarefa recorrente!'
    },
    {
      selector: '[data-tour="task-stats"]',
      icon: TrendingUp,
      title: 'Estatísticas',
      description: 'Acompanhe o total de tarefas, conclusão e tarefas atrasadas em tempo real.',
      tip: 'Mantenha as tarefas atrasadas sempre próximas de zero.'
    }
  ]
};

export const dashboardTour = {
  id: 'dashboard-tour',
  steps: [
    {
      selector: '[data-tour="whats-new"]',
      icon: Zap,
      title: 'Novidades & Dicas',
      description: 'Clique aqui para ver as últimas atualizações e dicas de uso do sistema.',
      tip: 'Este modal aparece automaticamente quando há novas features!'
    },
    {
      selector: '[data-tour="navigation"]',
      icon: ListChecks,
      title: 'Navegação',
      description: 'Acesse todas as funcionalidades do sistema através do menu lateral.',
      tip: 'Use os ícones "Novidades" para identificar recursos recém-adicionados.'
    }
  ]
};
