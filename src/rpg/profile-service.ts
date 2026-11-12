import type { RpgProfileData, RpgProfessionProgress } from './types';
import { RPG_PROFESSIONS } from './data/professions';
import { RPG_REGIONS } from './data/world';
import { RPG_RECIPES } from './data/recipes';
import { addSpecializationXp } from './specializations';

export const CHARACTER_LEVEL_CAP = 100;
export const CHARACTER_XP_BASE = 100;
export function xpForMasteryLevel(level: number): number { const safe=Math.max(0,Math.floor(level)); return 500 + safe * 100 + Math.floor(safe ** 1.15 * 20); }
const MASTERY_TITLES:Record<number,string>={10:'Tecrübe Sahibi',25:'Ustalık Yolcusu',50:'Kadim Usta',75:'Efsanevi Öncü',100:'Nexus Efsanesi',150:'Çağların Bilgesi',200:'Sonsuzluğun İzinde',300:'Dünyanın Hafızası',500:'Yıldızların Ötesinde'};
const MASTERY_COSMETICS:Record<number,string>={100:'Kadim Aura',150:'Yıldız Tozu Efekti',200:'Zamanın Mührü',300:'Kozmik Unvan Çerçevesi',500:'Sonsuzluk Işıltısı'};

export function xpForCharacterLevel(level: number): number {
  const safe = Math.max(1, Math.min(CHARACTER_LEVEL_CAP, Math.floor(level)));
  return 100 + safe * 85 + Math.floor(safe ** 1.35 * 12);
}

export function createRpgProfile(now = Date.now()): RpgProfileData {
  const professions: Record<string, RpgProfessionProgress> = {};
  for (const profession of RPG_PROFESSIONS) {
    professions[profession.id] = {
      level: 1, xp: 0, mastery: 0, masteryXp: 0, unlockedRecipes: RPG_RECIPES.filter(recipe => recipe.profession === profession.id && recipe.requiredLevel <= 1 && !recipe.requiredMastery && !recipe.specialization).map(recipe => recipe.id),
      specializations: Object.fromEntries(profession.specializations.map(branch => [branch.id, { level: 1 as const, xp: 0 }]))
    };
  }
  const firstRegion = RPG_REGIONS.find(region => region.initiallyUnlocked);
  return {
    characterLevel: 1, characterXp: 0, masteryLevel: 0, masteryXp: 0, masteryPoints: 0, masteryTitles: [], masteryCosmetics: [], discoveredAt: now,
    currentRegionId: firstRegion?.id,
    stats: { strength: 5, vitality: 5, agility: 5, intelligence: 5, points: 0 },
    professions, itemInstances: [], injuries: [], pets: [], bossProgress: {}, regions: {}, quests: {},
    equipment: {}, storyFlags: {}, storyChoices: {}, specializationChangeCount: 0, petExpeditions: []
  };
}

export function ensureRpgProfile(profile?: RpgProfileData | null, now = Date.now()): RpgProfileData {
  const base = createRpgProfile(now);
  if (!profile) return base;
  const merged: RpgProfileData = { ...base, ...profile };
  merged.stats = { ...base.stats!, ...(profile.stats || {}) };
  merged.masteryLevel = Number.isSafeInteger(profile.masteryLevel) && (profile.masteryLevel || 0) >= 0 ? profile.masteryLevel : 0;
  merged.masteryXp = Number.isSafeInteger(profile.masteryXp) && (profile.masteryXp || 0) >= 0 ? profile.masteryXp : 0;
  merged.masteryPoints = Number.isSafeInteger(profile.masteryPoints) && (profile.masteryPoints || 0) >= 0 ? profile.masteryPoints : 0;
  merged.masteryTitles = Array.isArray(profile.masteryTitles) ? profile.masteryTitles : [];
  merged.masteryCosmetics = Array.isArray(profile.masteryCosmetics) ? profile.masteryCosmetics : [];
  merged.professions = { ...base.professions, ...(profile.professions || {}) };
  for (const profession of RPG_PROFESSIONS) {
    const current = merged.professions![profession.id];
    const defaults = base.professions![profession.id];
    merged.professions![profession.id] = current ? {
      ...defaults, ...current,
      masteryXp: Number.isSafeInteger(current.masteryXp) && current.masteryXp! >= 0 ? current.masteryXp : 0,
      specializations: { ...defaults.specializations, ...(current.specializations || {}) },
      unlockedRecipes: [...new Set([...(Array.isArray(current.unlockedRecipes) ? current.unlockedRecipes : []), ...defaults.unlockedRecipes])]
    } : defaults;
  }
  merged.itemInstances = Array.isArray(merged.itemInstances) ? merged.itemInstances : [];
  merged.injuries = Array.isArray(merged.injuries) ? merged.injuries : [];
  merged.pets = Array.isArray(merged.pets) ? merged.pets : [];
  merged.regions = merged.regions || {};
  merged.quests = merged.quests || {};
  merged.bossProgress = merged.bossProgress || {};
  merged.equipment = merged.equipment || {};
  merged.storyFlags = merged.storyFlags || {};
  merged.storyChoices = merged.storyChoices || {};
  return merged;
}

export function addCharacterXp(profile: RpgProfileData, amount: number): { gained: number; levels: number; level: number; masteryLevels: number } {
  if (!Number.isSafeInteger(amount) || amount <= 0) return { gained: 0, levels: 0, level: profile.characterLevel || 1, masteryLevels: 0 };
  let level = Math.max(1, Math.min(CHARACTER_LEVEL_CAP, Math.floor(profile.characterLevel || 1)));
  const previousXp = Number.isSafeInteger(profile.characterXp) && (profile.characterXp || 0) >= 0 ? profile.characterXp! : 0;
  if (!Number.isSafeInteger(previousXp + amount)) return { gained: 0, levels: 0, level, masteryLevels: 0 };
  let xp = previousXp + amount;
  profile.stats = { strength: 5, vitality: 5, agility: 5, intelligence: 5, points: 0, ...(profile.stats || {}) };
  if (!Number.isSafeInteger(profile.stats.points) || profile.stats.points < 0) profile.stats.points = 0;
  let levels = 0;
  while (level < CHARACTER_LEVEL_CAP && xp >= xpForCharacterLevel(level)) {
    xp -= xpForCharacterLevel(level++);
    levels++;
  }
  profile.characterLevel = level;
  if (levels) profile.stats!.points += levels * 3;
  let masteryLevels = 0;
  if (level >= CHARACTER_LEVEL_CAP) {
    profile.masteryLevel = Math.max(0, profile.masteryLevel || 0);
    profile.masteryXp = Math.max(0, profile.masteryXp || 0) + xp;
    profile.masteryPoints = Math.max(0, profile.masteryPoints || 0);
    profile.masteryTitles = profile.masteryTitles || [];
    profile.masteryCosmetics = profile.masteryCosmetics || [];
    while (profile.masteryXp >= xpForMasteryLevel(profile.masteryLevel)) {
      profile.masteryXp -= xpForMasteryLevel(profile.masteryLevel);
      profile.masteryLevel++;
      masteryLevels++;
      if (profile.masteryLevel <= 100) profile.masteryPoints++;
      const title=MASTERY_TITLES[profile.masteryLevel];if(title&&!profile.masteryTitles.includes(title))profile.masteryTitles.push(title);
      const cosmetic=MASTERY_COSMETICS[profile.masteryLevel];if(cosmetic&&!profile.masteryCosmetics.includes(cosmetic))profile.masteryCosmetics.push(cosmetic);
    }
    profile.characterXp = 0;
  } else profile.characterXp = xp;
  return { gained: amount, levels, level, masteryLevels };
}

export function addProfessionXp(profile: RpgProfileData, professionId: string, amount: number): { gained: number; levels: number; level: number } | null {
  const definition = RPG_PROFESSIONS.find(item => item.id === professionId);
  const progress = profile.professions?.[professionId];
  if (!definition || !progress || !Number.isSafeInteger(amount) || amount <= 0) return null;
  let levels = 0;
  progress.unlockedRecipes = Array.isArray(progress.unlockedRecipes) ? progress.unlockedRecipes : [];
  if (!Number.isSafeInteger((progress.xp || 0) + amount)) return null;
  progress.xp += amount;
  const threshold = (level: number) => 80 + level * 65 + level * level * 8;
  while (progress.level < definition.maxLevel && progress.xp >= threshold(progress.level)) {
    progress.xp -= threshold(progress.level++);
    levels++;
  }
  if (progress.level >= definition.maxLevel) progress.xp = 0;
  const unlocked = new Set(progress.unlockedRecipes);
  for (const recipe of RPG_RECIPES) {
    if (recipe.profession !== professionId || recipe.requiredLevel > progress.level) continue;
    if (recipe.requiredMastery && recipe.requiredMastery > progress.mastery) continue;
    if (recipe.specialization && profile.mainSpecialization?.professionId === professionId && profile.mainSpecialization.specializationId !== recipe.specialization) continue;
    unlocked.add(recipe.id);
  }
  progress.unlockedRecipes = [...unlocked];
  const masteryGain = Math.max(1, Math.floor(amount * 0.25));
  if (!Number.isSafeInteger((progress.masteryXp || 0) + masteryGain)) return null;
  progress.masteryXp = (progress.masteryXp || 0) + masteryGain;
  while (progress.mastery < 100 && progress.masteryXp >= 250 + progress.mastery * 75) {
    progress.masteryXp -= 250 + progress.mastery * 75;
    progress.mastery++;
  }
  const selected = profile.mainSpecialization;
  if (selected?.professionId === professionId) addSpecializationXp(profile, professionId, selected.specializationId, Math.max(1, Math.floor(amount * 0.5)));
  return { gained: amount, levels, level: progress.level };
}
