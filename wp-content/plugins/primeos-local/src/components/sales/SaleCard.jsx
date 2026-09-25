// @ts-nocheck
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Package } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-600",
  refunded: "bg-rose-100 text-rose-700"
};

const paymentColors = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  partial: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  refunded: "bg-rose-50 text-rose-700 border-rose-200"
};

const channelIcons = {
  whatsapp: "💬",
  direct: "🤝",
  website: "🌐",
  phone: "📞",
  in_person: "🏪"
};

export default function SaleCard({ sale, onEdit, onDelete, onStatusChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
            {sale.customer_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{sale.customer_name}</h3>
              <span className="text-lg">{channelIcons[sale.channel] || "📦"}</span>
            </div>
            <p className="text-xs text-slate-500">
              {sale.created_date && format(new Date(sale.created_date), "MMM d, yyyy h:mm a")}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(sale)}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(sale, "confirmed")}>Confirm</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(sale, "shipped")}>Mark Shipped</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(sale, "delivered")}>Mark Delivered</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(sale, "cancelled")} className="text-rose-600">Cancel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={cn("text-xs border-0", statusColors[sale.status])}>
          {sale.status?.replace(/_/g, " ")}
        </Badge>
        <Badge variant="outline" className={cn("text-xs", paymentColors[sale.payment_status])}>
          Payment: {sale.payment_status}
        </Badge>
      </div>

      {sale.products && sale.products.length > 0 && (
        <div className="space-y-2 mb-4">
          {sale.products.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3 text-slate-400" />
                <span className="text-slate-700">{item.product_name}</span>
                <span className="text-slate-400">×{item.quantity}</span>
              </div>
              <span className="font-medium">${item.total?.toLocaleString()}</span>
            </div>
          ))}
          {sale.products.length > 3 && (
            <p className="text-xs text-slate-500">+{sale.products.length - 3} more items</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-sm text-slate-500">Total</span>
        <span className="text-xl font-bold text-slate-900">
          ${sale.total_amount?.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
