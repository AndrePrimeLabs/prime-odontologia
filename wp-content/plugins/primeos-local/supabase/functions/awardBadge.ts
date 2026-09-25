import { createPrimeosClientFromRequest } from './primeosClient.ts';

const BADGES = {
  first_deal: {
    name: "Primeiro Negócio",
    description: "Fechou o primeiro deal",
    icon: "🎯",
    points: 50,
    rarity: "common"
  },
  deal_closer: {
    name: "Closer",
    description: "Fechou 10 deals",
    icon: "🏆",
    points: 100,
    rarity: "rare"
  },
  super_closer: {
    name: "Super Closer",
    description: "Fechou 50 deals",
    icon: "👑",
    points: 250,
    rarity: "epic"
  },
  task_master: {
    name: "Mestre de Tarefas",
    description: "Completou 100 tarefas",
    icon: "✅",
    points: 150,
    rarity: "rare"
  },
  productivity_king: {
    name: "Rei da Produtividade",
    description: "30 dias de atividade consecutiva",
    icon: "⚡",
    points: 200,
    rarity: "epic"
  },
  report_generator: {
    name: "Gerador de Insights",
    description: "Gerou 20 relatórios",
    icon: "📊",
    points: 100,
    rarity: "rare"
  },
  team_player: {
    name: "Jogador de Equipe",
    description: "Deu feedback 50 vezes",
    icon: "🤝",
    points: 75,
    rarity: "common"
  },
  revenue_champion: {
    name: "Campeão de Receita",
    description: "Gerou R$100k em receita",
    icon: "💰",
    points: 300,
    rarity: "legendary"
  },
  engagement_expert: {
    name: "Especialista em Engajamento",
    description: "500+ interações com clientes",
    icon: "💬",
    points: 150,
    rarity: "rare"
  },
  rising_star: {
    name: "Estrela em Ascensão",
    description: "Subiu 3 níveis em 30 dias",
    icon: "⭐",
    points: 200,
    rarity: "epic"
  }
};

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { badgeId, metadata = {} } = await req.json();

    if (!badgeId || !BADGES[badgeId]) {
      return Response.json({ error: 'Invalid badge' }, { status: 400 });
    }

    const badgeConfig = BADGES[badgeId];

    // Check if already earned
    const existingBadges = await primeos.entities.UserBadge.filter({
      user_email: user.email,
      badge_id: badgeId
    });

    if (existingBadges.length > 0) {
      return Response.json({ 
        success: false, 
        message: 'Badge já conquistada' 
      });
    }

    // Award badge
    await primeos.entities.UserBadge.create({
      user_email: user.email,
      badge_id: badgeId,
      badge_name: badgeConfig.name,
      badge_description: badgeConfig.description,
      badge_icon: badgeConfig.icon,
      category: metadata.category || 'milestone',
      earned_date: new Date().toISOString().split('T')[0],
      points_awarded: badgeConfig.points,
      rarity: badgeConfig.rarity,
      progress: 100
    });

    // Award bonus points
    await primeos.functions.invoke('awardPoints', {
      action: 'milestone_bonus',
      metadata: { bonus_multiplier: badgeConfig.points / 50 }
    });

    return Response.json({ 
      success: true, 
      badge: badgeConfig,
      pointsAwarded: badgeConfig.points,
      message: `Parabéns! Conquistou a badge: ${badgeConfig.name} ${badgeConfig.icon}`
    });

  } catch (error) {
    console.error('Award Badge Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
