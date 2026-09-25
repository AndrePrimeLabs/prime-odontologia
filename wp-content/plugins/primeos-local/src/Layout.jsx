// @ts-nocheck
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
// @ts-ignore
import primeLogo from "./assets/prime-logo.svg";
import {
  LayoutDashboard,
  Users,
  Activity,
  DollarSign,
  ShoppingCart,
  Menu,
  X,
  ChevronRight,
  Heart,
  ClipboardList,
  Calendar,
  TrendingUp,
  Inbox,
  Zap,
  Brain,
  FileText,
  Megaphone,
  BarChart3,
  BookOpen,
  Target,
  Puzzle,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Sparkles,
  Search,
  Mail,
  HeadphonesIcon,
  Settings,
  Shield,
  Stethoscope,
  Bell,
  Globe,
  Map,
  Star,
  Package,
  Key,
  Smartphone,
  Gamepad2,
  UserCheck,
  Route,
  Layers
} from "lucide-react";
import WhatsNewModal, { LATEST_VERSION } from "@/components/shared/WhatsNewModal";
import GlobalSearch from "@/components/shared/GlobalSearch";
import SettingsDialog from "@/components/shared/SettingsDialog";

const navigation = [
  { section: "Operacional" },
  { name: "Dashboard", href: "Dashboard", icon: LayoutDashboard },
  { name: "Pipeline Pacientes", href: "PatientPipeline", icon: Heart },
  { name: "Prontuários", href: "Prontuarios", icon: ClipboardList },
  { name: "Agenda", href: "Agenda", icon: Calendar },
  { name: "Agenda CRM", href: "CRMAgenda", icon: Calendar },
  { name: "Agendamento Online", href: "MeuAgendamento", icon: Globe },
  { name: "Tarefas", href: "Tasks", icon: ListChecks },
  { name: "Calendário de Tarefas", href: "TaskCalendar", icon: Calendar },
  { name: "Atividades", href: "Activities", icon: Activity },
  { name: "POPs", href: "POPs", icon: FileText },
  { name: "SOPs", href: "SOPs", icon: FileText },
  { name: "Follow-up Automático", href: "FollowUpAutomation", icon: Bell },
  { name: "Catálogo Prime", href: "Catalogo", icon: BookOpen },
  { name: "Estoque", href: "Inventory", icon: Package },
  { name: "Relatórios Estoque", href: "InventoryReports", icon: BarChart3 },
  { name: "Canais Atendimento", href: "Canais", icon: Inbox },
  { name: "Suporte ao Cliente", href: "CustomerSupport", icon: HeadphonesIcon },

  { section: "CRM & Pacientes" },
  { name: "CRM", href: "CRM", icon: Users },
  { name: "CRM Avançado", href: "CRMAvancado", icon: Target },
  { name: "Segmentação", href: "CustomerSegments", icon: Layers },
  { name: "Jornada Cliente", href: "JornadaCliente", icon: Route },
  { name: "Jornada do Cliente", href: "JourneyMapping", icon: Map },
  { name: "Portal do Cliente", href: "ClientPortal", icon: UserCheck },
  { name: "Pipeline de Clientes", href: "CustomerPipeline", icon: TrendingUp },

  { section: "Vendas" },
  { name: "Leads", href: "LeadsPipeline", icon: Users },
  { name: "Pipeline Vendas", href: "SalesPipeline", icon: TrendingUp },
  { name: "Vendas", href: "Sales", icon: DollarSign },
  { name: "Revenue Stream", href: "RevenueStreams", icon: ShoppingCart },
  { name: "Scripts Vendas", href: "ScriptsVendas", icon: BookOpen },

  { section: "Marketing" },
  { name: "Marketing OS", href: "MarketingOS", icon: Zap },
  { name: "Campanhas", href: "Campanhas", icon: Megaphone },
  { name: "Conteúdos", href: "Conteudos", icon: FileText },
  { name: "AI Content Creator", href: "ContentCreator", icon: Sparkles },
  { name: "Email Automation", href: "EmailAutomation", icon: Mail },
  { name: "Marketing Automation", href: "MarketingAutomation", icon: Zap },
  { name: "Canais Marketing", href: "Channels", icon: Megaphone },

  { section: "Finanças" },
  { name: "Dashboard Financeiro", href: "DashboardFinanceiro", icon: BarChart3 },
  { name: "Financeiro", href: "Financeiro", icon: DollarSign },
  { name: "Custo & Estrutura", href: "CostStructure", icon: Package },
  { name: "Relatórios Consultas", href: "AppointmentReports", icon: BarChart3 },
  { name: "Relatórios Vendas", href: "SalesReports", icon: BarChart3 },
  { name: "Relatórios Avançados", href: "AdvancedReports", icon: BarChart3 },

  { section: "Analytics & Métricas" },
  { name: "Métricas", href: "Metricas", icon: BarChart3 },
  { name: "Analytics", href: "Analytics", icon: BarChart3 },
  { name: "Receita", href: "Revenue", icon: DollarSign },

  { name: "PRIME OS", href: "PrimeOS", icon: Brain },
  { section: "Estratégia & IA" },
  { name: "AI Insights", href: "AIInsights", icon: Brain },
  { name: "Assistente IA", href: "AIAssistant", icon: Brain },
  { name: "Estratégias", href: "Estrategias", icon: Brain },
  { name: "Estratégia", href: "Strategy", icon: Target },
  { name: "Business Model", href: "BusinessModelCanvas", icon: Puzzle },
  { name: "Proposta de Valor", href: "ValueProposition", icon: Star },
  { name: "Parcerias", href: "KeyPartnerships", icon: Key },
  { name: "Atividades-Chave", href: "KeyActivities", icon: ListChecks },
  { name: "Recursos-Chave", href: "KeyResources", icon: Package },
  { name: "Relacionamentos", href: "CustomerRelationships", icon: Heart },

  { name: "Database Map", href: "DatabaseMap", icon: Layers },
  { section: "Sistema" },
  { name: "Prontuário EHR", href: "EHR", icon: Stethoscope },
  { name: "Integração EHR", href: "EHRIntegration", icon: Activity },
  { name: "Meus Apps", href: "Apps", icon: Smartphone },
  { name: "Gamificação", href: "Gamification", icon: Gamepad2 },
  { name: "Admin Panel", href: "AdminPanel", icon: Shield },
  { name: "Booking Online", href: "OnlineBooking", icon: Globe },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("last_seen_version");
    if (lastSeenVersion !== LATEST_VERSION) {
      setShowWhatsNew(true);
      localStorage.setItem("last_seen_version", LATEST_VERSION);
    }

    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollTop(scrollTop > 10);
    setShowScrollBottom(scrollTop + clientHeight < scrollHeight - 10);
  };

  const scrollNav = (direction) => {
    const container = document.getElementById('nav-container');
    if (container) {
      const scrollAmount = direction === 'up' ? -250 : 250;
      container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  const NavItem = ({ item }) => {
    if (item.section) {
      return (
        <div className="pt-4 pb-1 px-2 first:pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {item.section}
          </span>
        </div>
      );
    }
    const isActive = currentPageName === item.href;
    return (
      <Link
        to={createPageUrl(item.href)}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group select-none touch-manipulation min-h-[44px]",
          isActive
            ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
      >
        <item.icon className={cn("w-5 h-5 select-none", isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400")} />
        <span className="font-medium">{item.name}</span>
        {isActive && <ChevronRight className="w-4 h-4 ml-auto select-none" />}
      </Link>
    );
  };

  const bottomTabItems = [
    { name: "Dashboard", href: "Dashboard", icon: LayoutDashboard },
    { name: "Agenda", href: "Agenda", icon: Calendar },
    { name: "CRM", href: "CRM", icon: Users },
    { name: "Tarefas", href: "Tasks", icon: ListChecks }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-3" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <img
              src={primeLogo}
              alt="Prime Odontologia"
              className="w-9 h-9 rounded-xl object-cover select-none"
            />
            <span className="font-bold text-slate-900 dark:text-slate-100 select-none">Prime Odontologia</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="relative select-none min-w-[44px] min-h-[44px] touch-manipulation flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search className="w-5 h-5 text-slate-600 dark:text-slate-400 select-none" />
            </button>
            <button
              onClick={() => setShowWhatsNew(true)}
              className="relative select-none min-w-[44px] min-h-[44px] touch-manipulation flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              data-tour="whats-new"
            >
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 select-none" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="select-none min-w-[44px] min-h-[44px] touch-manipulation flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {sidebarOpen ? <X className="w-5 h-5 select-none" /> : <Menu className="w-5 h-5 select-none" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm select-none"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 flex flex-col overflow-hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="p-6 flex-shrink-0 border-b border-slate-100 dark:border-slate-800 select-none">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={primeLogo}
              alt="Prime Odontologia"
              className="w-10 h-10 rounded-xl object-cover shadow-lg select-none"
            />
            <div>
              <h1 className="font-bold text-slate-900 dark:text-slate-100">Prime Odontologia</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sistema de Gestão</p>
            </div>
          </div>

          <button
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center justify-start gap-2 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 select-none min-h-[44px] touch-manipulation border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Search className="w-4 h-4 select-none" />
            <span className="flex-1 text-left text-sm">Buscar...</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 select-none">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden min-h-0">
          {showScrollTop && (
            <div className="sticky top-0 z-10 flex justify-center py-1.5 bg-gradient-to-b from-white dark:from-slate-900 via-white dark:via-slate-900 to-transparent pointer-events-none">
              <button
                onClick={() => scrollNav('up')}
                className="h-7 w-full mx-6 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm pointer-events-auto select-none touch-manipulation min-h-[44px] rounded-md flex items-center justify-center"
              >
                <ChevronUp className="h-4 w-4 select-none" />
              </button>
            </div>
          )}

          <nav
            id="nav-container"
            className="space-y-2 overflow-y-auto h-full px-6 py-3"
            onScroll={handleScroll}
            data-tour="navigation"
          >
            {navigation.map((item, index) => (
              <NavItem key={item.name || `section-${item.section}-${index}`} item={item} />
            ))}
          </nav>

          {showScrollBottom && (
            <div className="sticky bottom-0 z-10 flex justify-center py-1.5 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:via-slate-900 to-transparent pointer-events-none">
              <button
                onClick={() => scrollNav('down')}
                className="h-7 w-full mx-6 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm pointer-events-auto select-none touch-manipulation min-h-[44px] rounded-md flex items-center justify-center"
              >
                <ChevronDown className="h-4 w-4 select-none" />
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 space-y-2">
          <button
            onClick={() => setShowWhatsNew(true)}
            className="w-full flex items-center justify-start gap-2 px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 select-none min-h-[44px] touch-manipulation rounded-md text-slate-600 dark:text-slate-300 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 select-none" />
            Novidades & Dicas
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-start gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 select-none min-h-[44px] touch-manipulation rounded-md text-slate-600 dark:text-slate-300 text-sm font-medium"
          >
            <Settings className="w-4 h-4 select-none" />
            Configurações
          </button>
          {user && (
            <div className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar - Mobile Only */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 safe-area-bottom"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-around px-2 py-2 select-none">
          {bottomTabItems.map((item) => {
            const isActive = currentPageName === item.href;
            return (
              <Link
                key={item.href}
                to={createPageUrl(item.href)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all touch-manipulation min-h-[44px] min-w-[44px] select-none",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                <item.icon className={cn("w-6 h-6 select-none", isActive && "scale-110")} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <WhatsNewModal open={showWhatsNew} onClose={() => setShowWhatsNew(false)} />
      <GlobalSearch open={showSearch} onClose={() => setShowSearch(false)} />
      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} user={user} />
    </div>
  );
}

