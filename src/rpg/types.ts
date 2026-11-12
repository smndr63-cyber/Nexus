export type RpgRarity =
  | 'common'
  | 'quality'
  | 'rare'
  | 'masterwork'
  | 'epic'
  | 'legendary'
  | 'ancient'
  | 'mythic';

export type RpgItemCategory =
  | 'material'
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'accessory'
  | 'potion'
  | 'food'
  | 'tool'
  | 'ammunition'
  | 'pet_food'
  | 'pet_equipment'
  | 'boss_loot'
  | 'quest_item';

export type RpgEquipmentSlot =
  | 'weapon'
  | 'helmet'
  | 'chest'
  | 'pants'
  | 'gloves'
  | 'boots'
  | 'cloak'
  | 'shield'
  | 'necklace'
  | 'ring'
  | 'belt'
  | 'charm'
  | 'pet_collar'
  | 'pet_armor'
  | 'pet_talisman';

export interface RpgVisualRef {
  image?: string;
  animation?: string;
  fallbackImage?: string;
  icon?: string;
}

export interface RpgItemStats {
  attack?: number;
  defense?: number;
  health?: number;
  mana?: number;
  criticalChance?: number;
  criticalDamage?: number;
  dodgeChance?: number;
  accuracy?: number;
  resistance?: Record<string, number>;
  bonuses?: Record<string, number>;
}

export interface RpgItemDefinition {
  id: string;
  name: string;
  description: string;
  category: RpgItemCategory;
  rarity: RpgRarity;
  tradeable: boolean;
  stackable: boolean;
  maxStack?: number;
  requiredLevel?: number;
  requiredProfession?: string;
  requiredProfessionLevel?: number;
  requiredSpecialization?: string;
  basePrice?: number;
  stats?: RpgItemStats;
  slot?: RpgEquipmentSlot;
  recipeId?: string;
  visual?: RpgVisualRef;
}

export interface RpgItemInstance {
  id: string;
  definitionId: string;
  quantity: number;
  rarity?: RpgRarity;
  quality?: number;
  level?: number;
  durability?: number;
  maxDurability?: number;
  stats?: RpgItemStats;
  bound?: boolean;
  tradeable?: boolean;
  acquiredAt: number;
  origin?: string;
}

export interface RpgSpecializationProgress {
  level: 1 | 2 | 3;
  xp: number;
}

export interface RpgProfessionProgress {
  level: number;
  xp: number;
  mastery: number;
  masteryXp?: number;
  specialization?: string;
  specializations?: Record<string, RpgSpecializationProgress>;
  unlockedRecipes: string[];
  statistics?: {
    itemsGathered?: number;
    itemsCrafted?: number;
    bossesDefeated?: number;
    successfulCrafts?: number;
  };
}

export interface RpgRecipeIngredient {
  itemId: string;
  quantity: number;
}

export interface RpgRecipe {
  id: string;
  name: string;
  profession: string;
  specialization?: string;
  ingredients: RpgRecipeIngredient[];
  outputItemId: string;
  outputQuantity: number;
  requiredLevel: number;
  requiredMastery?: number;
  requiredSpecializationLevel?: 1 | 2 | 3;
  baseQuality?: number;
  difficulty?: number;
  visual?: RpgVisualRef;
}

export interface RpgInjury {
  id: string;
  name: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  startedAt: number;
  expiresAt: number;
  effects: Record<string, number>;
  treatmentItemId?: string;
}

export interface RpgPetSkill {
  id: string;
  level: number;
  unlockedAt: number;
}

export interface RpgPet {
  id: string;
  speciesId: string;
  name: string;
  rarity: RpgRarity;
  level: number;
  xp: number;
  bond: number;
  hunger: number;
  health: number;
  morale: number;
  energy: number;
  temperament?: string;
  skills: RpgPetSkill[];
  equipment: Partial<Record<RpgEquipmentSlot, string>>;
  status: 'active' | 'resting' | 'injured' | 'expedition';
  bound: boolean;
  acquiredAt: number;
  origin?: string;
  visual?: RpgVisualRef;
}

export interface RpgBattleStatus {
  id: string;
  turnsRemaining: number;
  potency: number;
  source?: string;
}

export interface RpgBattleState {
  id: string;
  opponentId: string;
  opponentName: string;
  opponentHealth: number;
  maxOpponentHealth: number;
  playerHealth: number;
  maxPlayerHealth: number;
  turn: number;
  startedAt: number;
  lastActionAt?: number;
  expiresAt?: number;
  statuses: RpgBattleStatus[];
  ownerId: string;
  visual?: RpgVisualRef;
  opponentAttack?: number;
  opponentDefense?: number;
  opponentDefenseBonus?: number;
  professionId?: string;
  bossTierId?: string;
}

export interface RpgBossProgress {
  bossId: string;
  defeatedAt?: number;
  attempts: number;
  lastAttemptAt?: number;
  bestDamage?: number;
  unlocked?: boolean;
}

export interface RpgRegionProgress {
  regionId: string;
  discovered: boolean;
  unlocked: boolean;
  discoveredAt?: number;
  completedQuests: string[];
}

export interface RpgQuestProgress {
  questId: string;
  status: 'available' | 'active' | 'completed' | 'failed';
  progress: Record<string, number>;
  startedAt?: number;
  completedAt?: number;
}

export interface RpgMarketListing {
  id: string;
  sellerId: string;
  item: RpgItemInstance;
  price: number;
  quantity: number;
  createdAt: number;
  expiresAt: number;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
}

export interface RpgPetExpedition {
  id: string;
  petId: string;
  regionId: string;
  startedAt: number;
  completesAt: number;
  status: 'active' | 'completed' | 'claimed';
}

export interface RpgProfileData {
  characterLevel?: number;
  characterXp?: number;
  masteryLevel?: number;
  masteryXp?: number;
  masteryPoints?: number;
  masteryTitles?: string[];
  masteryCosmetics?: string[];
  discoveredAt?: number;
  currentRegionId?: string;
  lastTravelAt?: number;
  stats?: { strength: number; vitality: number; agility: number; intelligence: number; points: number };
  equipment?: Partial<Record<RpgEquipmentSlot, string>>;
  storyFlags?: Record<string, boolean>;
  storyChoices?: Record<string, string>;
  storyEnding?: 'balance' | 'new_oath';
  creatureResearch?: Record<string, { observations:number; kills:number; researched:boolean; lastSeenAt?:number; lastHuntedAt?:number }>;
  professions?: Record<string, RpgProfessionProgress>;
  mainSpecialization?: { professionId: string; specializationId: string };
  specializationChangeCount?: number;
  itemInstances?: RpgItemInstance[];
  injuries?: RpgInjury[];
  pets?: RpgPet[];
  activePetId?: string;
  activeBattle?: RpgBattleState;
  activeWorldBossId?: string;
  bossProgress?: Record<string, RpgBossProgress>;
  regions?: Record<string, RpgRegionProgress>;
  quests?: Record<string, RpgQuestProgress>;
  petExpeditions?: RpgPetExpedition[];
}
