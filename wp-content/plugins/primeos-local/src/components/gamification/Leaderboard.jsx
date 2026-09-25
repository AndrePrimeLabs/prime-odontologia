// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const allPoints = await primeos.entities.UserPoints.list();
      return allPoints
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 10);
    },
  });

  const getMedalIcon = (position) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return position;
  };

  const getRankColor = (position) => {
    if (position === 1) return "bg-yellow-50 border-yellow-200";
    if (position === 2) return "bg-slate-50 border-slate-200";
    if (position === 3) return "bg-orange-50 border-orange-200";
    return "bg-white border-slate-200";
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-600" />
          Leaderboard (Top 10)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((player, idx) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg border-2 flex items-center justify-between ${getRankColor(idx + 1)}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl font-bold w-8 text-center">
                    {getMedalIcon(idx + 1)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">
                      {player.user_email.split('@')[0]}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Nível {player.current_level}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">
                    {player.total_points}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {player.current_level === 10 ? "Max" : `${player.points_to_next_level - player.total_points} pts`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
