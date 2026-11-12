import type { RpgVisualRef } from '../types';

export interface RpgBossReward {
  itemId: string;
  minQuantity: number;
  maxQuantity: number;
  chance: number;
}

export interface RpgProfessionBossTier {
  id: string;
  name: string;
  minProfessionLevel: number;
  minMastery: number;
  levelOffset: number;
  healthMultiplier: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  rewards: RpgBossReward[];
  visual: RpgVisualRef;
}

export interface RpgProfessionBossDefinition {
  id: string;
  professionId: string;
  name: string;
  description: string;
  encounterChance: number;
  repeatProtectionMinutes: number;
  tiers: RpgProfessionBossTier[];
  visual: RpgVisualRef;
}

export interface RpgWorldBossRequirement {
  itemId: string;
  quantity: number;
}

export interface RpgWorldBossDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  regionId: string;
  minCharacterLevel: number;
  minPartySize: number;
  maxPartySize: number;
  summonRequirements: RpgWorldBossRequirement[];
  summonCooldownHours: number;
  health: number;
  attack: number;
  defense: number;
  phases: {
    id: string;
    name: string;
    healthThreshold: number;
    description: string;
  }[];
  rewards: RpgBossReward[];
  visual: RpgVisualRef;
}

// Meslek bossları karakter gelişimine göre üç kademede güçlenir.
// Gerçek savaş değerleri ekipman ve karakter gücüyle birlikte hesaplanacaktır.
export const RPG_PROFESSION_BOSSES: RpgProfessionBossDefinition[] = [
  {
    id: 'orman_koruyucusu',
    professionId: 'ormanci',
    name: 'Ormanın Koruyucusu',
    description: 'Kadim ormanların kaynaklarını koruyan devasa bir yaratık.',
    encounterChance: 5,
    repeatProtectionMinutes: 60,
    tiers: [
      {
        id: 'orman_koruyucusu_genc',
        name: 'Genç Orman Muhafızı',
        minProfessionLevel: 1,
        minMastery: 0,
        levelOffset: 2,
        healthMultiplier: 1,
        attackMultiplier: 1,
        defenseMultiplier: 1,
        rewards: [{ itemId: 'sert_agac', minQuantity: 3, maxQuantity: 6, chance: 100 }],
        visual: { image: 'bosses/orman-koruyucusu/genc', animation: 'bosses/orman-koruyucusu/genc-idle', icon: '🌳' }
      },
      {
        id: 'orman_koruyucusu_kudretli',
        name: 'Kudretli Orman Muhafızı',
        minProfessionLevel: 15,
        minMastery: 25,
        levelOffset: 5,
        healthMultiplier: 2,
        attackMultiplier: 1.6,
        defenseMultiplier: 1.5,
        rewards: [{ itemId: 'kadim_lif', minQuantity: 1, maxQuantity: 2, chance: 45 }],
        visual: { image: 'bosses/orman-koruyucusu/kudretli', animation: 'bosses/orman-koruyucusu/kudretli-idle', icon: '🌲' }
      },
      {
        id: 'orman_koruyucusu_kadim',
        name: 'Kadim Orman Hükümdarı',
        minProfessionLevel: 35,
        minMastery: 70,
        levelOffset: 8,
        healthMultiplier: 3.5,
        attackMultiplier: 2.4,
        defenseMultiplier: 2.2,
        rewards: [{ itemId: 'kadim_lif', minQuantity: 2, maxQuantity: 4, chance: 75 }],
        visual: { image: 'bosses/orman-koruyucusu/kadim', animation: 'bosses/orman-koruyucusu/kadim-idle', icon: '🌳' }
      }
    ],
    visual: { image: 'bosses/orman-koruyucusu', icon: '🌳' }
  },
  {
    id: 'maden_devi',
    professionId: 'madenci',
    name: 'Maden Devi',
    description: 'Derin maden damarlarında yaşayan taş ve metal devi.',
    encounterChance: 5,
    repeatProtectionMinutes: 60,
    tiers: [
      {
        id: 'maden_devi_genc',
        name: 'Taş Muhafız',
        minProfessionLevel: 1,
        minMastery: 0,
        levelOffset: 2,
        healthMultiplier: 1,
        attackMultiplier: 1,
        defenseMultiplier: 1.2,
        rewards: [{ itemId: 'demir_cevheri', minQuantity: 3, maxQuantity: 6, chance: 100 }],
        visual: { image: 'bosses/maden-devi/genc', icon: '🪨' }
      },
      {
        id: 'maden_devi_kudretli',
        name: 'Kristal Muhafızı',
        minProfessionLevel: 15,
        minMastery: 25,
        levelOffset: 5,
        healthMultiplier: 2,
        attackMultiplier: 1.7,
        defenseMultiplier: 2,
        rewards: [{ itemId: 'nadir_kristal', minQuantity: 1, maxQuantity: 2, chance: 45 }],
        visual: { image: 'bosses/maden-devi/kudretli', icon: '💎' }
      },
      {
        id: 'maden_devi_kadim',
        name: 'Kadim Maden Hükümdarı',
        minProfessionLevel: 35,
        minMastery: 70,
        levelOffset: 8,
        healthMultiplier: 4,
        attackMultiplier: 2.5,
        defenseMultiplier: 3,
        rewards: [{ itemId: 'nadir_kristal', minQuantity: 2, maxQuantity: 4, chance: 75 }],
        visual: { image: 'bosses/maden-devi/kadim', icon: '⛰️' }
      }
    ],
    visual: { image: 'bosses/maden-devi', icon: '⛰️' }
  },
  {
    id: 'avci_yirticisi',
    professionId: 'avci',
    name: 'Kadim Yırtıcı',
    description: 'Avcıların izini süren, güçlü ve acımasız bir avcı yaratık.',
    encounterChance: 6,
    repeatProtectionMinutes: 60,
    tiers: [
      {
        id: 'kadim_yirtici_genc',
        name: 'Orman Yırtıcısı',
        minProfessionLevel: 1,
        minMastery: 0,
        levelOffset: 2,
        healthMultiplier: 1,
        attackMultiplier: 1.2,
        defenseMultiplier: 0.9,
        rewards: [{ itemId: 'yaratik_derisi', minQuantity: 2, maxQuantity: 5, chance: 100 }],
        visual: { image: 'bosses/kadim-yirtici/genc', icon: '🐾' }
      },
      {
        id: 'kadim_yirtici_kudretli',
        name: 'Kanlı Pençe',
        minProfessionLevel: 15,
        minMastery: 25,
        levelOffset: 5,
        healthMultiplier: 2,
        attackMultiplier: 2,
        defenseMultiplier: 1.4,
        rewards: [{ itemId: 'pençe', minQuantity: 2, maxQuantity: 4, chance: 65 }],
        visual: { image: 'bosses/kadim-yirtici/kudretli', icon: '🐺' }
      },
      {
        id: 'kadim_yirtici_kadim',
        name: 'Kadim Av Hükümdarı',
        minProfessionLevel: 35,
        minMastery: 70,
        levelOffset: 8,
        healthMultiplier: 3,
        attackMultiplier: 3,
        defenseMultiplier: 2,
        rewards: [{ itemId: 'boss_ozu', minQuantity: 1, maxQuantity: 2, chance: 50 }],
        visual: { image: 'bosses/kadim-yirtici/kadim', icon: '🐺' }
      }
    ],
    visual: { image: 'bosses/kadim-yirtici', icon: '🐺' }
  },
  {
    id: 'simya_hortlagi',
    professionId: 'simyaci',
    name: 'Simya Hortlağı',
    description: 'Başarısız kadim deneylerden doğmuş büyülü bir varlık.',
    encounterChance: 5,
    repeatProtectionMinutes: 60,
    tiers: [
      {
        id: 'simya_hortlagi_genc',
        name: 'Bozulmuş Deney',
        minProfessionLevel: 1,
        minMastery: 0,
        levelOffset: 2,
        healthMultiplier: 1,
        attackMultiplier: 1,
        defenseMultiplier: 0.9,
        rewards: [{ itemId: 'sifali_ot', minQuantity: 2, maxQuantity: 5, chance: 100 }],
        visual: { image: 'bosses/simya-hortlagi/genc', icon: '🧪' }
      },
      {
        id: 'simya_hortlagi_kudretli',
        name: 'Büyülü Hortlak',
        minProfessionLevel: 15,
        minMastery: 25,
        levelOffset: 5,
        healthMultiplier: 2,
        attackMultiplier: 1.8,
        defenseMultiplier: 1.5,
        rewards: [{ itemId: 'simya_ozu', minQuantity: 2, maxQuantity: 4, chance: 65 }],
        visual: { image: 'bosses/simya-hortlagi/kudretli', icon: '🔮' }
      },
      {
        id: 'simya_hortlagi_kadim',
        name: 'Simya Felaketi',
        minProfessionLevel: 35,
        minMastery: 70,
        levelOffset: 8,
        healthMultiplier: 3.5,
        attackMultiplier: 2.5,
        defenseMultiplier: 2,
        rewards: [{ itemId: 'buyulu_kristal', minQuantity: 1, maxQuantity: 3, chance: 70 }],
        visual: { image: 'bosses/simya-hortlagi/kadim', icon: '🧿' }
      }
    ],
    visual: { image: 'bosses/simya-hortlagi', icon: '🧪' }
  },
  {
    id: 'mekanik_dev',
    professionId: 'zanaatkar',
    name: 'Mekanik Dev',
    description: 'Eski uygarlığın savunma düzeneklerinden kalan devasa makine.',
    encounterChance: 5,
    repeatProtectionMinutes: 60,
    tiers: [
      {
        id: 'mekanik_dev_genc',
        name: 'Hurda Muhafızı',
        minProfessionLevel: 1,
        minMastery: 0,
        levelOffset: 2,
        healthMultiplier: 1.2,
        attackMultiplier: 1,
        defenseMultiplier: 1.2,
        rewards: [{ itemId: 'hurda_metal', minQuantity: 3, maxQuantity: 6, chance: 100 }],
        visual: { image: 'bosses/mekanik-dev/genc', icon: '⚙️' }
      },
      {
        id: 'mekanik_dev_kudretli',
        name: 'Savaş Makinesi',
        minProfessionLevel: 15,
        minMastery: 25,
        levelOffset: 5,
        healthMultiplier: 2.5,
        attackMultiplier: 1.8,
        defenseMultiplier: 2,
        rewards: [{ itemId: 'mekanik_parca', minQuantity: 2, maxQuantity: 4, chance: 65 }],
        visual: { image: 'bosses/mekanik-dev/kudretli', icon: '🤖' }
      },
      {
        id: 'mekanik_dev_kadim',
        name: 'Kadim Otomat',
        minProfessionLevel: 35,
        minMastery: 70,
        levelOffset: 8,
        healthMultiplier: 4,
        attackMultiplier: 2.5,
        defenseMultiplier: 3,
        rewards: [{ itemId: 'gelistirme_cekirdegi', minQuantity: 1, maxQuantity: 2, chance: 55 }],
        visual: { image: 'bosses/mekanik-dev/kadim', icon: '⚙️' }
      }
    ],
    visual: { image: 'bosses/mekanik-dev', icon: '⚙️' }
  },
  {
    id: 'celik_yargici',
    professionId: 'demirci',
    name: 'Çelik Yargıcı',
    description: 'Kadim ocakları koruyan, erimiş metalden doğmuş muhafız.',
    encounterChance: 5,
    repeatProtectionMinutes: 60,
    tiers: [
      {
        id: 'celik_yargici_genc',
        name: 'Ocak Bekçisi',
        minProfessionLevel: 1,
        minMastery: 0,
        levelOffset: 2,
        healthMultiplier: 1,
        attackMultiplier: 1.1,
        defenseMultiplier: 1.2,
        rewards: [{ itemId: 'demir_cevheri', minQuantity: 3, maxQuantity: 6, chance: 100 }],
        visual: { image: 'bosses/celik-yargici/genc', icon: '🔥' }
      },
      {
        id: 'celik_yargici_kudretli',
        name: 'Alevli Yargıç',
        minProfessionLevel: 15,
        minMastery: 25,
        levelOffset: 5,
        healthMultiplier: 2,
        attackMultiplier: 2,
        defenseMultiplier: 2,
        rewards: [{ itemId: 'celik_plaka', minQuantity: 1, maxQuantity: 3, chance: 65 }],
        visual: { image: 'bosses/celik-yargici/kudretli', icon: '⚒️' }
      },
      {
        id: 'celik_yargici_kadim',
        name: 'Kadim Çelik Hükümdarı',
        minProfessionLevel: 35,
        minMastery: 70,
        levelOffset: 8,
        healthMultiplier: 3.5,
        attackMultiplier: 2.7,
        defenseMultiplier: 3,
        rewards: [{ itemId: 'boss_ozu', minQuantity: 1, maxQuantity: 3, chance: 60 }],
        visual: { image: 'bosses/celik-yargici/kadim', icon: '🔥' }
      }
    ],
    visual: { image: 'bosses/celik-yargici', icon: '⚒️' }
  },
  {
    id: 'deri_golge',
    professionId: 'derici',
    name: 'Deri Gölgesi',
    description: 'Avcıların geride bıraktığı izlerden doğan çevik yaratık.',
    encounterChance: 5,
    repeatProtectionMinutes: 60,
    tiers: [
      {
        id: 'deri_golge_genc',
        name: 'Orman Postu',
        minProfessionLevel: 1,
        minMastery: 0,
        levelOffset: 2,
        healthMultiplier: 1,
        attackMultiplier: 1,
        defenseMultiplier: 1,
        rewards: [{ itemId: 'yaratik_derisi', minQuantity: 2, maxQuantity: 5, chance: 100 }],
        visual: { image: 'bosses/deri-golge/genc', icon: '🦊' }
      },
      {
        id: 'deri_golge_kudretli',
        name: 'Gölge Avcısı',
        minProfessionLevel: 15,
        minMastery: 25,
        levelOffset: 5,
        healthMultiplier: 2,
        attackMultiplier: 1.8,
        defenseMultiplier: 1.5,
        rewards: [{ itemId: 'pençe', minQuantity: 2, maxQuantity: 4, chance: 65 }],
        visual: { image: 'bosses/deri-golge/kudretli', icon: '🐾' }
      },
      {
        id: 'deri_golge_kadim',
        name: 'Kadim Deri Efendisi',
        minProfessionLevel: 35,
        minMastery: 70,
        levelOffset: 8,
        healthMultiplier: 3,
        attackMultiplier: 2.5,
        defenseMultiplier: 2,
        rewards: [{ itemId: 'kadim_lif', minQuantity: 1, maxQuantity: 3, chance: 60 }],
        visual: { image: 'bosses/deri-golge/kadim', icon: '🐺' }
      }
    ],
    visual: { image: 'bosses/deri-golge', icon: '🐾' }
  },
  {
    id: 'mucevher_gozcusu',
    professionId: 'mucevherci',
    name: 'Mücevher Gözcüsü',
    description: 'Değerli taşların ve kadim tılsımların koruyucusu.',
    encounterChance: 5,
    repeatProtectionMinutes: 60,
    tiers: [
      {
        id: 'mucevher_gozcusu_genc',
        name: 'Kristal Bekçisi',
        minProfessionLevel: 1,
        minMastery: 0,
        levelOffset: 2,
        healthMultiplier: 1,
        attackMultiplier: 1,
        defenseMultiplier: 1,
        rewards: [{ itemId: 'nadir_kristal', minQuantity: 1, maxQuantity: 2, chance: 75 }],
        visual: { image: 'bosses/mucevher-gozcusu/genc', icon: '💎' }
      },
      {
        id: 'mucevher_gozcusu_kudretli',
        name: 'Tılsım Muhafızı',
        minProfessionLevel: 15,
        minMastery: 25,
        levelOffset: 5,
        healthMultiplier: 2,
        attackMultiplier: 1.8,
        defenseMultiplier: 2,
        rewards: [{ itemId: 'buyulu_kristal', minQuantity: 1, maxQuantity: 2, chance: 55 }],
        visual: { image: 'bosses/mucevher-gozcusu/kudretli', icon: '🔮' }
      },
      {
        id: 'mucevher_gozcusu_kadim',
        name: 'Kadim Mücevher Hükümdarı',
        minProfessionLevel: 35,
        minMastery: 70,
        levelOffset: 8,
        healthMultiplier: 3.5,
        attackMultiplier: 2.5,
        defenseMultiplier: 2.5,
        rewards: [{ itemId: 'gelistirme_cekirdegi', minQuantity: 1, maxQuantity: 2, chance: 50 }],
        visual: { image: 'bosses/mucevher-gozcusu/kadim', icon: '💠' }
      }
    ],
    visual: { image: 'bosses/mucevher-gozcusu', icon: '💎' }
  },
  {
    id: 'hasat_yok_edeni',
    professionId: 'ciftci',
    name: 'Hasat Yok Edicisi',
    description: 'Verimli toprakları bozan, köklerden beslenen devasa yaratık.',
    encounterChance: 5,
    repeatProtectionMinutes: 60,
    tiers: [
      {
        id: 'hasat_yok_edeni_genc',
        name: 'Kök Canavarı',
        minProfessionLevel: 1,
        minMastery: 0,
        levelOffset: 2,
        healthMultiplier: 1,
        attackMultiplier: 1,
        defenseMultiplier: 1,
        rewards: [{ itemId: 'sifali_ot', minQuantity: 2, maxQuantity: 5, chance: 100 }],
        visual: { image: 'bosses/hasat-yok-edeni/genc', icon: '🌱' }
      },
      {
        id: 'hasat_yok_edeni_kudretli',
        name: 'Çürümüş Hasat Devi',
        minProfessionLevel: 15,
        minMastery: 25,
        levelOffset: 5,
        healthMultiplier: 2.2,
        attackMultiplier: 1.8,
        defenseMultiplier: 1.7,
        rewards: [{ itemId: 'simya_ozu', minQuantity: 1, maxQuantity: 3, chance: 55 }],
        visual: { image: 'bosses/hasat-yok-edeni/kudretli', icon: '🌾' }
      },
      {
        id: 'hasat_yok_edeni_kadim',
        name: 'Kadim Toprak Felaketi',
        minProfessionLevel: 35,
        minMastery: 70,
        levelOffset: 8,
        healthMultiplier: 3.5,
        attackMultiplier: 2.5,
        defenseMultiplier: 2.5,
        rewards: [{ itemId: 'kadim_lif', minQuantity: 1, maxQuantity: 3, chance: 60 }],
        visual: { image: 'bosses/hasat-yok-edeni/kadim', icon: '🌳' }
      }
    ],
    visual: { image: 'bosses/hasat-yok-edeni', icon: '🌾' }
  },
  {
    id: 'derinlik_avcisi',
    professionId: 'balikci',
    name: 'Derinlik Avcısı',
    description: 'Denizin karanlık katmanlarında yaşayan kadim deniz yaratığı.',
    encounterChance: 5,
    repeatProtectionMinutes: 60,
    tiers: [
      {
        id: 'derinlik_avcisi_genc',
        name: 'Derinlik Yaratığı',
        minProfessionLevel: 1,
        minMastery: 0,
        levelOffset: 2,
        healthMultiplier: 1,
        attackMultiplier: 1,
        defenseMultiplier: 0.9,
        rewards: [{ itemId: 'yaratik_derisi', minQuantity: 1, maxQuantity: 3, chance: 65 }],
        visual: { image: 'bosses/derinlik-avcisi/genc', icon: '🌊' }
      },
      {
        id: 'derinlik_avcisi_kudretli',
        name: 'Deniz Kabusu',
        minProfessionLevel: 15,
        minMastery: 25,
        levelOffset: 5,
        healthMultiplier: 2,
        attackMultiplier: 2,
        defenseMultiplier: 1.5,
        rewards: [{ itemId: 'nadir_kristal', minQuantity: 1, maxQuantity: 3, chance: 55 }],
        visual: { image: 'bosses/derinlik-avcisi/kudretli', icon: '🐙' }
      },
      {
        id: 'derinlik_avcisi_kadim',
        name: 'Kadim Deniz Hükümdarı',
        minProfessionLevel: 35,
        minMastery: 70,
        levelOffset: 8,
        healthMultiplier: 3.5,
        attackMultiplier: 2.7,
        defenseMultiplier: 2,
        rewards: [{ itemId: 'boss_ozu', minQuantity: 1, maxQuantity: 3, chance: 65 }],
        visual: { image: 'bosses/derinlik-avcisi/kadim', icon: '🐉' }
      }
    ],
    visual: { image: 'bosses/derinlik-avcisi', icon: '🌊' }
  },
  {
    id: 'atesli_sofra',
    professionId: 'asci',
    name: 'Ateşli Sofra Muhafızı',
    description: 'Kadim ocakların ateşini koruyan, alevlerden doğmuş yaratık.',
    encounterChance: 5,
    repeatProtectionMinutes: 60,
    tiers: [
      {
        id: 'atesli_sofra_genc',
        name: 'Ocak Ruhu',
        minProfessionLevel: 1,
        minMastery: 0,
        levelOffset: 2,
        healthMultiplier: 1,
        attackMultiplier: 1,
        defenseMultiplier: 1,
        rewards: [{ itemId: 'sifali_ot', minQuantity: 2, maxQuantity: 4, chance: 75 }],
        visual: { image: 'bosses/atesli-sofra/genc', icon: '🔥' }
      },
      {
        id: 'atesli_sofra_kudretli',
        name: 'Alevli Sofra Devi',
        minProfessionLevel: 15,
        minMastery: 25,
        levelOffset: 5,
        healthMultiplier: 2,
        attackMultiplier: 2,
        defenseMultiplier: 1.7,
        rewards: [{ itemId: 'simya_ozu', minQuantity: 1, maxQuantity: 3, chance: 60 }],
        visual: { image: 'bosses/atesli-sofra/kudretli', icon: '🍖' }
      },
      {
        id: 'atesli_sofra_kadim',
        name: 'Kadim Ocak Hükümdarı',
        minProfessionLevel: 35,
        minMastery: 70,
        levelOffset: 8,
        healthMultiplier: 3.5,
        attackMultiplier: 2.7,
        defenseMultiplier: 2.2,
        rewards: [{ itemId: 'boss_ozu', minQuantity: 1, maxQuantity: 2, chance: 50 }],
        visual: { image: 'bosses/atesli-sofra/kadim', icon: '🔥' }
      }
    ],
    visual: { image: 'bosses/atesli-sofra', icon: '🔥' }
  }
];

// Ortak dünya bossları: çağırma malzemeleri, bölge ve grup şartları bulunur.
export const RPG_WORLD_BOSSES: RpgWorldBossDefinition[] = [
  {
    id: 'kadim_orman_ejderi',
    name: 'Kadim Orman Ejderi',
    title: 'Köklerin Son Muhafızı',
    description: 'Ormanın kalbinde uyuyan, kök ve zehir gücünü kullanan dev ejderha.',
    regionId: 'kadim_orman',
    minCharacterLevel: 15,
    minPartySize: 3,
    maxPartySize: 4,
    summonRequirements: [
      { itemId: 'boss_ozu', quantity: 3 },
      { itemId: 'kadim_lif', quantity: 5 }
    ],
    summonCooldownHours: 24,
    health: 18000,
    attack: 220,
    defense: 140,
    phases: [
      { id: 'kokler', name: 'Köklerin Uyanışı', healthThreshold: 70, description: 'Kök saldırılarıyla savaş alanını daraltır.' },
      { id: 'zehir', name: 'Zehirli Fırtına', healthThreshold: 35, description: 'Gruba zehir etkisi uygulamaya başlar.' },
      { id: 'son', name: 'Son Nefes', healthThreshold: 10, description: 'Öfkeye kapılarak saldırı gücünü artırır.' }
    ],
    rewards: [
      { itemId: 'boss_ozu', minQuantity: 2, maxQuantity: 5, chance: 100 },
      { itemId: 'kadim_lif', minQuantity: 2, maxQuantity: 4, chance: 65 }
    ],
    visual: { image: 'world-bosses/kadim-orman-ejderi', animation: 'world-bosses/kadim-orman-ejderi-idle', icon: '🐉' }
  },
  {
    id: 'demir_yiyen',
    name: 'Demir Yiyen',
    title: 'Madenlerin Felaketi',
    description: 'Maden damarlarını tüketen ve metal zırhıyla saldırıları karşılayan dev.',
    regionId: 'derin_maden',
    minCharacterLevel: 20,
    minPartySize: 3,
    maxPartySize: 4,
    summonRequirements: [
      { itemId: 'nadir_kristal', quantity: 5 },
      { itemId: 'mekanik_parca', quantity: 5 }
    ],
    summonCooldownHours: 24,
    health: 24000,
    attack: 260,
    defense: 220,
    phases: [
      { id: 'zirh', name: 'Metal Zırh', healthThreshold: 70, description: 'Savunmasını artırır.' },
      { id: 'ezme', name: 'Maden Çöküşü', healthThreshold: 35, description: 'Gruba alan saldırısı uygular.' },
      { id: 'erime', name: 'Erimiş Öfke', healthThreshold: 10, description: 'Savunmasını azaltıp saldırısını güçlendirir.' }
    ],
    rewards: [
      { itemId: 'boss_ozu', minQuantity: 3, maxQuantity: 6, chance: 100 },
      { itemId: 'gelistirme_cekirdegi', minQuantity: 1, maxQuantity: 2, chance: 35 }
    ],
    visual: { image: 'world-bosses/demir-yiyen', animation: 'world-bosses/demir-yiyen-idle', icon: '⛰️' }
  },
  {
    id: 'golge_hukumdari',
    name: 'Gölge Hükümdarı',
    title: 'Unutulmuş Geçidin Efendisi',
    description: 'Gizli bölgelerde yaşayan, gölge ve yanılsama kullanan kadim hükümdar.',
    regionId: 'unutulmus_gecit',
    minCharacterLevel: 30,
    minPartySize: 4,
    maxPartySize: 4,
    summonRequirements: [
      { itemId: 'buyulu_kristal', quantity: 5 },
      { itemId: 'boss_ozu', quantity: 5 }
    ],
    summonCooldownHours: 48,
    health: 36000,
    attack: 340,
    defense: 240,
    phases: [
      { id: 'yanilsama', name: 'Yanılsama', healthThreshold: 70, description: 'Hedefleri şaşırtan gölge kopyaları oluşturur.' },
      { id: 'karanlik', name: 'Karanlık Bağ', healthThreshold: 35, description: 'Oyuncuların hareketlerini kısıtlar.' },
      { id: 'hukum', name: 'Son Hüküm', healthThreshold: 10, description: 'Çok güçlü tek hedef saldırılarına başlar.' }
    ],
    rewards: [
      { itemId: 'boss_ozu', minQuantity: 4, maxQuantity: 8, chance: 100 },
      { itemId: 'buyulu_kristal', minQuantity: 2, maxQuantity: 5, chance: 70 }
    ],
    visual: { image: 'world-bosses/golge-hukumdari', animation: 'world-bosses/golge-hukumdari-idle', icon: '🌑' }
  },
  {
    id: 'ejderha_atalari',
    name: 'Ejderha Ataları',
    title: 'Kadim Ateşin Son Mirası',
    description: 'Ejderha soyunun en eski temsilcisi; ateş ve yıkım gücünü taşır.',
    regionId: 'ejderha_tepesi',
    minCharacterLevel: 40,
    minPartySize: 4,
    maxPartySize: 4,
    summonRequirements: [
      { itemId: 'boss_ozu', quantity: 10 },
      { itemId: 'buyulu_kristal', quantity: 8 },
      { itemId: 'gelistirme_cekirdegi', quantity: 3 }
    ],
    summonCooldownHours: 72,
    health: 55000,
    attack: 450,
    defense: 320,
    phases: [
      { id: 'ates', name: 'Ateşin Uyanışı', healthThreshold: 70, description: 'Alev saldırılarıyla tüm grubu baskı altına alır.' },
      { id: 'kanat', name: 'Kanatların Gölgesi', healthThreshold: 35, description: 'Geniş alan saldırıları ve savunma kırma kullanır.' },
      { id: 'kiyamet', name: 'Ejderha Kıyameti', healthThreshold: 10, description: 'Son gücünü kullanarak yıkıcı saldırılar gerçekleştirir.' }
    ],
    rewards: [
      { itemId: 'boss_ozu', minQuantity: 8, maxQuantity: 12, chance: 100 },
      { itemId: 'gelistirme_cekirdegi', minQuantity: 2, maxQuantity: 4, chance: 70 },
      { itemId: 'ejderha_kilici', minQuantity: 1, maxQuantity: 1, chance: 5 }
    ],
    visual: { image: 'world-bosses/ejderha-atalari', animation: 'world-bosses/ejderha-atalari-idle', icon: '🐲' }
  }
  ,{
    id: 'yitik_kiyamet', name: 'Yitik Kıyamet', title: 'Karanlık Yâr’ın Son Yemini',
    description: 'Kadim güçlerin dengesini bozan, karanlık vadinin kalbinde mühürlenmiş felaket.',
    regionId: 'karanlik_yar', minCharacterLevel: 60, minPartySize: 4, maxPartySize: 4,
    summonRequirements: [{ itemId: 'nadir_yumurta', quantity: 1 }, { itemId: 'boss_ozu', quantity: 12 }],
    summonCooldownHours: 96, health: 180000, attack: 920, defense: 650,
    phases: [
      { id: 'yemin_kirigi', name: 'Kırık Yemin', healthThreshold: 70, description: 'Karanlık dalgalarıyla grubun savunmasını sınar.' },
      { id: 'son_golge', name: 'Son Gölge', healthThreshold: 35, description: 'Bir oyuncuyu işaretler ve ağır tek hedef saldırısı hazırlar.' },
      { id: 'kiyamet', name: 'Yitik Kıyamet', healthThreshold: 10, description: 'Vadinin bütün karanlığını tek bir yıkıcı saldırıda toplar.' }
    ],
    rewards: [{ itemId: 'boss_ozu', minQuantity: 12, maxQuantity: 20, chance: 100 }, { itemId: 'kadim_rune', minQuantity: 2, maxQuantity: 5, chance: 80 }, { itemId: 'nadir_yumurta', minQuantity: 1, maxQuantity: 1, chance: 12 }],
    visual: { image: 'world-bosses/yitik-kiyamet', animation: 'world-bosses/yitik-kiyamet-battle', icon: '🌑' }
  }

];

export function getProfessionBoss(professionId: string): RpgProfessionBossDefinition | undefined {
  return RPG_PROFESSION_BOSSES.find(boss => boss.professionId === professionId);
}

export function getWorldBoss(id: string): RpgWorldBossDefinition | undefined {
  return RPG_WORLD_BOSSES.find(boss => boss.id === id);
}

export function getProfessionBossTier(
  professionId: string,
  professionLevel: number,
  mastery: number
): RpgProfessionBossTier | undefined {
  const boss = getProfessionBoss(professionId);
  if (!boss) return undefined;

  return [...boss.tiers]
    .filter(tier => professionLevel >= tier.minProfessionLevel && mastery >= tier.minMastery)
    .sort((a, b) => b.minProfessionLevel - a.minProfessionLevel)[0];
}

