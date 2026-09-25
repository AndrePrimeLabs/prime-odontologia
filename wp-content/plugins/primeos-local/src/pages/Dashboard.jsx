// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, Activity, DollarSign, Package, ShoppingCart, 
  TrendingUp, ArrowRight, MessageCircle
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import IntegrationWizard from "@/components/integration/IntegrationWizard";
import AutomationStatus from "@/components/crm/AutomationStatus";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";
import LeadConversionChart from "@/components/dashboard/LeadConversionChart";
import CustomerLTVChart from "@/components/dashboard/CustomerLTVChart";
import TaskCompletionChart from "@/components/dashboard/TaskCompletionChart";
import { subMonths } from "date-fns";
import AppointmentVolumeChart from "@/components/dashboard/clinic/AppointmentVolumeChart";
import RevenueTrackingChart from "@/components/dashboard/clinic/RevenueTrackingChart";
import PatientStatsWidget from "@/components/dashboard/clinic/PatientStatsWidget";
import AppointmentStatusWidget from "@/components/dashboard/clinic/AppointmentStatusWidget";
import PaymentDelinquencyWidget from "@/components/dashboard/clinic/PaymentDelinquencyWidget";
import { Stethoscope } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 3),
    to: new Date()
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list()
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: () => primeos.entities.Activity.list()
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => primeos.entities.Expense.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => primeos.entities.Product.list()
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => primeos.entities.Sale.list()
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => primeos.entities.Lead.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => primeos.entities.Task.list()
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments-dashboard"],
    queryFn: () => primeos.entities.Appointment.list()
  });

  const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalExpenses = expenses.filter(e => e.status === "paid").reduce((sum, e) => sum + (e.amount || 0), 0);
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const pendingActivities = activities.filter(a => a.status === "pending" || a.status === "in_progress").length;
  const whatsappSales = sales.filter(s => s.channel === "whatsapp").length;

  const customerSegments = customers.reduce((acc, c) => {
    const segment = c.segment || "other";
    acc[segment] = (acc[segment] || 0) + 1;
    return acc;
  }, {});

  const segmentData = Object.entries(customerSegments).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value
  }));

  const expenseCategories = expenses.reduce((acc, e) => {
    const cat = e.category || "other";
    acc[cat] = (acc[cat] || 0) + (e.amount || 0);
    return acc;
  }, {});

  const expenseData = Object.entries(expenseCategories)
    .map(([name, value]) => ({
      name: name.replace(/_/g, " ").slice(0, 12),
      value
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const quickLinks = [
    { label: "Customer Relations", icon: Users, href: "CRM", color: "bg-indigo-500" },
    { label: "Key Activities", icon: Activity, href: "Activities", color: "bg-purple-500" },
    { label: "Cost Structure", icon: DollarSign, href: "CostStructure", color: "bg-rose-500" },
    { label: "Revenue & Products", icon: ShoppingCart, href: "Revenue", color: "bg-emerald-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
        </motion.div>

        {/* Integration Wizard */}
        <div className="mb-8">
          <IntegrationWizard 
            existingSecrets={['GOOGLE_CALENDAR', 'GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_DEVELOPER_TOKEN']}
            authorizedConnectors={['googlecalendar']}
          />
        </div>

        {/* CRM Automation Status */}
        <div className="mb-8">
          <AutomationStatus />
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link, idx) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={createPageUrl(link.href)}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-5">
                    <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <link.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{link.label}</h3>
                    <ArrowRight className="w-4 h-4 text-slate-400 mt-2 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={TrendingUp}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title="Total Expenses"
            value={`$${totalExpenses.toLocaleString()}`}
            icon={DollarSign}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
          />
          <StatCard
            title="Active Customers"
            value={activeCustomers}
            subtitle={`of ${customers.length} total`}
            icon={Users}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <StatCard
            title="Pending Tasks"
            value={pendingActivities}
            icon={Activity}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            title="WhatsApp Sales"
            value={whatsappSales}
            subtitle={`of ${sales.length} total`}
            icon={MessageCircle}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
        </div>

        {/* Advanced Analytics Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <LeadConversionChart leads={leads} dateRange={dateRange} />
          <CustomerLTVChart customers={customers} dateRange={dateRange} />
        </div>

        <div className="mb-8">
          <TaskCompletionChart tasks={tasks} dateRange={dateRange} />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
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
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {segmentData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  No customer data yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseData} layout="vertical">
                      <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  No expense data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Clinic Operations Dashboard ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Operações da Clínica</h2>
          </div>

          {/* Row 1: Volume + Revenue */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <AppointmentVolumeChart appointments={appointments} />
            <div>
              <RevenueTrackingChart appointments={appointments} />
            </div>
          </div>

          {/* Row 2: Patients + Status + Delinquency */}
          <div className="grid md:grid-cols-3 gap-6">
            <PatientStatsWidget appointments={appointments} />
            <AppointmentStatusWidget appointments={appointments} />
            <PaymentDelinquencyWidget appointments={appointments} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Sales</CardTitle>
              <Link to={createPageUrl("Revenue")}>
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium text-sm">
                        {sale.customer_name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{sale.customer_name}</p>
                        <p className="text-xs text-slate-500">{sale.channel}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-emerald-600">${sale.total_amount?.toLocaleString()}</span>
                  </div>
                ))}
                {sales.length === 0 && (
                  <p className="text-center text-slate-400 py-8">No sales yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Active Products</CardTitle>
              <Link to={createPageUrl("Revenue")}>
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.filter(p => p.status === "active").slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-indigo-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                        <p className="text-xs text-slate-500">Stock: {product.stock_quantity || 0}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-900">${product.price?.toLocaleString()}</span>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-center text-slate-400 py-8">No products yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
