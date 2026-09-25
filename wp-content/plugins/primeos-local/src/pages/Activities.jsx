// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import ActivityCard from "@/components/activities/ActivityCard";
import ActivityForm from "@/components/activities/ActivityForm";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, CheckCircle, Clock, AlertTriangle, Search } from "lucide-react";

export default function Activities() {
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => primeos.entities.Activity.list("-created_date")
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.Activity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      setShowForm(false);
      setEditingActivity(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Activity.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      setShowForm(false);
      setEditingActivity(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.Activity.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities"] })
  });

  const handleSave = (data) => {
    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleStatusChange = (activity, newStatus) => {
    updateMutation.mutate({
      id: activity.id,
      data: { ...activity, status: newStatus, progress: newStatus === "completed" ? 100 : activity.progress }
    });
  };

  const filteredActivities = activities.filter(a => {
    const matchesSearch = a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const pendingCount = activities.filter(a => a.status === "pending").length;
  const inProgressCount = activities.filter(a => a.status === "in_progress").length;
  const completedCount = activities.filter(a => a.status === "completed").length;
  const criticalCount = activities.filter(a => a.priority === "critical" && a.status !== "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Key Activities"
          subtitle="Manage your business operations and tasks"
          icon={Activity}
          actionLabel="New Activity"
          onAction={() => setShowForm(true)}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Pending"
            value={pendingCount}
            icon={Clock}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon={Activity}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Completed"
            value={completedCount}
            icon={CheckCircle}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title="Critical"
            value={criticalCount}
            icon={AlertTriangle}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="production">🏭 Production</SelectItem>
              <SelectItem value="marketing">📢 Marketing</SelectItem>
              <SelectItem value="sales">💰 Sales</SelectItem>
              <SelectItem value="operations">⚙️ Operations</SelectItem>
              <SelectItem value="development">💻 Development</SelectItem>
              <SelectItem value="support">🎧 Support</SelectItem>
              <SelectItem value="administration">📋 Administration</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activity Grid */}
        {filteredActivities.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={handleEdit}
                  onDelete={(a) => deleteMutation.mutate(a.id)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No activities yet"
            description="Start organizing your key business activities and tasks."
            actionLabel="New Activity"
            onAction={() => setShowForm(true)}
          />
        )}

        {/* Form */}
        <ActivityForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingActivity(null);
          }}
          onSave={handleSave}
          activity={editingActivity}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}
