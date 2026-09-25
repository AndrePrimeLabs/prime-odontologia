// @ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { primeos } from "@/api/primeosClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Search, 
  User, 
  Calendar, 
  CheckSquare, 
  FileText,
  Loader2,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  user: User,
  calendar: Calendar,
  check: CheckSquare,
  file: FileText,
  trend: TrendingUp
};

const statusColors = {
  // Lead statuses
  novo: "bg-blue-100 text-blue-700",
  em_conversa: "bg-yellow-100 text-yellow-700",
  fechado: "bg-green-100 text-green-700",
  perdido: "bg-red-100 text-red-700",
  
  // Customer statuses
  lead: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  
  // Appointment statuses
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-orange-100 text-orange-700",
  
  // Task statuses
  pendente: "bg-yellow-100 text-yellow-700",
  em_andamento: "bg-blue-100 text-blue-700",
  concluida: "bg-green-100 text-green-700",
  
  // POP statuses
  ativo: "bg-green-100 text-green-700",
  em_revisao: "bg-yellow-100 text-yellow-700"
};

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await primeos.functions.invoke('globalSearch', { query });
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, results, selectedIndex]);

  const handleResultClick = (result) => {
    navigate(createPageUrl(result.page));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex items-center border-b border-slate-200 px-4 py-3">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar leads, clientes, agendamentos, tarefas..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            autoFocus
          />
          {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin ml-2" />}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {query.length > 0 && query.length < 2 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              Digite pelo menos 2 caracteres para buscar
            </div>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              Nenhum resultado encontrado
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = iconMap[result.icon] || FileText;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      "w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left",
                      selectedIndex === index && "bg-slate-50"
                    )}
                  >
                    <div className="p-2 rounded-lg bg-slate-100">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 truncate">
                          {result.title}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {result.subtitle}
                      </p>
                    </div>

                    {result.status && (
                      <Badge className={cn("text-xs", statusColors[result.status] || "bg-slate-100 text-slate-700")}>
                        {result.status}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">Enter</kbd>
              selecionar
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">Esc</kbd>
            fechar
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
