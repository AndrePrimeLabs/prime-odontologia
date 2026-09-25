// @ts-nocheck
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MoreVertical, MessageCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const statusColors = {
  lead: "bg-amber-50 text-amber-700 border-amber-200",
  prospect: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-50 text-slate-600 border-slate-200",
  churned: "bg-rose-50 text-rose-700 border-rose-200"
};

const segmentColors = {
  enterprise: "bg-purple-50 text-purple-700",
  small_business: "bg-indigo-50 text-indigo-700",
  individual: "bg-cyan-50 text-cyan-700",
  partner: "bg-emerald-50 text-emerald-700"
};

export default function CustomerCard({ customer, onEdit, onDelete, onInteraction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {customer.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{customer.name}</h3>
            {customer.company && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Building2 className="w-3 h-3" />
                <span>{customer.company}</span>
              </div>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(customer)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInteraction(customer)}>Log Interaction</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(customer)} className="text-rose-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className={cn("text-xs", statusColors[customer.status])}>
          {customer.status?.replace(/_/g, " ")}
        </Badge>
        {customer.segment && (
          <Badge className={cn("text-xs border-0", segmentColors[customer.segment])}>
            {customer.segment?.replace(/_/g, " ")}
          </Badge>
        )}
        {customer.value_tier && (
          <Badge variant="outline" className="text-xs">
            {customer.value_tier} value
          </Badge>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {customer.email && (
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{customer.phone}</span>
          </div>
        )}
      </div>

      {customer.phone && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <a
            href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </a>
        </div>
      )}
    </motion.div>
  );
}
