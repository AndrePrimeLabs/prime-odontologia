import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Customer,
  Activity,
  Expense,
  Sale,
  Lead,
  Task,
  Appointment,
} from "@/api/entities";
import {
  Users,
  Activity as ActivityIcon,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Calendar,
  ListChecks,
  Heart,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof Users;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );
}

function Dashboard() {
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => Customer.list(),
  });
  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: () => Activity.list(),
  });
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => Expense.list(),
  });
  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => Sale.list(),
  });
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => Lead.list(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => Task.list(),
  });
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => Appointment.list(),
  });

  const totalRevenue = sales.reduce((s, x) => s + (x.total_amount || 0), 0);
  const totalExpenses = expenses
    .filter((e) => e.status === "paid")
    .reduce((s, x) => s + (x.amount || 0), 0);
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const pendingActivities = activities.filter(
    (a) => a.status === "pending" || a.status === "in_progress",
  ).length;
  const whatsappSales = sales.filter((s) => s.channel === "whatsapp").length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const openTasks = tasks.filter((t) => t.status !== "completed").length;
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed",
  ).length;

  const segments = customers.reduce<Record<string, number>>((acc, c) => {
    const seg = c.segment || "outros";
    acc[seg] = (acc[seg] || 0) + 1;
    return acc;
  }, {});
  const segmentData = Object.entries(segments).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
  }));

  const expenseCategories = expenses.reduce<Record<string, number>>((acc, e) => {
    const cat = e.category || "outros";
    acc[cat] = (acc[cat] || 0) + (e.amount || 0);
    return acc;
  }, {});
  const expenseData = Object.entries(expenseCategories)
    .map(([name, value]) => ({
      name: name.replace(/_/g, " ").slice(0, 14),
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(v);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/20 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visão geral do PrimeOS
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Receita Total"
            value={fmt(totalRevenue)}
            icon={TrendingUp}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title="Despesas"
            value={fmt(totalExpenses)}
            icon={DollarSign}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
          />
          <StatCard
            title="Clientes Ativos"
            value={activeCustomers}
            subtitle={`de ${customers.length} total`}
            icon={Users}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <StatCard
            title="Atividades Pendentes"
            value={pendingActivities}
            icon={ActivityIcon}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Vendas WhatsApp"
            value={whatsappSales}
            subtitle={`de ${sales.length} vendas`}
            icon={MessageCircle}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="Novos Leads"
            value={newLeads}
            icon={Heart}
            iconBg="bg-pink-50"
            iconColor="text-pink-600"
          />
          <StatCard
            title="Tarefas Abertas"
            value={openTasks}
            icon={ListChecks}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            title="Próximas Consultas"
            value={upcomingAppointments}
            icon={Calendar}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Segmentos de Clientes
            </h3>
            {segmentData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {segmentData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                Sem dados de clientes ainda
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Despesas por Categoria
            </h3>
            {expenseData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseData}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      stroke="#94a3b8"
                    />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip
                      formatter={(v: number) => fmt(v)}
                      contentStyle={{ borderRadius: 8 }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                Sem despesas registradas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
