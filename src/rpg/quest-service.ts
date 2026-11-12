import type { RpgProfileData, RpgQuestProgress } from './types';
import { RPG_QUESTS, getQuest } from './data/quests';
import { addCharacterXp, addProfessionXp } from './profile-service';
import { getRpgRecipe } from './data/recipes';
import { getCreature } from './data/creatures';
import { addItem } from './inventory-service';

export type QuestResult = { ok: true; questId: string; completed: boolean; rewards?: { coins: number; xp: number; professionXp: number } } | { ok: false; reason: string };
export function availableQuests(profile: RpgProfileData) {
  return RPG_QUESTS.filter(q => q.prerequisites.every(id => profile.quests?.[id]?.status === 'completed') &&
    (profile.characterLevel || 1) >= (q.minimumCharacterLevel || 1) &&
    (!q.professionId || (profile.professions?.[q.professionId]?.level || 1) >= (q.minimumProfessionLevel || 1)) &&
    (q.repeatable || profile.quests?.[q.id]?.status !== 'completed'));
}
export function startQuest(profile: RpgProfileData, questId: string, now = Date.now()): QuestResult {
  const quest = getQuest(questId);
  if (!quest) return { ok: false, reason: 'unknown_quest' };
  if (!availableQuests(profile).some(item => item.id === questId)) return { ok: false, reason: 'quest_locked_or_completed' };
  const previous = profile.quests?.[questId];
  if (previous?.status === 'active') return { ok: false, reason: 'already_active' };
  if (previous?.completedAt && quest.repeatable && quest.cooldownHours && now - previous.completedAt < quest.cooldownHours * 3_600_000) return { ok: false, reason: 'cooldown' };
  profile.quests = profile.quests || {};
  profile.quests[questId] = { questId, status: 'active', progress: Object.fromEntries(quest.objectives.map(o => [o.id, 0])), startedAt: now };
  return { ok: true, questId, completed: false };
}
export function advanceQuest(profile: RpgProfileData, questId: string, objectiveType: string, targetId?: string, amount = 1, now = Date.now()): QuestResult {
  const quest = getQuest(questId);
  const progress = profile.quests?.[questId];
  if (!quest || !progress || progress.status !== 'active') return { ok: false, reason: 'quest_not_active' };
  if (!Number.isSafeInteger(amount) || amount <= 0) return { ok: false, reason: 'invalid_progress' };
  for (const objective of quest.objectives) {
    if (objective.type !== objectiveType || (objective.targetId && objective.targetId !== targetId)) continue;
    if (quest.type === 'boss' && objective.type === 'defeat') {
      const isBossEvent = !!targetId && (targetId.startsWith('boss:') || getCreature(targetId)?.role !== 'normal' && !!getCreature(targetId));
      if (!isBossEvent) continue;
    }
    progress.progress[objective.id] = Math.min(objective.quantity, (progress.progress[objective.id] || 0) + amount);
  }
  const complete = quest.objectives.every(o => (progress.progress[o.id] || 0) >= o.quantity);
  if (!complete) return { ok: true, questId, completed: false };
  progress.status = 'completed'; progress.completedAt = now;
  const rewards = quest.rewards;
  if (rewards.items) for (const item of rewards.items) addItem(profile, item.itemId, item.quantity, `quest:${questId}`, now);
  if (rewards.xp) addCharacterXp(profile, rewards.xp);
  if (rewards.unlockRegion) {
    profile.regions = profile.regions || {};
    const old = profile.regions[rewards.unlockRegion] || { regionId: rewards.unlockRegion, discovered: false, unlocked: false, completedQuests: [] };
    profile.regions[rewards.unlockRegion] = { ...old, unlocked: true, completedQuests: [...new Set([...old.completedQuests, questId])] };
  }
  if (rewards.unlockRecipe && profile.professions) { const recipe = getRpgRecipe(rewards.unlockRecipe); const profession = recipe?.profession ? profile.professions[recipe.profession] : undefined; if (profession && !profession.unlockedRecipes.includes(rewards.unlockRecipe)) profession.unlockedRecipes.push(rewards.unlockRecipe); }
  if (rewards.professionXp && quest.professionId) addProfessionXp(profile, quest.professionId, rewards.professionXp);
  return { ok: true, questId, completed: true, rewards: { coins: rewards.coins || 0, xp: rewards.xp || 0, professionXp: rewards.professionXp || 0 } };
}
export function getQuestProgress(profile: RpgProfileData): (RpgQuestProgress & { name: string; description: string })[] {
  return Object.values(profile.quests || {}).map(p => { const q = getQuest(p.questId); return { ...p, name: q?.name || p.questId, description: q?.description || '' }; });
}

export function syncQuestMilestones(profile: RpgProfileData, now = Date.now()): QuestResult[] {
  const results: QuestResult[] = [];
  const professionLevels = Object.values(profile.professions || {}).map(p => p.level || 1);
  const professionLevel = professionLevels.length ? Math.max(...professionLevels) : 1;
  const mastery = Math.max(0, ...Object.values(profile.professions || {}).map(p => p.mastery || 0));
  for (const [questId, progress] of Object.entries(profile.quests || {})) {
    if (progress.status !== 'active') continue;
    for (const objective of getQuest(questId)?.objectives || []) {
      let amount = 0;
      if (objective.type === 'reach_level') amount = profile.characterLevel || 1;
      else if (objective.type === 'profession_level') amount = objective.targetId ? (profile.professions?.[objective.targetId]?.level || 1) : professionLevel;
      else if (objective.type === 'mastery') amount = objective.targetId ? (profile.professions?.[objective.targetId]?.mastery || 0) : mastery;
      if (amount > (progress.progress[objective.id] || 0)) {
        const result = advanceQuest(profile, questId, objective.type, objective.targetId, amount - (progress.progress[objective.id] || 0), now);
        if (result.ok && result.completed) results.push(result);
        break;
      }
    }
  }
  return results;
}
