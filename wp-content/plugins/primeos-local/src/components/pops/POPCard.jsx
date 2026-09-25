// @ts-nocheck
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Download, 
  Eye, 
  MoreVertical,
  Calendar,
  User,
  CheckCircle2,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function POPCard({ pop, onView, onToggleFavorite, onEdit }) {
  const categoriaColors = {
    operacional: "bg-blue-50 text-blue-700 border-blue-200",
    clinico: "bg-green-50 text-green-700 border-green-200",
    administrativo: "bg-purple-50 text-purple-700 border-purple-200",
    marketing: "bg-pink-50 text-pink-700 border-pink-200",
    qualidade: "bg-amber-50 text-amber-700 border-amber-200",
    gestao: "bg-indigo-50 text-indigo-700 border-indigo-200"
  };

  const frequenciaIcons = {
    diaria: <Clock className="w-3 h-3" />,
    semanal: <Calendar className="w-3 h-3" />,
    mensal: <Calendar className="w-3 h-3" />,
    sob_demanda: <CheckCircle2 className="w-3 h-3" />,
    apos_atendimento: <User className="w-3 h-3" />
  };

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 cursor-pointer relative",
      pop.favorito && "ring-2 ring-yellow-400"
    )}>
      {pop.favorito && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-yellow-400 rounded-full p-1.5 shadow-lg">
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={() => onView(pop)}>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-slate-100 text-slate-700 font-mono">
                {pop.codigo}
              </Badge>
              <Badge variant="outline" className="text-xs">
                v{pop.versao}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg mb-1">{pop.nome}</h3>
            <p className="text-sm text-slate-600 line-clamp-2">{pop.objetivo}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(pop)}>
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFavorite(pop)}>
                <Star className={cn("w-4 h-4 mr-2", pop.favorito && "fill-yellow-400 text-yellow-400")} />
                {pop.favorito ? "Remover favorito" : "Marcar favorito"}
              </DropdownMenuItem>
              {pop.arquivo_url && (
                <DropdownMenuItem onClick={() => window.open(pop.arquivo_url, '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(pop)}>
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent onClick={() => onView(pop)}>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className={categoriaColors[pop.categoria]}>
            {pop.categoria}
          </Badge>
          <Badge variant="outline" className="bg-slate-50 text-slate-600">
            <span className="mr-1">{frequenciaIcons[pop.frequencia]}</span>
            {pop.frequencia}
          </Badge>
          {pop.status === "em_revisao" && (
            <Badge className="bg-orange-100 text-orange-700">Em revisão</Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{pop.responsavel}</span>
          </div>
          {pop.checklist && (
            <span className="text-xs">{pop.checklist.length} itens</span>
          )}
        </div>

        {pop.tags && pop.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {pop.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
            {pop.tags.length > 3 && (
              <span className="text-xs text-slate-400">+{pop.tags.length - 3}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
