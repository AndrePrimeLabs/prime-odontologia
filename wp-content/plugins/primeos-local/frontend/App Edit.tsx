// @ts-nocheck
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Calendar, Clock, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const priorityColors = {
  critical: "bg-rose-50 text-rose-700 border-rose-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-600 border-slate-200"
};

const statusColors = {
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  on_hold: "bg-amber-100 text-amber-700",
  cancelled: "bg-rose-100 text-rose-700"
};

const categoryIcons = {
  production: "🏭",
  marketing: "📢",
  sales: "💰",
  operations: "⚙️",
  development: "💻",
  support: "🎧",
  administration: "📋"
};

export default function ActivityCard({ activity, onEdit, onDelete, onStatusChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{categoryIcons[activity.category] || "📌"}</span>
          <div>
            <h3 className="font-semibold text-slate-900 line-clamp-1">{activity.title}</h3>
            <span className="text-xs text-slate-500 capitalize">{activity.category?.replace(/_/g, " ")}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(activity)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(activity, "in_progress")}>Start</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(activity, "completed")}>Complete</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(activity, "on_hold")}>Put on Hold</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(activity)} className="text-rose-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {activity.description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{activity.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className={cn("text-xs", priorityColors[activity.priority])}>
          {activity.priority}
        </Badge>
        <Badge className={cn("text-xs border-0", statusColors[activity.status])}>
          {activity.status?.replace(/_/g, " ")}
        </Badge>
      </div>

      {activity.progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{activity.progress}%</span>
          </div>
          <Progress value={activity.progress} className="h-1.5" />
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {activity.due_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(activity.due_date), "MMM d")}</span>
          </div>
        )}
        {activity.estimated_hours && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{activity.estimated_hours}h est.</span>
          </div>
        )}
        {activity.assigned_to && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{activity.assigned_to}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
