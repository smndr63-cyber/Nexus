import type { RpgVisualRef } from '../types';

export interface RpgRegionUnlockRequirement {
  characterLevel?: number;
  completedQuest?: string;
  discoveredRegion?: string;
  itemId?: string;
  itemQuantity?: number;
  storyFlag?: string;
}

export interface RpgRegionDefinition {
  id: string;
  name: string;
  settlementId: string;
  description: string;
  dangerLevel: number;
  recommendedLevel: number;
  initiallyUnlocked: boolean;
  unlockRequirements: RpgRegionUnlockRequirement[];
  resources: string[];
  creatures: string[];
  professionBossId?: string;
  worldBossIds: string[];
  explorationRewards: string[];
  travelMinutes: number;
  connectedRegions: string[];
  visual: RpgVisualRef;
}

export const RPG_REGIONS: RpgRegionDefinition[] = [
  {
    id: 'baslangic_duzlugu',
    settlementId: 'yol_agzi',
    name: 'Başlangıç Düzlüğü',
    description: 'Yeni maceracıların dünyayı tanıdığı, tehlikesi düşük geniş düzlükler.',
    dangerLevel: 1,
    recommendedLevel: 1,
    initiallyUnlocked: true,
    unlockRequirements: [],
    resources: ['sert_agac', 'sifali_ot', 'yaratik_derisi'],
    creatures: ['bozkir_kurdu', 'yaban_tavsani', 'orman_tilki'],
    worldBossIds: [],
    explorationRewards: ['orman_meyvesi', 'kucuk_av'],
    connectedRegions: ['yesilorman', 'derin_maden'],
    travelMinutes: 0,
    visual: { image: 'regions/baslangic-duzlugu', animation: 'regions/baslangic-duzlugu-ambient', icon: '🌾' }
  },
  {
    id: 'yesilorman',
    settlementId: 'yesil_yurt',
    name: 'Yeşilorman',
    description: 'Kerestecilerin, avcıların ve bitki toplayıcılarının uğrak yeri olan yoğun orman.',
    dangerLevel: 2,
    recommendedLevel: 5,
    initiallyUnlocked: true,
    unlockRequirements: [],
    resources: ['sert_agac', 'recine', 'kadim_lif', 'sifali_ot', 'hurda_metal'],
    creatures: ['orman_kurdu', 'orman_ayi', 'kizil_tilki'],
    professionBossId: 'orman_koruyucusu',
    worldBossIds: [],
    explorationRewards: ['orman_meyvesi', 'pet_et', 'nadir_bitki'],
    connectedRegions: ['baslangic_duzlugu', 'kadim_orman', 'sisli_sahil'],
    travelMinutes: 5,
    visual: { image: 'regions/yesilorman', animation: 'regions/yesilorman-ambient', icon: '🌲' }
  },
  {
    id: 'kadim_orman',
    settlementId: 'kok_sehri',
    name: 'Kadim Orman',
    description: 'Yüzyıllardır dokunulmamış ağaçların ve eski büyülerin hüküm sürdüğü tehlikeli bölge.',
    dangerLevel: 4,
    recommendedLevel: 15,
    initiallyUnlocked: false,
    unlockRequirements: [
      { characterLevel: 15 },
      { completedQuest: 'kadim_orman_izleri' },
      { storyFlag: 'story_orman_ilerledi' }
    ],
    resources: ['kadim_lif', 'buyulu_kristal', 'sifali_ot', 'boss_ozu'],
    creatures: ['kadim_kurt', 'orman_devriyesi', 'zehirli_bitki'],
    worldBossIds: ['kadim_orman_ejderi'],
    explorationRewards: ['kadim_tohum', 'efsanevi_yumurta', 'buyulu_yem'],
    connectedRegions: ['yesilorman', 'derin_maden', 'gizli_magara'],
    travelMinutes: 15,
    visual: { image: 'regions/kadim-orman', animation: 'regions/kadim-orman-ambient', icon: '🌳' }
  },
  {
    id: 'derin_maden',
    settlementId: 'derin_ocak',
    name: 'Derin Maden',
    description: 'Demir, kristal ve değerli taş damarlarıyla dolu, karanlık yer altı tünelleri.',
    dangerLevel: 4,
    recommendedLevel: 20,
    initiallyUnlocked: false,
    unlockRequirements: [
      { characterLevel: 20 },
      { completedQuest: 'madenin_sirri' },
      { storyFlag: 'story_kadim_muhur' }
    ],
    resources: ['demir_cevheri', 'bakir_cevheri', 'nadir_kristal', 'hurda_metal'],
    creatures: ['maden_golemi', 'kristal_orumcegi', 'yer_alti_yirticisi'],
    professionBossId: 'maden_devi',
    worldBossIds: ['demir_yiyen'],
    explorationRewards: ['mekanik_parca', 'gelistirme_cekirdegi', 'nadir_kristal'],
    connectedRegions: ['baslangic_duzlugu', 'kadim_orman', 'gizli_magara'],
    travelMinutes: 20,
    visual: { image: 'regions/derin-maden', animation: 'regions/derin-maden-ambient', icon: '⛏️' }
  },
  {
    id: 'sisli_sahil',
    settlementId: 'sis_limani',
    name: 'Sisli Sahil',
    description: 'Balıkçıların ve deniz kâşiflerinin tehlikeli ama bereketli kıyıları.',
    dangerLevel: 3,
    recommendedLevel: 25,
    initiallyUnlocked: false,
    unlockRequirements: [
      { characterLevel: 12 },
      { completedQuest: 'kayip_deniz_feneri' },
      { storyFlag: 'story_derin_kuyu' }
    ],
    resources: ['deniz_otu', 'inci', 'nadir_kristal'],
    creatures: ['kiyi_yirticisi', 'dev_yengec', 'sisli_deniz_yilani'],
    professionBossId: 'derinlik_avcisi',
    worldBossIds: [],
    explorationRewards: ['pet_balik', 'bal', 'deniz_hazinesi'],
    connectedRegions: ['yesilorman', 'unutulmus_gecit'],
    travelMinutes: 12,
    visual: { image: 'regions/sisli-sahil', animation: 'regions/sisli-sahil-ambient', icon: '🌊' }
  },
  {
    id: 'unutulmus_gecit',
    settlementId: 'muhur_kalesi',
    name: 'Unutulmuş Geçit',
    description: 'Eski uygarlıkların kalıntıları ve gölge yaratıklarıyla dolu gizli geçit.',
    dangerLevel: 6,
    recommendedLevel: 35,
    initiallyUnlocked: false,
    unlockRequirements: [
      { characterLevel: 30 },
      { completedQuest: 'unutulmus_muhur' },
      { discoveredRegion: 'kadim_orman' },
      { storyFlag: 'story_deniz_muhur' }
    ],
    resources: ['buyulu_kristal', 'boss_ozu', 'gelistirme_cekirdegi'],
    creatures: ['golge_savasci', 'lanetli_muhafiz', 'karanlik_avci'],
    worldBossIds: ['golge_hukumdari'],
    explorationRewards: ['buyulu_yem', 'nadir_yumurta', 'kadim_tilsim'],
    connectedRegions: ['sisli_sahil', 'gizli_magara', 'ejderha_tepesi'],
    travelMinutes: 30,
    visual: { image: 'regions/unutulmus-gecit', animation: 'regions/unutulmus-gecit-ambient', icon: '🌑' }
  },
  {
    id: 'ejderha_tepesi',
    settlementId: 'ates_yurdu',
    name: 'Ejderha Tepesi',
    description: 'Ejderha soyunun yaşadığı, ateş ve lavlarla çevrili son derece tehlikeli zirve.',
    dangerLevel: 8,
    recommendedLevel: 55,
    initiallyUnlocked: false,
    unlockRequirements: [
      { characterLevel: 40 },
      { completedQuest: 'ejderha_mirasinin_anahtari' },
      { discoveredRegion: 'unutulmus_gecit' },
      { storyFlag: 'story_ejderha_kalbi' }
    ],
    resources: ['ejderha_pulu', 'ejderha_otu', 'boss_ozu', 'buyulu_kristal'],
    creatures: ['ates_yilani', 'ejderha_yavrusu', 'kadim_ejderha'],
    worldBossIds: ['ejderha_atalari'],
    explorationRewards: ['ejderha_yemi', 'efsanevi_yumurta', 'ejderha_cekirdegi'],
    connectedRegions: ['unutulmus_gecit', 'karanlik_yar'],
    travelMinutes: 45,
    visual: { image: 'regions/ejderha-tepesi', animation: 'regions/ejderha-tepesi-ambient', icon: '🐉' }
  },
  {
    id: 'karanlik_yar',
    settlementId: 'yitik_saray',
    name: 'Karanlık Yâr',
    description: 'Kadim yeminin kırıldığı, gölgelerin toprağa kök saldığı yasak vadi. Burada her adım bir sınavdır.',
    dangerLevel: 7,
    recommendedLevel: 65,
    initiallyUnlocked: false,
    unlockRequirements: [{ characterLevel: 65 }, { completedQuest: 'ejderha_mirasinin_anahtari' }, { discoveredRegion: 'ejderha_tepesi' }, { storyFlag: 'story_ejderha_kalbi' }],
    resources: ['kadim_alasim', 'golge_ozu', 'kadim_rune', 'boss_ozu'],
    creatures: ['karanlik_titan', 'yitik_hukumdar'],
    worldBossIds: ['yitik_kiyamet'],
    explorationRewards: ['nadir_yumurta', 'kadim_rune', 'golge_ozu'],
    connectedRegions: ['gizli_magara', 'ejderha_tepesi'],
    travelMinutes: 45,
    visual: { image: 'regions/karanlik-yar', animation: 'regions/karanlik-yar-ambient', icon: '🌑' }
  },
  {
    id: 'gizli_magara',
    settlementId: 'yitik_siginak',
    name: 'Gizli Mağara',
    description: 'Yalnızca dikkatli kâşiflerin izini bulabildiği, nadir yaratıkların saklandığı mağara.',
    dangerLevel: 5,
    recommendedLevel: 45,
    initiallyUnlocked: false,
    unlockRequirements: [
      { characterLevel: 25 },
      { discoveredRegion: 'yesilorman' },
      { completedQuest: 'kayip_kasifin_gunlugu' },
      { storyFlag: 'story_yitik_yemin' }
    ],
    resources: ['nadir_kristal', 'kadim_lif', 'buyulu_kristal'],
    creatures: ['magara_kuzgunu', 'kristal_yaratik', 'gizli_muhafiz'],
    worldBossIds: [],
    explorationRewards: ['efsanevi_yumurta', 'kadim_tilsim', 'buyulu_yem'],
    connectedRegions: ['kadim_orman', 'derin_maden', 'unutulmus_gecit', 'karanlik_yar'],
    travelMinutes: 25,
    visual: { image: 'regions/gizli-magara', animation: 'regions/gizli-magara-ambient', icon: '🕳️' }
  }
];

export function getRegion(id: string): RpgRegionDefinition | undefined {
  return RPG_REGIONS.find(region => region.id === id);
}

export function getUnlockedRegions(): RpgRegionDefinition[] {
  return RPG_REGIONS.filter(region => region.initiallyUnlocked);
}

export function getRegionsByDanger(dangerLevel: number): RpgRegionDefinition[] {
  return RPG_REGIONS.filter(region => region.dangerLevel === dangerLevel);
}

