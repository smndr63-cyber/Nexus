import type { RpgProfileData } from './types';
import { getRpgRecipe } from './data/recipes';
import { getRpgItem } from './data/items';
import { addItem, countItem, removeItem } from './inventory-service';
import { addProfessionXp } from './profile-service';

export type CraftResult = { ok: true; recipeId: string; outputItemId: string; quantity: number; quality: number; professionLevel: number; xpGained: number } | { ok: false; reason: string };
export function craftItem(profile: RpgProfileData, recipeId: string, quantity = 1, random = Math.random): CraftResult {
  const recipe = getRpgRecipe(recipeId);
  if (!recipe) return { ok: false, reason: 'unknown_recipe' };
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20) return { ok: false, reason: 'invalid_quantity' };
  const progress = profile.professions?.[recipe.profession];
  if (!progress) return { ok: false, reason: 'profession_missing' };
  if (progress.level < recipe.requiredLevel) return { ok: false, reason: 'profession_level_low' };
  if (!progress.unlockedRecipes.includes(recipe.id)) return { ok: false, reason: 'recipe_locked' };
  if (recipe.requiredMastery && progress.mastery < recipe.requiredMastery) return { ok: false, reason: 'mastery_low' };
  if (recipe.specialization && (progress.specializations?.[recipe.specialization]?.level || 1) < (recipe.requiredSpecializationLevel || 1)) return { ok: false, reason: 'specialization_level_low' };
  if (recipe.specialization && (profile.mainSpecialization?.professionId !== recipe.profession || profile.mainSpecialization.specializationId !== recipe.specialization)) return { ok: false, reason: 'wrong_specialization' };
  for (const ingredient of recipe.ingredients) if (countItem(profile, ingredient.itemId) < ingredient.quantity * quantity) return { ok: false, reason: `missing:${ingredient.itemId}` };
  const output = getRpgItem(recipe.outputItemId);
  if (!output) return { ok: false, reason: 'invalid_output_item' };
  const removed: { id: string; quantity: number }[] = [];
  for (const ingredient of recipe.ingredients) {
    const amount = ingredient.quantity * quantity;
    const result = removeItem(profile, ingredient.itemId, amount);
    if (!result.ok) { for (const prior of removed) addItem(profile, prior.id, prior.quantity, 'craft_rollback'); return { ok: false, reason: 'ingredient_transaction_failed' }; }
    removed.push({ id: ingredient.itemId, quantity: amount });
  }
  const baseQuality = recipe.baseQuality || 60;
  const skillBonus = Math.min(25, Math.floor(progress.level / 2));
  const quality = Math.max(1, Math.min(100, baseQuality + skillBonus + Math.floor(random() * 16) - (recipe.difficulty || 0)));
  const outputResult = addItem(profile, recipe.outputItemId, recipe.outputQuantity * quantity, `craft:${recipeId}`);
  if (outputResult.ok && !output.stackable) { const created = [...(profile.itemInstances || [])].reverse().find(item => item.definitionId === recipe.outputItemId && item.origin === `craft:${recipeId}`); if (created) { created.quality = quality; if (output.slot) { created.durability = 100; created.maxDurability = 100; } } }
  if (!outputResult.ok) { for (const prior of removed) addItem(profile, prior.id, prior.quantity, 'craft_rollback'); return { ok: false, reason: 'output_add_failed' }; }
  const xpGained = 20 * quantity + Math.max(0, recipe.difficulty || 0) * quantity;
  addProfessionXp(profile, recipe.profession, xpGained);
  progress.statistics = progress.statistics || {};
  progress.statistics.itemsCrafted = (progress.statistics.itemsCrafted || 0) + recipe.outputQuantity * quantity;
  progress.statistics.successfulCrafts = (progress.statistics.successfulCrafts || 0) + quantity;
  return { ok: true, recipeId, outputItemId: recipe.outputItemId, quantity: recipe.outputQuantity * quantity, quality, professionLevel: progress.level, xpGained };
}
