// @ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

export default function ActivityForm({ open, onClose, onSave, activity, isLoading }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "operations",
    priority: "medium",
    status: "pending",
    assigned_to: "",
    start_date: "",
    due_date: "",
    estimated_hours: "",
    progress: 0
  });

  useEffect(() => {
    if (activity) {
      setForm(activity);
    } else {
      setForm({
        title: "",
        description: "",
        category: "operations",
        priority: "medium",
        status: "pending",
        assigned_to: "",
        start_date: "",
        due_date: "",
        estimated_hours: "",
        progress: 0
      });
    }
  }, [activity, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity ? "Edit Activity" : "New Activity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Activity title"
                required
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">🏭 Production</SelectItem>
                  <SelectItem value="marketing">📢 Marketing</SelectItem>
                  <SelectItem value="sales">💰 Sales</SelectItem>
                  <SelectItem value="operations">⚙️ Operations</SelectItem>
                  <SelectItem value="development">💻 Development</SelectItem>
                  <SelectItem value="support">🎧 Support</SelectItem>
                  <SelectItem value="administration">📋 Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned To</Label>
              <Input
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                placeholder="Team member"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Estimated Hours</Label>
              <Input
                type="number"
                value={form.estimated_hours}
                onChange={(e) => setForm({ ...form, estimated_hours: parseFloat(e.target.value) || "" })}
                placeholder="Hours"
              />
            </div>
            <div>
              <Label>Actual Hours</Label>
              <Input
                type="number"
                value={form.actual_hours || ""}
                onChange={(e) => setForm({ ...form, actual_hours: parseFloat(e.target.value) || "" })}
                placeholder="Hours"
              />
            </div>
            <div className="col-span-2">
              <Label>Progress: {form.progress}%</Label>
              <Slider
                value={[form.progress || 0]}
                onValueChange={([v]) => setForm({ ...form, progress: v })}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Activity details..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {activity ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
