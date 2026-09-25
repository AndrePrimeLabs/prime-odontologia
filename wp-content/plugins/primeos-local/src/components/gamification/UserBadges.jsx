// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Award, Lock } from "lucide-react";

export default function UserBadges() {
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ["userBadges"],
    queryFn: async () => {
      const user = await primeos.auth.me();
      return primeos.entities.UserBadge.filter({ user_email: user.email });
    },
  });

  const rarityColors = {
    common: "bg-slate-100",
    rare: "bg-blue-100",
    epic: "bg-purple-100",
    legendary: "bg-yellow-100"
  };

  const rarityBorder = {
    common: "border-slate-300",
    rare: "border-blue-300",
    epic: "border-purple-300",
    legendary: "border-yellow-300"
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" />
          Badges Conquistadas ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Lock className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>Nenhuma badge conquistada ainda</p>
            <p className="text-xs mt-1">Complete tarefas, feche deals e gerem relatórios!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl text-center border-2 ${
                  rarityColors[badge.rarity]
                } ${rarityBorder[badge.rarity]} transition-transform hover:scale-105`}
              >
                <div className="text-4xl mb-2">{badge.badge_icon}</div>
                <h4 className="font-semibold text-sm text-slate-900 mb-1">
                  {badge.badge_name}
                </h4>
                <p className="text-xs text-slate-600 mb-2">{badge.badge_description}</p>
                <div className="text-xs font-medium text-amber-600">
                  +{badge.points_awarded} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
