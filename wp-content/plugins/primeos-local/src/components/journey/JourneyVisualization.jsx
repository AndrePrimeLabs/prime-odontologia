// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3 } from "lucide-react";

export default function JourneyVisualization({ stages, currentStage, progress }) {
  const stageColors = {
    awareness: "bg-blue-500",
    consideration: "bg-purple-500",
    decision: "bg-green-500",
    retention: "bg-orange-500",
    advocacy: "bg-pink-500"
  };

  const stageIcons = {
    awareness: "🔍",
    consideration: "🤔",
    decision: "✅",
    retention: "💎",
    advocacy: "⭐"
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Visualização da Jornada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Journey Timeline */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
            {stages.map((stage, idx) => {
              const isCurrent = stage.stage === currentStage;
              const isCompleted = idx < stages.findIndex(s => s.stage === currentStage);
              
              return (
                <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <div
                      className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-center border-4 transition-all ${
                        isCurrent
                          ? `border-slate-900 ${stageColors[stage.stage]} text-white scale-110`
                          : isCompleted
                          ? `border-gray-300 ${stageColors[stage.stage]} text-white opacity-60`
                          : 'border-gray-200 bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{stageIcons[stage.stage]}</span>
                      <span className="text-xs font-bold capitalize">
                        {stage.stage.substring(0, 3)}
                      </span>
                    </div>
                    {isCurrent && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-white font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  {idx < stages.length - 1 && (
                    <ArrowRight className={`w-6 h-6 ${isCurrent || isCompleted ? 'text-slate-900' : 'text-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Stage Details */}
          {currentStage && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2 capitalize">
                Estágio Atual: {currentStage}
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-2">Progresso: {progress}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-2xl">{stageIcons[currentStage]}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
