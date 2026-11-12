import type { RpgVisualRef } from '../types';

export type RpgQuestType =
  | 'main'
  | 'profession'
  | 'exploration'
  | 'daily'
  | 'repeatable'
  | 'boss';

export interface RpgQuestObjective {
  id: string;
  description: string;
  type:
    | 'collect'
    | 'craft'
    | 'defeat'
    | 'explore'
    | 'reach_level'
    | 'profession_level'
    | 'mastery'
    | 'discover'
    | 'interact';
  targetId?: string;
  quantity: number;
}

export interface RpgQuestReward {
  coins?: number;
  xp?: number;
  professionXp?: number;
  items?: { itemId: string; quantity: number }[];
  unlockRegion?: string;
  unlockRecipe?: string;
  unlockFeature?: string;
}

export interface RpgQuestDefinition {
  id: string;
  name: string;
  description: string;
  type: RpgQuestType;
  objectives: RpgQuestObjective[];
  prerequisites: string[];
  minimumCharacterLevel?: number;
  professionId?: string;
  minimumProfessionLevel?: number;
  rewards: RpgQuestReward;
  repeatable: boolean;
  cooldownHours?: number;
  visual?: RpgVisualRef;
}

export const RPG_QUESTS: RpgQuestDefinition[] = [
  {
    id: 'ilk_adim',
    name: 'İlk Adım',
    description: 'Yeni dünyayı tanı ve ilk kaynaklarını toplamaya başla.',
    type: 'main',
    objectives: [
      { id: 'collect_wood', description: '5 Sert Ağaç topla', type: 'collect', targetId: 'sert_agac', quantity: 5 },
      { id: 'collect_herb', description: '3 Şifalı Ot topla', type: 'collect', targetId: 'sifali_ot', quantity: 3 }
    ],
    prerequisites: [],
    rewards: { coins: 100, xp: 50, items: [{ itemId: 'orman_meyvesi', quantity: 3 }] },
    repeatable: false,
    visual: { image: 'quests/ilk-adim', icon: '🌱' }
  },
  {
    id: 'orman_yolu',
    name: 'Ormanın Çağrısı',
    description: 'Yeşilorman çevresindeki canlıları tanı ve ormanın kaynaklarını keşfet.',
    type: 'main',
    objectives: [
      { id: 'discover_forest', description: 'Yeşilorman bölgesini keşfet', type: 'discover', targetId: 'yesilorman', quantity: 1 },
      { id: 'collect_resin', description: '5 Reçine topla', type: 'collect', targetId: 'recine', quantity: 5 },
      { id: 'defeat_wolves', description: '3 Orman Kurdu yen', type: 'defeat', targetId: 'orman_kurdu', quantity: 3 }
    ],
    prerequisites: ['ilk_adim'],
    rewards: { coins: 180, xp: 100, items: [{ itemId: 'yaratik_derisi', quantity: 4 }] },
    repeatable: false,
    visual: { image: 'quests/orman-yolu', icon: '🌲' }
  },
  {
    id: 'kadim_orman_izleri',
    name: 'Kadim Ormanın İzleri',
    description: 'Kadim ağaçların ardındaki sırrı araştır. Bu görev Kadim Orman yolunu açar.',
    type: 'main',
    objectives: [
      { id: 'reach_level_15', description: '15. karakter seviyesine ulaş', type: 'reach_level', quantity: 15 },
      { id: 'collect_ancient_fiber', description: '8 Kadim Lif topla', type: 'collect', targetId: 'kadim_lif', quantity: 8 },
      { id: 'defeat_guardian', description: 'Orman Ayısını yen', type: 'defeat', targetId: 'orman_ayi', quantity: 1 }
    ],
    prerequisites: ['orman_yolu'],
    minimumCharacterLevel: 15,
    rewards: { coins: 500, xp: 300, unlockRegion: 'kadim_orman', items: [{ itemId: 'kadim_tilsim', quantity: 1 }] },
    repeatable: false,
    visual: { image: 'quests/kadim-orman-izleri', icon: '🌳' }
  },
  {
    id: 'madenin_sirri',
    name: 'Madenin Sırrı',
    description: 'Derin Madenin girişini bul ve eski maden damarlarını araştır.',
    type: 'main',
    objectives: [
      { id: 'reach_level_20', description: '20. karakter seviyesine ulaş', type: 'reach_level', quantity: 20 },
      { id: 'collect_scrap', description: '5 Hurda Metal topla', type: 'collect', targetId: 'hurda_metal', quantity: 5 },
      { id: 'meet_guide', description: 'Maden Rehberi ile konuş', type: 'interact', targetId: 'maden_rehberi', quantity: 1 }
    ],
    prerequisites: ['kadim_orman_izleri'],
    minimumCharacterLevel: 20,
    rewards: { coins: 750, xp: 450, unlockRegion: 'derin_maden', items: [{ itemId: 'mekanik_parca', quantity: 3 }] },
    repeatable: false,
    visual: { image: 'quests/madenin-sirri', icon: '⛏️' }
  },
  {
    id: 'kayip_deniz_feneri',
    name: 'Kayıp Deniz Feneri',
    description: 'Sisli sahilde kaybolan deniz fenerinin izini sür.',
    type: 'main',
    objectives: [
      { id: 'reach_level_25', description: '25. karakter seviyesine ulaş', type: 'reach_level', quantity: 25 },
      { id: 'collect_resin_for_lighthouse', description: '8 Reçine topla', type: 'collect', targetId: 'recine', quantity: 8 },
      { id: 'meet_sailor', description: 'Denizci Salih ile konuş', type: 'interact', targetId: 'denizci_salih', quantity: 1 }
    ],
    prerequisites: ['orman_yolu'],
    minimumCharacterLevel: 25,
    rewards: { coins: 400, xp: 250, unlockRegion: 'sisli_sahil', items: [{ itemId: 'inci', quantity: 2 }] },
    repeatable: false,
    visual: { image: 'quests/kayip-deniz-feneri', icon: '🌊' }
  },
  {
    id: 'unutulmus_muhur',
    name: 'Unutulmuş Mühür',
    description: 'Eski geçidin mührünü çöz ve gölge yaratıklarının kaynağını araştır.',
    type: 'main',
    objectives: [
      { id: 'reach_level_35', description: '35. karakter seviyesine ulaş', type: 'reach_level', quantity: 35 },
      { id: 'collect_magic', description: '10 Büyülü Kristal topla', type: 'collect', targetId: 'buyulu_kristal', quantity: 10 },
      { id: 'defeat_guard', description: 'Gizli Mağara Muhafızını yen', type: 'defeat', targetId: 'gizli_muhafiz', quantity: 1 }
    ],
    prerequisites: ['kadim_orman_izleri', 'madenin_sirri', 'kayip_kasifin_gunlugu'],
    minimumCharacterLevel: 35,
    rewards: { coins: 1500, xp: 900, unlockRegion: 'unutulmus_gecit', items: [{ itemId: 'kadim_tilsim', quantity: 1 }] },
    repeatable: false,
    visual: { image: 'quests/unutulmus-muhur', icon: '🌑' }
  },
  {
    id: 'ejderha_mirasinin_anahtari',
    name: 'Ejderha Mirasının Anahtarı',
    description: 'Ejderha soyunun yaşadığı zirveye ulaşmak için gereken kadim anahtarı hazırla.',
    type: 'main',
    objectives: [
      { id: 'reach_level_55', description: '55. karakter seviyesine ulaş', type: 'reach_level', quantity: 55 },
      { id: 'collect_scales', description: '10 Büyülü Kristal topla', type: 'collect', targetId: 'buyulu_kristal', quantity: 10 },
      { id: 'defeat_ancient_dragon', description: 'Gölge Savaşçıyı yen', type: 'defeat', targetId: 'golge_savasci', quantity: 1 }
    ],
    prerequisites: ['unutulmus_muhur'],
    minimumCharacterLevel: 55,
    rewards: { coins: 3000, xp: 1800, unlockRegion: 'ejderha_tepesi', items: [{ itemId: 'ejderha_cekirdegi', quantity: 1 }] },
    repeatable: false,
    visual: { image: 'quests/ejderha-mirasinin-anahtari', icon: '🐉' }
  },
  {
    id: 'kayip_kasifin_gunlugu',
    name: 'Kayıp Kâşifin Günlüğü',
    description: 'Yeşilorman çevresinde kaybolan kâşifin günlüğünü bul.',
    type: 'exploration',
    objectives: [
      { id: 'discover_forest_for_cave', description: 'Yeşilormanı keşfet', type: 'discover', targetId: 'yesilorman', quantity: 1 },
      { id: 'find_journal', description: 'Bilge Tomris ile konuşarak günlüğün izini bul', type: 'interact', targetId: 'bilge_tomris', quantity: 1 },
      { id: 'collect_crystal', description: '5 Kadim Lif topla', type: 'collect', targetId: 'kadim_lif', quantity: 5 }
    ],
    prerequisites: ['orman_yolu'],
    minimumCharacterLevel: 25,
    rewards: { coins: 650, xp: 400, unlockRegion: 'gizli_magara', items: [{ itemId: 'efsanevi_yumurta', quantity: 1 }] },
    repeatable: false,
    visual: { image: 'quests/kayip-kasif', icon: '📜' }
  },
  {
    id: 'usta_eller',
    name: 'Usta Eller',
    description: 'Bir meslekte uzmanlaşmanın ilk adımını at.',
    type: 'profession',
    objectives: [
      { id: 'profession_level_10', description: 'Herhangi bir mesleği 10. seviyeye çıkar', type: 'profession_level', quantity: 10 },
      { id: 'craft_5', description: '5 eşya üret', type: 'craft', quantity: 5 }
    ],
    prerequisites: [],
    rewards: { coins: 500, xp: 250, items: [{ itemId: 'gelistirme_cekirdegi', quantity: 2 }] },
    repeatable: false,
    visual: { image: 'quests/usta-eller', icon: '🔨' }
  },
  {
    id: 'ustalik_yolu',
    name: 'Ustalık Yolu',
    description: 'Seçtiğin meslekte ustalığını kanıtla.',
    type: 'profession',
    objectives: [
      { id: 'profession_level_25', description: 'Bir mesleği 25. seviyeye çıkar', type: 'profession_level', quantity: 25 },
      { id: 'mastery_30', description: 'Mesleğinde 30 ustalık kazan', type: 'mastery', quantity: 30 },
      { id: 'craft_masterwork', description: 'En az 1 yüksek kaliteli eşya üret', type: 'craft', targetId: 'masterwork', quantity: 1 }
    ],
    prerequisites: ['usta_eller'],
    rewards: { coins: 1200, xp: 600, items: [{ itemId: 'nadir_kristal', quantity: 5 }] },
    repeatable: false,
    visual: { image: 'quests/ustalik-yolu', icon: '⚒️' }
  },
  {
    id: 'gunluk_toplayici',
    name: 'Günlük Toplayıcı',
    description: 'Dünyanın kaynaklarını toplayarak günlük ihtiyacını karşıla.',
    type: 'daily',
    objectives: [
      { id: 'daily_wood', description: '10 kaynak malzemesi topla', type: 'collect', quantity: 10 }
    ],
    prerequisites: [],
    rewards: { coins: 120, xp: 60 },
    repeatable: true,
    cooldownHours: 24,
    visual: { image: 'quests/gunluk-toplayici', icon: '🧺' }
  },
  {
    id: 'boss_avcisi',
    name: 'Boss Avcısı',
    description: 'Bir boss savaşından zaferle çık.',
    type: 'boss',
    objectives: [
      { id: 'defeat_any_boss', description: 'Bir boss yen', type: 'defeat', quantity: 1 }
    ],
    prerequisites: [],
    rewards: { coins: 350, xp: 200, items: [{ itemId: 'boss_ozu', quantity: 1 }] },
    repeatable: true,
    cooldownHours: 24,
    visual: { image: 'quests/boss-avcisi', icon: '⚔️' }
  }
];

export function getQuest(id: string): RpgQuestDefinition | undefined {
  return RPG_QUESTS.find(quest => quest.id === id);
}

export function getQuestsByType(type: RpgQuestType): RpgQuestDefinition[] {
  return RPG_QUESTS.filter(quest => quest.type === type);
}

export function getAvailableQuestDefinitions(completedQuestIds: string[]): RpgQuestDefinition[] {
  return RPG_QUESTS.filter(quest =>
    !quest.repeatable &&
    !completedQuestIds.includes(quest.id) &&
    quest.prerequisites.every(id => completedQuestIds.includes(id))
  );
}
