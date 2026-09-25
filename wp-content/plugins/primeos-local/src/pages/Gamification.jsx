// @ts-nocheck
import PageHeader from "@/components/shared/PageHeader";
import PointsDisplay from "@/components/gamification/PointsDisplay";
import UserBadges from "@/components/gamification/UserBadges";
import Leaderboard from "@/components/gamification/Leaderboard";
import { Zap } from "lucide-react";

export default function Gamification() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Gamificação"
          subtitle="Ganhe pontos, conquiste badges e suba no ranking"
          icon={Zap}
        />

        {/* Points Display */}
        <PointsDisplay />

        {/* Badges */}
        <UserBadges />

        {/* Leaderboard */}
        <Leaderboard />
      </div>
    </div>
  );
}
