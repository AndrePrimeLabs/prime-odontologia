// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Brain, Calendar, Clock, Loader2, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AIReschedulePanel({ appointment, onSelectSlot }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const analyze = async () => {
    setLoading(true);
    const res = await primeos.functions.invoke('suggestRescheduling', {
      patientId: appointment.patient_id,
      appointmentId: appointment.id
    });
    setData(res.data);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center gap-2 py-4 text-slate-500 text-sm">
      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
      A IA está analisando o histórico e a agenda...
    </div>
  );

  if (!data) return (
    <Button onClick={analyze} size="sm" variant="outline" className="gap-2 w-full text-indigo-700 border-indigo-200 hover:bg-indigo-50">
      <Brain className="w-4 h-4" />
      Sugerir Melhores Horários (IA)
    </Button>
  );

  const confidenceColor = (c) => c >= 80 ? 'text-green-600' : c >= 60 ? 'text-yellow-600' : 'text-red-500';

  return (
    <div className="space-y-3">
      {data.patient_insight && (
        <div className="flex items-start gap-2 p-2.5 bg-indigo-50 rounded-lg text-xs text-indigo-800">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          {data.patient_insight}
        </div>
      )}

      <div className="space-y-2">
        {(data.suggestions || []).map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-medium">{s.day_of_week}, {s.date}</span>
                <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                <span className="text-sm">{s.time}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{s.reason}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn("text-xs font-semibold", confidenceColor(s.confidence))}>
                {s.confidence}%
              </span>
              <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                onClick={() => { onSelectSlot(s.date, s.time); toast.success("Horário selecionado!"); }}>
                <CheckCircle className="w-3 h-3 mr-1" />
                Agendar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {data.risk_note && (
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">⚠️ {data.risk_note}</p>
      )}

      <Button onClick={analyze} variant="ghost" size="sm" className="w-full text-xs text-slate-500">
        Refazer análise
      </Button>
    </div>
  );
}
