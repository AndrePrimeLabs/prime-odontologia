// @ts-nocheck
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Zap, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function PointsDisplay() {
  const { data: userPoints, isLoading } = useQuery({
    queryKey: ["userPoints"],
    queryFn: async () => {
      const user = await primeos.auth.me();
      const points = await primeos.entities.UserPoints.filter({ 
        user_email: user.email 
      });
      return points[0];
    },
  });

  if (isLoading || !userPoints) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="animate-pulse">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = ((userPoints.total_points % 100) / 100) * 100;

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Pontos Totais</p>
              <p className="text-3xl font-bold text-blue-600">
                {userPoints.total_points}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Nível</p>
              <p className="text-3xl font-bold text-indigo-600">
                {userPoints.current_level}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Sequência</p>
              <p className="text-3xl font-bold text-amber-600">
                {userPoints.streak_days}
              </p>
            </div>
          </div>

          {/* Level Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Progresso para próximo nível
              </span>
              <span className="text-xs text-slate-500">
                {userPoints.total_points % 100}/{100}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Weekly/Monthly */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Pontos Semanais</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {userPoints.weekly_points}
                </span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Pontos Mensais</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {userPoints.monthly_points}
                </span>
                <Zap className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
