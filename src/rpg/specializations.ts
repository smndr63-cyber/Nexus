import type {
  RpgProfileData,
  RpgProfessionProgress,
  RpgSpecializationProgress
} from './types';
import { getProfession } from './data/professions';
import { RPG_RECIPES } from './data/recipes';

export type SpecializationSelectionResult =
  | { ok: true; changed: boolean }
  | {
      ok: false;
      reason: 'unknown_profession' | 'unknown_specialization';
    };

const createProfessionProgress = (): RpgProfessionProgress => ({
  level: 1,
  xp: 0,
  mastery: 0,
  unlockedRecipes: [],
  specializations: {}
});

const createSpecializationProgress = (): RpgSpecializationProgress => ({
  level: 1,
  xp: 0
});

export function getOrCreateProfessionProgress(
  profile: RpgProfileData,
  professionId: string
): RpgProfessionProgress {
  profile.professions ??= {};

  let progress = profile.professions[professionId];

  if (!progress || typeof progress !== 'object') {
    progress = createProfessionProgress();
    profile.professions[professionId] = progress;
  }

  if (!Array.isArray(progress.unlockedRecipes)) {
    progress.unlockedRecipes = [];
  }

  if (
    !progress.specializations ||
    typeof progress.specializations !== 'object' ||
    Array.isArray(progress.specializations)
  ) {
    progress.specializations = {};
  }

  return progress;
}

export function getOrCreateSpecializationProgress(
  professionProgress: RpgProfessionProgress,
  specializationId: string
): RpgSpecializationProgress {
  professionProgress.specializations ??= {};

  let progress = professionProgress.specializations[specializationId];

  if (!progress || typeof progress !== 'object') {
    progress = createSpecializationProgress();
    professionProgress.specializations[specializationId] = progress;
  }

  if (![1, 2, 3].includes(progress.level)) {
    progress.level = 1;
    progress.xp = 0;
  }

  if (!Number.isFinite(progress.xp) || progress.xp < 0) {
    progress.xp = 0;
  }

  return progress;
}

export function getMainSpecialization(profile: RpgProfileData) {
  const selected = profile.mainSpecialization;
  if (!selected) return undefined;

  const profession = getProfession(selected.professionId);
  const specialization = profession?.specializations.find(
    entry => entry.id === selected.specializationId
  );

  if (!profession || !specialization) return undefined;

  return { profession, specialization };
}

export function selectMainSpecialization(
  profile: RpgProfileData,
  professionId: string,
  specializationId: string
): SpecializationSelectionResult {
  const profession = getProfession(professionId);

  if (!profession) {
    return { ok: false, reason: 'unknown_profession' };
  }

  const specialization = profession.specializations.find(
    entry => entry.id === specializationId
  );

  if (!specialization) {
    return { ok: false, reason: 'unknown_specialization' };
  }

  const current = profile.mainSpecialization;

  if (
    current?.professionId === professionId &&
    current.specializationId === specializationId
  ) {
    return { ok: true, changed: false };
  }

  const hadPreviousSelection = Boolean(current);

  // Only the currently selected branch may progress beyond 1/3.
  if (hadPreviousSelection && profile.professions) {
    for (const professionProgress of Object.values(profile.professions)) {
      if (!professionProgress?.specializations) continue;

      for (const progress of Object.values(professionProgress.specializations)) {
        if (progress && progress.level > 1) {
          progress.level = 1;
          progress.xp = 0;
        }
      }
    }
  }

  const professionProgress = getOrCreateProfessionProgress(
    profile,
    professionId
  );

  getOrCreateSpecializationProgress(professionProgress, specializationId);

  profile.mainSpecialization = {
    professionId,
    specializationId
  };

  const unlocked = new Set(professionProgress.unlockedRecipes);
  for (const recipe of RPG_RECIPES) {
    if (recipe.profession !== professionId || recipe.specialization !== specializationId) continue;
    if (professionProgress.level < recipe.requiredLevel) continue;
    if (recipe.requiredMastery && professionProgress.mastery < recipe.requiredMastery) continue;
    if (recipe.requiredSpecializationLevel && (professionProgress.specializations?.[specializationId]?.level || 1) < recipe.requiredSpecializationLevel) continue;
    unlocked.add(recipe.id);
  }
  professionProgress.unlockedRecipes = [...unlocked];

  if (hadPreviousSelection) {
    profile.specializationChangeCount =
      (Number.isSafeInteger(profile.specializationChangeCount) &&
      profile.specializationChangeCount! >= 0
        ? profile.specializationChangeCount!
        : 0) + 1;
  } else {
    profile.specializationChangeCount ??= 0;
  }

  return { ok: true, changed: true };
}

export function addSpecializationXp(
  profile: RpgProfileData,
  professionId: string,
  specializationId: string,
  amount: number
): { gained: number; levels: number; level: 1 | 2 | 3 } | null {
  if (!Number.isSafeInteger(amount) || amount <= 0) return null;
  if (profile.mainSpecialization?.professionId !== professionId || profile.mainSpecialization.specializationId !== specializationId) return null;
  const profession = getProfession(professionId);
  if (!profession?.specializations.some(item => item.id === specializationId)) return null;
  const professionProgress = getOrCreateProfessionProgress(profile, professionId);
  const progress = getOrCreateSpecializationProgress(professionProgress, specializationId);
  progress.xp += amount;
  let levels = 0;
  const threshold = (level: number) => level === 1 ? 250 : 750;
  while (progress.level < 3 && progress.xp >= threshold(progress.level)) {
    progress.xp -= threshold(progress.level);
    progress.level = (progress.level + 1) as 2 | 3;
    levels++;
  }
  if (progress.level === 3) progress.xp = 0;
  return { gained: amount, levels, level: progress.level };
}
