// @ts-nocheck
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Calendar, Building2, Receipt } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const categoryColors = {
  fixed_costs: "bg-purple-50 text-purple-700",
  variable_costs: "bg-blue-50 text-blue-700",
  salaries: "bg-emerald-50 text-emerald-700",
  marketing: "bg-pink-50 text-pink-700",
  technology: "bg-indigo-50 text-indigo-700",
  rent: "bg-amber-50 text-amber-700",
  utilities: "bg-cyan-50 text-cyan-700",
  supplies: "bg-orange-50 text-orange-700",
  professional_services: "bg-violet-50 text-violet-700",
  other: "bg-slate-50 text-slate-600"
};

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-600"
};

export default function ExpenseCard({ expense, onEdit, onDelete, onMarkPaid }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">{expense.title}</h3>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {expense.currency || "$"}{expense.amount?.toLocaleString()}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(expense)}>Edit</DropdownMenuItem>
            {expense.status !== "paid" && (
              <DropdownMenuItem onClick={() => onMarkPaid(expense)}>Mark as Paid</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDelete(expense)} className="text-rose-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={cn("text-xs border-0", categoryColors[expense.category])}>
          {expense.category?.replace(/_/g, " ")}
        </Badge>
        <Badge className={cn("text-xs border-0", statusColors[expense.status])}>
          {expense.status}
        </Badge>
        {expense.frequency !== "one_time" && (
          <Badge variant="outline" className="text-xs">
            {expense.frequency}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {expense.date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
          </div>
        )}
        {expense.vendor && (
          <div className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            <span>{expense.vendor}</span>
          </div>
        )}
        {expense.receipt_url && (
          <a
            href={expense.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            <Receipt className="w-3 h-3" />
            <span>Receipt</span>
          </a>
        )}
      </div>
    </motion.div>
  );
}
