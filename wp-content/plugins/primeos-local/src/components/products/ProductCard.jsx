// @ts-nocheck
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Package, MessageCircle, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const statusColors = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-100 text-slate-600",
  out_of_stock: "bg-rose-100 text-rose-700",
  discontinued: "bg-amber-100 text-amber-700"
};

export default function ProductCard({ product, onEdit, onDelete, onWhatsAppShare }) {
  const isLowStock = product.stock_quantity <= product.min_stock_level;
  const profit = product.price - (product.cost || 0);
  const margin = product.cost ? ((profit / product.price) * 100).toFixed(1) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="aspect-video bg-slate-100 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-slate-300" />
          </div>
        )}
        {isLowStock && product.status === "active" && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-rose-500 text-white text-xs font-medium rounded-md flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </div>
        )}
        {product.whatsapp_enabled && (
          <div className="absolute top-2 right-2 p-1.5 bg-emerald-500 rounded-md">
            <MessageCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
            {product.category && (
              <p className="text-xs text-slate-500">{product.category}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(product)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onWhatsAppShare(product)}>Share on WhatsApp</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(product)} className="text-rose-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-slate-900">
            ${product.price?.toLocaleString()}
          </span>
          {margin && (
            <span className="text-xs text-emerald-600 font-medium">
              {margin}% margin
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={cn("text-xs border-0", statusColors[product.status])}>
            {product.status?.replace(/_/g, " ")}
          </Badge>
          {product.sku && (
            <Badge variant="outline" className="text-xs">
              SKU: {product.sku}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className={cn("font-medium", isLowStock ? "text-rose-600" : "text-slate-600")}>
            Stock: {product.stock_quantity || 0}
          </span>
          {product.whatsapp_enabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onWhatsAppShare(product)}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-2 h-auto"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Share
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
