import { useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import primeLogo from "@/assets/prime-logo.svg";
import {
  LayoutDashboard,
  Users,
  Activity,
  DollarSign,
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
  ListChecks,
  Sparkles,
  Mail,
  HeadphonesIcon,
  Settings,
  Shield,
  Stethoscope,
  Globe,
  Map,
  Star,
  Package,
  Key,
  Smartphone,
  Gamepad2,
  UserCheck,
  Route as RouteIcon,
  Layers,
  LogOut,
  ShoppingCart,
} from "lucide-react";

type NavEntry = {
  section?: string;
  name?: string;
  href?: string;
  icon?: typeof LayoutDashboard;
};

const navigation: NavEntry[] = [
  { section: "Operacional" },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pipeline Pacientes", href: "/patient-pipeline", icon: Heart },
  { name: "Prontuários", href: "/prontuarios", icon: ClipboardList },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Agenda CRM", href: "/crm-agenda", icon: Calendar },
  { name: "Agendamento Online", href: "/meu-agendamento", icon: Globe },
  { name: "Tarefas", href: "/tasks", icon: ListChecks },
  { name: "Calendário de Tarefas", href: "/task-calendar", icon: Calendar },
  { name: "Atividades", href: "/activities", icon: Activity },
  { name: "POPs", href: "/pops", icon: FileText },
  { name: "SOPs", href: "/sops", icon: FileText },
  { name: "Catálogo Prime", href: "/catalogo", icon: BookOpen },
  { name: "Estoque", href: "/inventory", icon: Package },
  { name: "Canais Atendimento", href: "/canais", icon: Inbox },
  { name: "Suporte ao Cliente", href: "/customer-support", icon: HeadphonesIcon },

  { section: "CRM & Pacientes" },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "CRM Avançado", href: "/crm-avancado", icon: Target },
  { name: "Segmentação", href: "/customer-segments", icon: Layers },
  { name: "Jornada Cliente", href: "/jornada-cliente", icon: RouteIcon },
  { name: "Jornada do Cliente", href: "/journey-mapping", icon: Map },
  { name: "Portal do Cliente", href: "/client-portal", icon: UserCheck },
  { name: "Pipeline de Clientes", href: "/customer-pipeline", icon: TrendingUp },

  { section: "Vendas" },
  { name: "Leads", href: "/leads-pipeline", icon: Users },
  { name: "Pipeline Vendas", href: "/sales-pipeline", icon: TrendingUp },
  { name: "Vendas", href: "/sales", icon: DollarSign },
  { name: "Revenue Stream", href: "/revenue-streams", icon: ShoppingCart },
  { name: "Scripts Vendas", href: "/scripts-vendas", icon: BookOpen },

  { section: "Marketing" },
  { name: "Marketing OS", href: "/marketing-os", icon: Zap },
  { name: "Campanhas", href: "/campanhas", icon: Megaphone },
  { name: "Conteúdos", href: "/conteudos", icon: FileText },
  { name: "AI Content Creator", href: "/content-creator", icon: Sparkles },
  { name: "Email Automation", href: "/email-automation", icon: Mail },
  { name: "Marketing Automation", href: "/marketing-automation", icon: Zap },
  { name: "Canais Marketing", href: "/channels", icon: Megaphone },

  { section: "Finanças" },
  { name: "Dashboard Financeiro", href: "/dashboard-financeiro", icon: BarChart3 },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Custo & Estrutura", href: "/cost-structure", icon: Package },
  { name: "Relatórios Consultas", href: "/appointment-reports", icon: BarChart3 },
  { name: "Relatórios Vendas", href: "/sales-reports", icon: BarChart3 },
  { name: "Relatórios Avançados", href: "/advanced-reports", icon: BarChart3 },

  { section: "Analytics & Métricas" },
  { name: "Métricas", href: "/metricas", icon: BarChart3 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Receita", href: "/revenue", icon: DollarSign },

  { section: "Estratégia & IA" },
  { name: "PRIME OS", href: "/prime-os", icon: Brain },
  { name: "AI Insights", href: "/ai-insights", icon: Brain },
  { name: "Assistente IA", href: "/ai-assistant", icon: Brain },
  { name: "Estratégias", href: "/estrategias", icon: Brain },
  { name: "Estratégia", href: "/strategy", icon: Target },
  { name: "Business Model", href: "/business-model-canvas", icon: Puzzle },
  { name: "Proposta de Valor", href: "/value-proposition", icon: Star },
  { name: "Parcerias", href: "/key-partnerships", icon: Key },
  { name: "Atividades-Chave", href: "/key-activities", icon: ListChecks },
  { name: "Recursos-Chave", href: "/key-resources", icon: Package },
  { name: "Relacionamentos", href: "/customer-relationships", icon: Heart },

  { section: "Sistema" },
  { name: "Database Map", href: "/database-map", icon: Layers },
  { name: "Prontuário EHR", href: "/ehr", icon: Stethoscope },
  { name: "Integração EHR", href: "/ehr-integration", icon: Activity },
  { name: "Meus Apps", href: "/apps", icon: Smartphone },
  { name: "Gamificação", href: "/gamification", icon: Gamepad2 },
  { name: "Admin Panel", href: "/admin-panel", icon: Shield },
  { name: "Booking Online", href: "/online-booking", icon: Globe },
];

const bottomTabItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "Tarefas", href: "/tasks", icon: ListChecks },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  // Use plain anchors so links to not-yet-ported pages still render the
  // 404 page instead of failing TanStack's typed Link checks.
  const NavItemComponent = ({ item }: { item: NavEntry }) => {
    if (item.section || !item.href || !item.icon) {
      return (
        <div className="pt-4 pb-1 px-2 first:pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {item.section}
          </span>
        </div>
      );
    }
    const href = item.href;
    const Icon = item.icon;
    const active = isActive(href);
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          setSidebarOpen(false);
          window.location.assign(href);
        }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group select-none touch-manipulation min-h-[44px]",
          active
            ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5",
            active
              ? "text-white"
              : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
          )}
        />
        <span className="font-medium text-sm">{item.name}</span>
        {active && <ChevronRight className="w-4 h-4 ml-auto" />}
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Mobile header */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={primeLogo}
              alt="Prime Odontologia"
              className="w-9 h-9 rounded-xl object-cover"
            />
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Prime Odontologia
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </header>

      {/* Sidebar - Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={primeLogo}
              alt="Prime Odontologia"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Prime Odontologia
              </h1>
              <p className="text-xs text-slate-500">PrimeOS</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {navigation.map((item, index) => (
            <NavItemComponent
              key={item.section ?? item.name ?? index}
              item={item}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Settings className="w-4 h-4" />
            Configurações
          </button>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
          {user && (
            <div className="px-2 py-1 text-xs text-slate-500 truncate">
              {user.email}
            </div>
          )}
        </div>
      </aside>

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

      {/* Bottom tab bar - Mobile */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {bottomTabItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.assign(item.href);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-h-[44px] min-w-[44px]",
                  active
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                    : "text-slate-600 dark:text-slate-400",
                )}
              >
                <item.icon
                  className={cn("w-6 h-6", active && "scale-110")}
                />
                <span className="text-xs font-medium">{item.name}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
