import type { RpgVisualRef } from '../types';

export type RpgCreatureRole = 'normal' | 'elite' | 'mini_boss' | 'world_boss';

export interface RpgCreatureDrop {
  itemId: string;
  minQuantity: number;
  maxQuantity: number;
  chance: number;
}

export interface RpgCreatureDefinition {
  id: string;
  name: string;
  description: string;
  regionIds: string[];
  role: RpgCreatureRole;
  level: number;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  experience: number;
  coinsMin: number;
  coinsMax: number;
  aggression: number;
  abilities: string[];
  drops: RpgCreatureDrop[];
  visual: RpgVisualRef;
}

export const RPG_CREATURES: Record<string, RpgCreatureDefinition> = {
  bozkir_kurdu: {
    id: 'bozkir_kurdu',
    name: 'Bozkır Kurdu',
    description: 'Düzlüklerde sürüler hâlinde dolaşan çevik bir avcı.',
    regionIds: ['baslangic_duzlugu'],
    role: 'normal',
    level: 1,
    health: 45,
    attack: 7,
    defense: 2,
    speed: 8,
    experience: 12,
    coinsMin: 2,
    coinsMax: 6,
    aggression: 35,
    abilities: ['hizli_isirik'],
    drops: [
      { itemId: 'yaratik_derisi', minQuantity: 1, maxQuantity: 2, chance: 65 },
      { itemId: 'pet_et', minQuantity: 1, maxQuantity: 1, chance: 25 }
    ],
    visual: { image: 'creatures/bozkir-kurdu', animation: 'creatures/bozkir-kurdu-idle', icon: '🐺' }
  },
  yaban_tavsani: {
    id: 'yaban_tavsani',
    name: 'Yaban Tavşanı',
    description: 'Genellikle kaçmayı tercih eden zararsız bir otçul.',
    regionIds: ['baslangic_duzlugu'],
    role: 'normal',
    level: 1,
    health: 20,
    attack: 2,
    defense: 1,
    speed: 12,
    experience: 5,
    coinsMin: 0,
    coinsMax: 2,
    aggression: 5,
    abilities: ['ani_kacis'],
    drops: [
      { itemId: 'kucuk_av', minQuantity: 1, maxQuantity: 2, chance: 70 },
      { itemId: 'pet_et', minQuantity: 1, maxQuantity: 1, chance: 35 }
    ],
    visual: { image: 'creatures/yaban-tavsani', animation: 'creatures/yaban-tavsani-idle', icon: '🐇' }
  },
  orman_tilki: {
    id: 'orman_tilki',
    name: 'Orman Tilkisi',
    description: 'Hızlı hareket eden, fırsat bulduğunda saldıran kurnaz bir avcı.',
    regionIds: ['baslangic_duzlugu'],
    role: 'normal',
    level: 2,
    health: 35,
    attack: 6,
    defense: 2,
    speed: 11,
    experience: 10,
    coinsMin: 1,
    coinsMax: 5,
    aggression: 20,
    abilities: ['kurnaz_saldiri', 'ani_kacis'],
    drops: [
      { itemId: 'yaratik_derisi', minQuantity: 1, maxQuantity: 2, chance: 45 },
      { itemId: 'kucuk_av', minQuantity: 1, maxQuantity: 1, chance: 30 }
    ],
    visual: { image: 'creatures/orman-tilkisi', animation: 'creatures/orman-tilkisi-idle', icon: '🦊' }
  },
  orman_kurdu: {
    id: 'orman_kurdu',
    name: 'Orman Kurdu',
    description: 'Yeşilormanı koruyan, bozkır kurtlarından daha güçlü bir avcı.',
    regionIds: ['yesilorman'],
    role: 'normal',
    level: 5,
    health: 95,
    attack: 14,
    defense: 5,
    speed: 10,
    experience: 28,
    coinsMin: 5,
    coinsMax: 12,
    aggression: 55,
    abilities: ['surü_saldirisi', 'hizli_isirik'],
    drops: [
      { itemId: 'yaratik_derisi', minQuantity: 1, maxQuantity: 3, chance: 75 },
      { itemId: 'pençe', minQuantity: 1, maxQuantity: 2, chance: 45 },
      { itemId: 'pet_et', minQuantity: 1, maxQuantity: 2, chance: 30 }
    ],
    visual: { image: 'creatures/orman-kurdu', animation: 'creatures/orman-kurdu-idle', icon: '🐺' }
  },
  orman_ayi: {
    id: 'orman_ayi',
    name: 'Orman Ayısı',
    description: 'Yüksek dayanıklılığı ve güçlü pençeleriyle bilinen iri bir yaratık.',
    regionIds: ['yesilorman'],
    role: 'elite',
    level: 8,
    health: 220,
    attack: 23,
    defense: 13,
    speed: 4,
    experience: 65,
    coinsMin: 10,
    coinsMax: 22,
    aggression: 65,
    abilities: ['agir_pence', 'korkutucu_kukreme'],
    drops: [
      { itemId: 'yaratik_derisi', minQuantity: 2, maxQuantity: 4, chance: 85 },
      { itemId: 'pet_et', minQuantity: 2, maxQuantity: 3, chance: 65 }
    ],
    visual: { image: 'creatures/orman-ayisi', animation: 'creatures/orman-ayisi-idle', icon: '🐻' }
  },
  kizil_tilki: {
    id: 'kizil_tilki',
    name: 'Kızıl Tilki',
    description: 'Rakibinin açıklarını kollayan çevik bir orman yaratığı.',
    regionIds: ['yesilorman'],
    role: 'normal',
    level: 7,
    health: 105,
    attack: 19,
    defense: 6,
    speed: 15,
    experience: 38,
    coinsMin: 6,
    coinsMax: 15,
    aggression: 30,
    abilities: ['kurnaz_saldiri', 'golge_adim'],
    drops: [
      { itemId: 'yaratik_derisi', minQuantity: 1, maxQuantity: 2, chance: 60 },
      { itemId: 'orman_meyvesi', minQuantity: 1, maxQuantity: 2, chance: 30 }
    ],
    visual: { image: 'creatures/kizil-tilki', animation: 'creatures/kizil-tilki-idle', icon: '🦊' }
  },
  kadim_kurt: {
    id: 'kadim_kurt',
    name: 'Kadim Kurt',
    description: 'Kadim Ormanın büyüsüyle güçlenmiş yaşlı bir kurt.',
    regionIds: ['kadim_orman'],
    role: 'elite',
    level: 18,
    health: 520,
    attack: 48,
    defense: 24,
    speed: 17,
    experience: 180,
    coinsMin: 20,
    coinsMax: 45,
    aggression: 70,
    abilities: ['kadim_isirik', 'surü_cagrisi'],
    drops: [
      { itemId: 'kadim_lif', minQuantity: 1, maxQuantity: 3, chance: 55 },
      { itemId: 'pençe', minQuantity: 2, maxQuantity: 4, chance: 80 },
      { itemId: 'boss_ozu', minQuantity: 1, maxQuantity: 1, chance: 8 }
    ],
    visual: { image: 'creatures/kadim-kurt', animation: 'creatures/kadim-kurt-idle', icon: '🐺' }
  },
  orman_devriyesi: {
    id: 'orman_devriyesi',
    name: 'Kadim Orman Muhafızı',
    description: 'Kadim ağaçların çevresini koruyan büyülü bir muhafız.',
    regionIds: ['kadim_orman'],
    role: 'mini_boss',
    level: 20,
    health: 950,
    attack: 58,
    defense: 38,
    speed: 7,
    experience: 320,
    coinsMin: 35,
    coinsMax: 70,
    aggression: 85,
    abilities: ['kok_kapanı', 'doga_patlamasi'],
    drops: [
      { itemId: 'kadim_lif', minQuantity: 2, maxQuantity: 5, chance: 90 },
      { itemId: 'buyulu_kristal', minQuantity: 1, maxQuantity: 2, chance: 45 },
      { itemId: 'boss_ozu', minQuantity: 1, maxQuantity: 2, chance: 30 }
    ],
    visual: { image: 'creatures/orman-muhafizi', animation: 'creatures/orman-muhafizi-battle', icon: '🌳' }
  },
  zehirli_bitki: {
    id: 'zehirli_bitki',
    name: 'Zehirli Bitki',
    description: 'Yaklaşan canlılara zehirli dikenleriyle saldıran hareketli bir bitki.',
    regionIds: ['kadim_orman'],
    role: 'normal',
    level: 16,
    health: 260,
    attack: 42,
    defense: 18,
    speed: 3,
    experience: 100,
    coinsMin: 12,
    coinsMax: 28,
    aggression: 50,
    abilities: ['zehirli_diken', 'zehir_bulutu'],
    drops: [
      { itemId: 'sifali_ot', minQuantity: 1, maxQuantity: 3, chance: 70 },
      { itemId: 'kadim_lif', minQuantity: 1, maxQuantity: 2, chance: 35 }
    ],
    visual: { image: 'creatures/zehirli-bitki', animation: 'creatures/zehirli-bitki-idle', icon: '🌿' }
  },
  maden_golemi: {
    id: 'maden_golemi',
    name: 'Maden Golemi',
    description: 'Maden damarlarını koruyan ağır ve dayanıklı taş yaratığı.',
    regionIds: ['derin_maden'],
    role: 'elite',
    level: 22,
    health: 850,
    attack: 62,
    defense: 55,
    speed: 3,
    experience: 260,
    coinsMin: 30,
    coinsMax: 65,
    aggression: 75,
    abilities: ['tas_yumruk', 'yer_sarsintisi'],
    drops: [
      { itemId: 'demir_cevheri', minQuantity: 2, maxQuantity: 5, chance: 85 },
      { itemId: 'hurda_metal', minQuantity: 1, maxQuantity: 4, chance: 65 },
      { itemId: 'nadir_kristal', minQuantity: 1, maxQuantity: 2, chance: 20 }
    ],
    visual: { image: 'creatures/maden-golemi', animation: 'creatures/maden-golemi-battle', icon: '🪨' }
  },
  kristal_orumcegi: {
    id: 'kristal_orumcegi',
    name: 'Kristal Örümceği',
    description: 'Kristal mağaralarında ağ ören zehirli bir yaratık.',
    regionIds: ['derin_maden'],
    role: 'normal',
    level: 21,
    health: 390,
    attack: 54,
    defense: 22,
    speed: 13,
    experience: 155,
    coinsMin: 15,
    coinsMax: 35,
    aggression: 60,
    abilities: ['zehirli_ag', 'hizli_isirik'],
    drops: [
      { itemId: 'nadir_kristal', minQuantity: 1, maxQuantity: 2, chance: 35 },
      { itemId: 'yaratik_derisi', minQuantity: 1, maxQuantity: 2, chance: 50 }
    ],
    visual: { image: 'creatures/kristal-orumcegi', animation: 'creatures/kristal-orumcegi-idle', icon: '🕷️' }
  },
  yer_alti_yirticisi: {
    id: 'yer_alti_yirticisi',
    name: 'Yer Altı Yırtıcısı',
    description: 'Karanlık tünellerde avını takip eden hızlı bir yırtıcı.',
    regionIds: ['derin_maden'],
    role: 'normal',
    level: 24,
    health: 460,
    attack: 68,
    defense: 25,
    speed: 16,
    experience: 190,
    coinsMin: 20,
    coinsMax: 42,
    aggression: 80,
    abilities: ['pusudan_saldiri', 'kanama'],
    drops: [
      { itemId: 'yaratik_derisi', minQuantity: 2, maxQuantity: 3, chance: 70 },
      { itemId: 'pençe', minQuantity: 1, maxQuantity: 3, chance: 60 }
    ],
    visual: { image: 'creatures/yer-alti-yirticisi', animation: 'creatures/yer-alti-yirticisi-idle', icon: '🦂' }
  },
  kiyi_yirticisi: {
    id: 'kiyi_yirticisi',
    name: 'Kıyı Yırtıcısı',
    description: 'Sisli kıyılarda avlanan saldırgan bir deniz canlısı.',
    regionIds: ['sisli_sahil'],
    role: 'normal',
    level: 14,
    health: 310,
    attack: 39,
    defense: 17,
    speed: 12,
    experience: 110,
    coinsMin: 12,
    coinsMax: 25,
    aggression: 65,
    abilities: ['su_sicramasi', 'keskin_dis'],
    drops: [
      { itemId: 'deniz_otu', minQuantity: 1, maxQuantity: 3, chance: 65 },
      { itemId: 'pet_balik', minQuantity: 1, maxQuantity: 1, chance: 25 }
    ],
    visual: { image: 'creatures/kiyi-yirticisi', animation: 'creatures/kiyi-yirticisi-idle', icon: '🦈' }
  },
  dev_yengec: {
    id: 'dev_yengec',
    name: 'Dev Yengeç',
    description: 'Kalın kabuğu sayesinde darbeleri kolayca karşılayan sahil yaratığı.',
    regionIds: ['sisli_sahil'],
    role: 'elite',
    level: 16,
    health: 620,
    attack: 38,
    defense: 48,
    speed: 4,
    experience: 190,
    coinsMin: 18,
    coinsMax: 40,
    aggression: 45,
    abilities: ['kiskaç_darbesi', 'kabuk_savunmasi'],
    drops: [
      { itemId: 'deniz_otu', minQuantity: 2, maxQuantity: 4, chance: 80 },
      { itemId: 'inci', minQuantity: 1, maxQuantity: 2, chance: 20 }
    ],
    visual: { image: 'creatures/dev-yengec', animation: 'creatures/dev-yengec-battle', icon: '🦀' }
  },
  sisli_deniz_yilani: {
    id: 'sisli_deniz_yilani',
    name: 'Sisli Deniz Yılanı',
    description: 'Sahildeki sislerin arasında gizlenen zehirli bir deniz canavarı.',
    regionIds: ['sisli_sahil'],
    role: 'mini_boss',
    level: 19,
    health: 1100,
    attack: 72,
    defense: 35,
    speed: 14,
    experience: 420,
    coinsMin: 45,
    coinsMax: 90,
    aggression: 90,
    abilities: ['zehirli_dalga', 'bogucu_sarmal'],
    drops: [
      { itemId: 'inci', minQuantity: 1, maxQuantity: 3, chance: 60 },
      { itemId: 'deniz_hazinesi', minQuantity: 1, maxQuantity: 1, chance: 15 },
      { itemId: 'boss_ozu', minQuantity: 1, maxQuantity: 2, chance: 35 }
    ],
    visual: { image: 'creatures/sisli-deniz-yilani', animation: 'creatures/sisli-deniz-yilani-battle', icon: '🐍' }
  },
  golge_savasci: {
    id: 'golge_savasci',
    name: 'Gölge Savaşçı',
    description: 'Unutulmuş geçidin karanlığında dolaşan çevik bir savaşçı.',
    regionIds: ['unutulmus_gecit'],
    role: 'normal',
    level: 32,
    health: 720,
    attack: 105,
    defense: 48,
    speed: 18,
    experience: 300,
    coinsMin: 35,
    coinsMax: 65,
    aggression: 80,
    abilities: ['golge_kesisi', 'karanlik_adim'],
    drops: [
      { itemId: 'buyulu_kristal', minQuantity: 1, maxQuantity: 3, chance: 65 },
      { itemId: 'boss_ozu', minQuantity: 1, maxQuantity: 1, chance: 12 }
    ],
    visual: { image: 'creatures/golge-savascisi', animation: 'creatures/golge-savascisi-idle', icon: '🌑' }
  },
  lanetli_muhafiz: {
    id: 'lanetli_muhafiz',
    name: 'Lanetli Muhafız',
    description: 'Eski mührü koruyan, lanetle güçlendirilmiş zırhlı muhafız.',
    regionIds: ['unutulmus_gecit'],
    role: 'mini_boss',
    level: 35,
    health: 1800,
    attack: 125,
    defense: 85,
    speed: 6,
    experience: 650,
    coinsMin: 70,
    coinsMax: 130,
    aggression: 90,
    abilities: ['lanetli_darbe', 'karanlik_kalkan', 'ruh_emisi'],
    drops: [
      { itemId: 'boss_ozu', minQuantity: 1, maxQuantity: 3, chance: 70 },
      { itemId: 'kadim_tilsim', minQuantity: 1, maxQuantity: 1, chance: 18 },
      { itemId: 'buyulu_kristal', minQuantity: 2, maxQuantity: 4, chance: 80 }
    ],
    visual: { image: 'creatures/lanetli-muhafiz', animation: 'creatures/lanetli-muhafiz-battle', icon: '🛡️' }
  },
  karanlik_avci: {
    id: 'karanlik_avci',
    name: 'Karanlık Avcı',
    description: 'Görünmeden yaklaşan ve zayıf noktaları hedefleyen tehlikeli avcı.',
    regionIds: ['unutulmus_gecit'],
    role: 'elite',
    level: 33,
    health: 950,
    attack: 138,
    defense: 42,
    speed: 20,
    experience: 430,
    coinsMin: 45,
    coinsMax: 90,
    aggression: 75,
    abilities: ['golge_ok', 'zayif_nokta'],
    drops: [
      { itemId: 'yaratik_derisi', minQuantity: 2, maxQuantity: 4, chance: 65 },
      { itemId: 'buyulu_kristal', minQuantity: 1, maxQuantity: 2, chance: 45 }
    ],
    visual: { image: 'creatures/karanlik-avci', animation: 'creatures/karanlik-avci-idle', icon: '🏹' }
  },
  ates_yilani: {
    id: 'ates_yilani',
    name: 'Ateş Yılanı',
    description: 'Lav çatlaklarında yaşayan, ateş püskürten yırtıcı.',
    regionIds: ['ejderha_tepesi'],
    role: 'elite',
    level: 42,
    health: 1900,
    attack: 185,
    defense: 90,
    speed: 16,
    experience: 850,
    coinsMin: 100,
    coinsMax: 180,
    aggression: 90,
    abilities: ['ates_puskurtme', 'yanma'],
    drops: [
      { itemId: 'ejderha_otu', minQuantity: 1, maxQuantity: 3, chance: 65 },
      { itemId: 'ejderha_pulu', minQuantity: 1, maxQuantity: 2, chance: 30 }
    ],
    visual: { image: 'creatures/ates-yilani', animation: 'creatures/ates-yilani-battle', icon: '🔥' }
  },
  ejderha_yavrusu: {
    id: 'ejderha_yavrusu',
    name: 'Ejderha Yavrusu',
    description: 'Henüz tam büyümemiş olsa da tehlikeli bir ejderha.',
    regionIds: ['ejderha_tepesi'],
    role: 'elite',
    level: 45,
    health: 2400,
    attack: 210,
    defense: 105,
    speed: 14,
    experience: 1100,
    coinsMin: 130,
    coinsMax: 220,
    aggression: 85,
    abilities: ['kor_atesi', 'kanat_darbesi'],
    drops: [
      { itemId: 'ejderha_pulu', minQuantity: 1, maxQuantity: 3, chance: 75 },
      { itemId: 'ejderha_cekirdegi', minQuantity: 1, maxQuantity: 1, chance: 8 },
      { itemId: 'pet_et', minQuantity: 1, maxQuantity: 2, chance: 35 }
    ],
    visual: { image: 'creatures/ejderha-yavrusu', animation: 'creatures/ejderha-yavrusu-idle', icon: '🐉' }
  },
  kadim_ejderha: {
    id: 'kadim_ejderha',
    name: 'Kadim Ejderha',
    description: 'Ejderha soyunun kadim temsilcisi; zirvenin en tehlikeli yaratıklarından biri.',
    regionIds: ['ejderha_tepesi'],
    role: 'mini_boss',
    level: 48,
    health: 6500,
    attack: 290,
    defense: 165,
    speed: 12,
    experience: 2500,
    coinsMin: 250,
    coinsMax: 450,
    aggression: 100,
    abilities: ['kadim_ates', 'ejderha_kukremesi', 'alev_firtinasi'],
    drops: [
      { itemId: 'ejderha_pulu', minQuantity: 3, maxQuantity: 6, chance: 100 },
      { itemId: 'ejderha_cekirdegi', minQuantity: 1, maxQuantity: 2, chance: 35 },
      { itemId: 'boss_ozu', minQuantity: 2, maxQuantity: 5, chance: 100 }
    ],
    visual: { image: 'creatures/kadim-ejderha', animation: 'creatures/kadim-ejderha-battle', icon: '🐉' }
  },
  magara_kuzgunu: {
    id: 'magara_kuzgunu',
    name: 'Mağara Kuzgunu',
    description: 'Mağaraların karanlığında parlayan eşyaları toplayan zeki bir kuş.',
    regionIds: ['gizli_magara'],
    role: 'normal',
    level: 27,
    health: 540,
    attack: 78,
    defense: 32,
    speed: 19,
    experience: 240,
    coinsMin: 25,
    coinsMax: 55,
    aggression: 35,
    abilities: ['keskin_gaga', 'ganimet_sezgisi'],
    drops: [
      { itemId: 'nadir_kristal', minQuantity: 1, maxQuantity: 2, chance: 45 },
      { itemId: 'buyulu_kristal', minQuantity: 1, maxQuantity: 1, chance: 20 }
    ],
    visual: { image: 'creatures/magara-kuzgunu', animation: 'creatures/magara-kuzgunu-idle', icon: '🐦‍⬛' }
  },
  kristal_yaratik: {
    id: 'kristal_yaratik',
    name: 'Kristal Yaratık',
    description: 'Vücudu sert kristallerle kaplı, büyü enerjisiyle beslenen yaratık.',
    regionIds: ['gizli_magara'],
    role: 'elite',
    level: 29,
    health: 1050,
    attack: 92,
    defense: 88,
    speed: 5,
    experience: 440,
    coinsMin: 45,
    coinsMax: 90,
    aggression: 65,
    abilities: ['kristal_diken', 'enerji_patlamasi'],
    drops: [
      { itemId: 'nadir_kristal', minQuantity: 2, maxQuantity: 4, chance: 85 },
      { itemId: 'buyulu_kristal', minQuantity: 1, maxQuantity: 3, chance: 45 }
    ],
    visual: { image: 'creatures/kristal-yaratik', animation: 'creatures/kristal-yaratik-idle', icon: '💎' }
  },
  gizli_muhafiz: {
    id: 'gizli_muhafiz',
    name: 'Gizli Muhafız',
    description: 'Gizli mağaranın en derin bölümünü koruyan eski bir nöbetçi.',
    regionIds: ['gizli_magara'],
    role: 'mini_boss',
    level: 31,
    health: 1650,
    attack: 118,
    defense: 95,
    speed: 8,
    experience: 700,
    coinsMin: 65,
    coinsMax: 120,
    aggression: 85,
    abilities: ['muhafiz_darbesi', 'tas_kabuk'],
    drops: [
      { itemId: 'kadim_tilsim', minQuantity: 1, maxQuantity: 1, chance: 20 },
      { itemId: 'efsanevi_yumurta', minQuantity: 1, maxQuantity: 1, chance: 5 },
      { itemId: 'boss_ozu', minQuantity: 1, maxQuantity: 2, chance: 45 }
    ],
    visual: { image: 'creatures/gizli-muhafiz', animation: 'creatures/gizli-muhafiz-battle', icon: '🗿' }
  }
  ,karanlik_titan: {
    id: 'karanlik_titan', name: 'Karanlık Titan', description: 'Karanlık Yâr’ın taşlaşmış özünden doğan devasa bir muhafız.',
    regionIds: ['karanlik_yar'], role: 'elite', level: 62, health: 6800, attack: 310, defense: 260, speed: 7,
    experience: 4200, coinsMin: 450, coinsMax: 700, aggression: 95, abilities: ['golge_dalgasi','tas_kabuk'],
    drops: [{ itemId: 'kadim_alasim', minQuantity: 1, maxQuantity: 2, chance: 45 }, { itemId: 'boss_ozu', minQuantity: 2, maxQuantity: 4, chance: 65 }],
    visual: { image: 'creatures/karanlik-titan', animation: 'creatures/karanlik-titan-battle', icon: '🗿' }
  },
  yitik_hukumdar: {
    id: 'yitik_hukumdar', name: 'Yitik Hükümdar', description: 'Adı tarihten silinmiş bir hükümdarın gölgelerle geri dönen sureti.',
    regionIds: ['karanlik_yar'], role: 'mini_boss', level: 68, health: 12500, attack: 390, defense: 320, speed: 12,
    experience: 8500, coinsMin: 900, coinsMax: 1400, aggression: 100, abilities: ['hukum_darbesi','golge_dalgasi','ruh_baglari'],
    drops: [{ itemId: 'nadir_yumurta', minQuantity: 1, maxQuantity: 1, chance: 8 }, { itemId: 'kadim_rune', minQuantity: 1, maxQuantity: 2, chance: 35 }, { itemId: 'boss_ozu', minQuantity: 3, maxQuantity: 5, chance: 75 }],
    visual: { image: 'creatures/yitik-hukumdar', animation: 'creatures/yitik-hukumdar-battle', icon: '👑' }
  }

};

export function getCreature(id: string): RpgCreatureDefinition | undefined {
  return RPG_CREATURES[id];
}

export function getCreaturesByRegion(regionId: string): RpgCreatureDefinition[] {
  return Object.values(RPG_CREATURES).filter(creature =>
    creature.regionIds.includes(regionId)
  );
}

export function getCreaturesByRole(role: RpgCreatureRole): RpgCreatureDefinition[] {
  return Object.values(RPG_CREATURES).filter(creature => creature.role === role);
}
