// @ts-nocheck
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  User, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function POPViewer({ pop, open, onClose }) {
  if (!pop) return null;

  const categoriaColors = {
    operacional: "bg-blue-50 text-blue-700 border-blue-200",
    clinico: "bg-green-50 text-green-700 border-green-200",
    administrativo: "bg-purple-50 text-purple-700 border-purple-200",
    marketing: "bg-pink-50 text-pink-700 border-pink-200",
    qualidade: "bg-amber-50 text-amber-700 border-amber-200",
    gestao: "bg-indigo-50 text-indigo-700 border-indigo-200"
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl mb-2">{pop.nome}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-slate-100 text-slate-700 font-mono">
                  {pop.codigo}
                </Badge>
                <Badge variant="outline">Versão {pop.versao}</Badge>
                <Badge variant="outline" className={categoriaColors[pop.categoria]}>
                  {pop.categoria}
                </Badge>
              </div>
            </div>
            {pop.arquivo_url && (
              <Button
                variant="outline"
                onClick={() => window.open(pop.arquivo_url, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="detalhes" className="mt-4">
          <TabsList>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            {pop.historico_versoes?.length > 0 && (
              <TabsTrigger value="historico">
                Histórico ({pop.historico_versoes.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="detalhes" className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Objetivo</h4>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{pop.objetivo}</p>
            </div>

            {pop.descricao && (
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Descrição</h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
                  {pop.descricao}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Responsável</span>
                </div>
                <p className="text-slate-900 font-semibold">{pop.responsavel}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Frequência</span>
                </div>
                <p className="text-slate-900 font-semibold">{pop.frequencia}</p>
              </div>
            </div>

            {pop.indicadores && pop.indicadores.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Indicadores Monitorados</h4>
                <div className="space-y-2">
                  {pop.indicadores.map((indicador, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-indigo-50 p-2 rounded">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-slate-700">{indicador}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pop.pontos_atencao && pop.pontos_atencao.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Pontos de Atenção</h4>
                <div className="space-y-2">
                  {pop.pontos_atencao.map((ponto, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-amber-50 p-3 rounded">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-700">{ponto}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pop.tags && pop.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {pop.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="bg-slate-50">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="checklist" className="space-y-2">
            {pop.checklist && pop.checklist.length > 0 ? (
              <div className="space-y-2">
                {pop.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                    <div className="bg-white border-2 border-slate-300 rounded w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">Nenhum item no checklist</p>
            )}
          </TabsContent>

          {pop.historico_versoes?.length > 0 && (
            <TabsContent value="historico" className="space-y-3">
              <div className="space-y-3">
                {pop.historico_versoes.map((versao, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">v{versao.versao}</Badge>
                          <span className="text-sm text-slate-600">
                            {format(new Date(versao.data), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{versao.alteracoes}</p>
                      </div>
                      {versao.arquivo_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(versao.arquivo_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {pop.arquivo_url && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">
                  Documento PDF disponível
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(pop.arquivo_url, '_blank')}
              >
                Abrir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
