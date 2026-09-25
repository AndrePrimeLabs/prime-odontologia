import { createPrimeosClientFromRequest } from './primeosClient.ts';

const POINT_RULES = {
  task_completed: 10,
  deal_closed: 100,
  report_generated: 25,
  interaction_logged: 5,
  feedback_given: 15,
  streak_bonus: 5,
  milestone_bonus: 50
};

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, metadata = {} } = await req.json();

    if (!action || !POINT_RULES[action]) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get or create user points record
    let userPoints = await primeos.entities.UserPoints.filter({ 
      user_email: user.email 
    });
    
    if (userPoints.length === 0) {
      userPoints = await primeos.entities.UserPoints.create({
        user_email: user.email,
        total_points: 0,
        lifetime_points: 0,
        current_level: 1,
        points_to_next_level: 100
      });
    } else {
      userPoints = userPoints[0];
    }

    // Calculate points to award
    let pointsToAward = POINT_RULES[action] || 0;
    
    // Apply multiplier for streaks
    if (userPoints.streak_days > 7) pointsToAward *= 1.2;
    if (userPoints.streak_days > 30) pointsToAward *= 1.5;

    // Add metadata bonus if present
    if (metadata.bonus_multiplier) {
      pointsToAward *= metadata.bonus_multiplier;
    }

    pointsToAward = Math.round(pointsToAward);

    // Update points breakdown
    const breakdown = userPoints.points_breakdown || {};
    const actionKey = action.replace('_bonus', '');
    breakdown[actionKey] = (breakdown[actionKey] || 0) + pointsToAward;

    // Calculate new totals
    const newTotalPoints = userPoints.total_points + pointsToAward;
    const newLifetimePoints = userPoints.lifetime_points + pointsToAward;
    const newWeeklyPoints = (userPoints.weekly_points || 0) + pointsToAward;
    const newMonthlyPoints = (userPoints.monthly_points || 0) + pointsToAward;

    // Check level up
    let newLevel = userPoints.current_level;
    let pointsToNextLevel = userPoints.points_to_next_level;
    let leveledUp = false;

    if (newTotalPoints >= pointsToNextLevel) {
      newLevel++;
      pointsToNextLevel = newLevel * 100;
      leveledUp = true;
    }

    // Update user points
    await primeos.entities.UserPoints.update(userPoints.id, {
      total_points: newTotalPoints,
      lifetime_points: newLifetimePoints,
      current_level: newLevel,
      points_to_next_level: pointsToNextLevel,
      weekly_points: newWeeklyPoints,
      monthly_points: newMonthlyPoints,
      points_breakdown: breakdown,
      last_activity_date: new Date().toISOString().split('T')[0]
    });

    return Response.json({ 
      success: true, 
      pointsAwarded: pointsToAward,
      newTotal: newTotalPoints,
      leveledUp,
      newLevel,
      message: `${pointsToAward} pontos conquistados!`
    });

  } catch (error) {
    console.error('Award Points Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
