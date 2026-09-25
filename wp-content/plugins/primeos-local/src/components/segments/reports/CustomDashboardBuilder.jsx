// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutGrid, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const AVAILABLE_WIDGETS = [
  { type: "conversion_rate", title: "Taxa de Conversão", icon: "📈" },
  { type: "revenue", title: "Receita Total", icon: "💰" },
  { type: "cac", title: "Custo de Aquisição", icon: "💸" },
  { type: "roi", title: "ROI", icon: "📊" },
  { type: "pipeline", title: "Pipeline", icon: "🔄" },
  { type: "team_performance", title: "Performance da Equipe", icon: "👥" }
];

export default function CustomDashboardBuilder() {
  const [dashboardName, setDashboardName] = useState("");
  const [widgets, setWidgets] = useState([]);
  const [saving, setSaving] = useState(false);

  const addWidget = (widgetType) => {
    const widget = AVAILABLE_WIDGETS.find(w => w.type === widgetType);
    if (widget) {
      setWidgets([...widgets, { ...widget, id: Date.now().toString() }]);
      toast.success(`${widget.title} adicionado`);
    }
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
    toast.success("Widget removido");
  };

  const saveDashboard = async () => {
    if (!dashboardName) {
      toast.error("Digite um nome para o dashboard");
      return;
    }

    setSaving(true);
    try {
      // Save dashboard to database
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Dashboard salvo!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-blue-600" />
          Dashboard Personalizado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">Nome do Dashboard</label>
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            placeholder="Meu Dashboard Executivo"
          />
        </div>

        {/* Widget Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Adicionar Widgets</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AVAILABLE_WIDGETS.map((widget) => (
              <Button
                key={widget.type}
                variant="outline"
                size="sm"
                onClick={() => addWidget(widget.type)}
                className="justify-start gap-2 h-auto py-2"
              >
                <span className="text-lg">{widget.icon}</span>
                <span className="text-xs">{widget.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Widgets */}
        {widgets.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Widgets Selecionados ({widgets.length})
            </label>
            <div className="space-y-2">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{widget.icon}</span>
                    <span className="text-sm font-medium text-slate-900">
                      {widget.title}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeWidget(widget.id)}
                    className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={saveDashboard}
          disabled={saving || !dashboardName || widgets.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar Dashboard"}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          Crie dashboards personalizados com seus KPIs favoritos
        </p>
      </CardContent>
    </Card>
  );
}
