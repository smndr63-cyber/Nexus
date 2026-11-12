import type { RpgRarity, RpgVisualRef } from '../types';

export interface RpgPetSpeciesDefinition {
  id: string;
  name: string;
  description: string;
  rarity: RpgRarity;
  baseStats: {
    attack: number;
    defense: number;
    health: number;
    speed: number;
  };
  skill: {
    id: string;
    name: string;
    description: string;
    cooldown: number;
  };
  passive: {
    id: string;
    name: string;
    description: string;
  };
  preferredFood: string[];
  acquisition: string[];
  visual: RpgVisualRef;
}

export const RPG_PET_SPECIES: RpgPetSpeciesDefinition[] = [
  {
    id: 'kurt',
    name: 'Bozkır Kurdu',
    description: 'Sadık, çevik ve iz sürme konusunda usta bir savaş yoldaşı.',
    rarity: 'common',
    baseStats: { attack: 12, defense: 7, health: 90, speed: 14 },
    skill: {
      id: 'kurt_pencesi',
      name: 'Yırtıcı Sıçrayış',
      description: 'Rakibe güçlü bir sıçrayış saldırısı yapar.',
      cooldown: 3
    },
    passive: {
      id: 'iz_surucu',
      name: 'Keskin İzler',
      description: 'Keşif sırasında nadir kaynak bulma şansına katkı sağlar.'
    },
    preferredFood: ['pet_et', 'pisirilmis_et'],
    acquisition: ['evcillestirme', 'kesif', 'gorev'],
    visual: { image: 'pets/kurt', animation: 'pets/kurt-idle', fallbackImage: 'pets/fallback/kurt', icon: '🐺' }
  },
  {
    id: 'ayi',
    name: 'Dağ Ayısı',
    description: 'Yüksek dayanıklılığıyla sahibini koruyan güçlü bir yoldaş.',
    rarity: 'quality',
    baseStats: { attack: 10, defense: 16, health: 150, speed: 5 },
    skill: {
      id: 'ayi_koruyucu_kukremesi',
      name: 'Koruyucu Kükreme',
      description: 'Sahibinin aldığı hasarı geçici olarak azaltır.',
      cooldown: 4
    },
    passive: {
      id: 'kalin_post',
      name: 'Kalın Post',
      description: 'Sahibine küçük miktarda savunma desteği sağlar.'
    },
    preferredFood: ['pet_et', 'bal', 'pisirilmis_et'],
    acquisition: ['evcillestirme', 'boss_ganiment', 'kesif'],
    visual: { image: 'pets/ayi', animation: 'pets/ayi-idle', fallbackImage: 'pets/fallback/ayi', icon: '🐻' }
  },
  {
    id: 'sahin',
    name: 'Gök Şahini',
    description: 'Hızlı saldırıları ve keskin görüşüyle savaş alanını kontrol eder.',
    rarity: 'rare',
    baseStats: { attack: 15, defense: 5, health: 75, speed: 20 },
    skill: {
      id: 'sahin_isaretleme',
      name: 'Avcı İşareti',
      description: 'Rakibi işaretleyerek sonraki saldırıların isabetini artırır.',
      cooldown: 3
    },
    passive: {
      id: 'yuksekten_bakis',
      name: 'Yüksekten Bakış',
      description: 'Keşifte gizli noktaları fark etme şansına katkı sağlar.'
    },
    preferredFood: ['pet_balik', 'kucuk_av'],
    acquisition: ['evcillestirme', 'yumurta', 'kesif'],
    visual: { image: 'pets/sahin', animation: 'pets/sahin-idle', fallbackImage: 'pets/fallback/sahin', icon: '🦅' }
  },
  {
    id: 'tilki',
    name: 'Kızıl Tilki',
    description: 'Kurnazlığı ve çevikliğiyle tehlikelerden sıyrılan bir yoldaş.',
    rarity: 'rare',
    baseStats: { attack: 11, defense: 7, health: 85, speed: 19 },
    skill: {
      id: 'tilki_savrulma',
      name: 'Çevik Savrulma',
      description: 'Bir sonraki düşman saldırısından kaçınma şansını artırır.',
      cooldown: 3
    },
    passive: {
      id: 'kurnazlik',
      name: 'Kurnazlık',
      description: 'Keşif etkinliklerinde alternatif ödül bulma şansına katkı sağlar.'
    },
    preferredFood: ['pet_et', 'orman_meyvesi'],
    acquisition: ['evcillestirme', 'kesif', 'etkinlik'],
    visual: { image: 'pets/tilki', animation: 'pets/tilki-idle', fallbackImage: 'pets/fallback/tilki', icon: '🦊' }
  },
  {
    id: 'baykus',
    name: 'Kadim Baykuş',
    description: 'Gizemli enerjilerle bağ kurmuş bilge bir gece yoldaşı.',
    rarity: 'epic',
    baseStats: { attack: 17, defense: 8, health: 90, speed: 13 },
    skill: {
      id: 'baykus_gizemli_dalga',
      name: 'Gizemli Dalga',
      description: 'Rakibe büyülü hasar verir ve etkilerini zayıflatabilir.',
      cooldown: 4
    },
    passive: {
      id: 'kadim_bilgelik',
      name: 'Kadim Bilgelik',
      description: 'Sahibinin mana kapasitesine küçük bir katkı sağlar.'
    },
    preferredFood: ['pet_balik', 'buyulu_yem'],
    acquisition: ['nadir_yumurta', 'gorev', 'gizli_bolge'],
    visual: { image: 'pets/baykus', animation: 'pets/baykus-idle', fallbackImage: 'pets/fallback/baykus', icon: '🦉' }
  },
  {
    id: 'kaplumbaga',
    name: 'Kadim Kaplumbağa',
    description: 'Ağır ama son derece dayanıklı kabuğuyla savunmada ustadır.',
    rarity: 'quality',
    baseStats: { attack: 6, defense: 20, health: 170, speed: 3 },
    skill: {
      id: 'kaplumbaga_kabuk',
      name: 'Aşılmaz Kabuk',
      description: 'Kısa süreliğine kendisine gelen hasarı büyük ölçüde azaltır.',
      cooldown: 4
    },
    passive: {
      id: 'dogal_zirh',
      name: 'Doğal Zırh',
      description: 'Sahibine küçük miktarda dayanıklılık desteği sağlar.'
    },
    preferredFood: ['pet_balik', 'orman_meyvesi'],
    acquisition: ['evcillestirme', 'kesif', 'gorev'],
    visual: { image: 'pets/kaplumbaga', animation: 'pets/kaplumbaga-idle', fallbackImage: 'pets/fallback/kaplumbaga', icon: '🐢' }
  },
  {
    id: 'kuzgun',
    name: 'Kara Kuzgun',
    description: 'Gizemli ve zeki bir yoldaş; ganimetlerin izini sürer.',
    rarity: 'epic',
    baseStats: { attack: 13, defense: 7, health: 80, speed: 17 },
    skill: {
      id: 'kuzgun_golge',
      name: 'Gölge Hücumu',
      description: 'Rakibe hızlı saldırır ve kritik vuruş fırsatı yaratır.',
      cooldown: 3
    },
    passive: {
      id: 'ganimet_sezgisi',
      name: 'Ganimet Sezgisi',
      description: 'Keşif ve boss karşılaşmalarında ek ganimet ihtimaline katkı sağlar.'
    },
    preferredFood: ['pet_et', 'pet_balik'],
    acquisition: ['nadir_yumurta', 'boss_ganiment', 'kesif'],
    visual: { image: 'pets/kuzgun', animation: 'pets/kuzgun-idle', fallbackImage: 'pets/fallback/kuzgun', icon: '🐦‍⬛' }
  },
  {
    id: 'ejderha',
    name: 'Kadim Ejderha',
    description: 'Çok nadir bulunan, element gücü taşıyan efsanevi bir savaş yoldaşı.',
    rarity: 'mythic',
    baseStats: { attack: 24, defense: 16, health: 160, speed: 15 },
    skill: {
      id: 'ejderha_element_nefesi',
      name: 'Element Nefesi',
      description: 'Rakiplere güçlü element hasarı verir.',
      cooldown: 5
    },
    passive: {
      id: 'ejderha_kanı',
      name: 'Ejderha Kanı',
      description: 'Sahibine saldırı ve element direnci desteği sağlar.'
    },
    preferredFood: ['buyulu_yem', 'ejderha_yemi'],
    acquisition: ['efsanevi_yumurta', 'dunya_bossu', 'ozel_gorev'],
    visual: { image: 'pets/ejderha', animation: 'pets/ejderha-idle', fallbackImage: 'pets/fallback/ejderha', icon: '🐉' }
  }
];

export function getPetSpecies(id: string): RpgPetSpeciesDefinition | undefined {
  return RPG_PET_SPECIES.find(pet => pet.id === id);
}
