import type { RpgItemDefinition } from '../types';

export const RPG_ITEMS: Record<string, RpgItemDefinition> = {
  sert_agac: {
    id: 'sert_agac', name: 'Sert Ağaç',
    description: 'Dayanıklı silah sapları, yaylar ve yapı parçaları için kullanılan kaliteli kereste.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 38
  },
  recine: {
    id: 'recine', name: 'Reçine',
    description: 'Ahşap parçaları birleştirmek ve ekipmanları güçlendirmek için kullanılır.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 24
  },
  kadim_lif: {
    id: 'kadim_lif', name: 'Kadim Lif',
    description: 'Nadir kumaşların, büyülü bağların ve yüksek seviye ekipmanların üretiminde kullanılır.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 145
  },
  demir_cevheri: {
    id: 'demir_cevheri', name: 'Demir Cevheri',
    description: 'Demir külçeleri, silahlar ve ağır zırhlar için temel maden.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 42
  },
  bakir_cevheri: {
    id: 'bakir_cevheri', name: 'Bakır Cevheri',
    description: 'Alaşımlar, mekanik parçalar ve başlangıç seviyesi ekipmanlar için kullanılır.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 30
  },
  nadir_kristal: {
    id: 'nadir_kristal', name: 'Nadir Kristal',
    description: 'Büyülü ekipmanlar, tılsımlar ve ileri seviye üretim için değerli kristal.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 180
  },
  yaratik_derisi: {
    id: 'yaratik_derisi', name: 'Yaratık Derisi',
    description: 'İşlenerek zırh, çanta ve pet ekipmanına dönüştürülebilen ham deri.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 55
  },
  'pençe': {
    id: 'pençe', name: 'Yaratık Pençesi',
    description: 'Avcılık ganimeti; hançerler, tılsımlar ve savaş ekipmanlarında kullanılır.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 48
  },
  boss_ozu: {
    id: 'boss_ozu', name: 'Boss Özü',
    description: 'Güçlü bosslardan elde edilen, özel üretimlerde kullanılan yoğun enerji özü.',
    category: 'boss_loot', rarity: 'epic', tradeable: true, stackable: true, maxStack: 999, basePrice: 450
  },
  sifali_ot: {
    id: 'sifali_ot', name: 'Şifalı Ot',
    description: 'İksir, merhem ve yaralanma tedavisi üretiminde kullanılan bitki.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 28
  },
  simya_ozu: {
    id: 'simya_ozu', name: 'Simya Özü',
    description: 'İksirlerin ve büyülü karışımların etkisini güçlendiren simya hammaddesi.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 72
  },
  buyulu_kristal: {
    id: 'buyulu_kristal', name: 'Büyülü Kristal',
    description: 'Büyülü silahlar, pet tılsımları ve özel üretimler için kullanılan kristal.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 210
  },
  hurda_metal: {
    id: 'hurda_metal', name: 'Hurda Metal',
    description: 'Geri dönüştürülerek mekanik parça ve metal alaşımı üretiminde kullanılır.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 22
  },
  mekanik_parca: {
    id: 'mekanik_parca', name: 'Mekanik Parça',
    description: 'Araçlar, geliştirmeler ve karmaşık üretim düzenekleri için kullanılır.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 58
  },
  gelistirme_cekirdegi: {
    id: 'gelistirme_cekirdegi', name: 'Geliştirme Çekirdeği',
    description: 'Üst düzey ekipman geliştirmelerinde kullanılan yoğunlaştırılmış çekirdek.',
    category: 'material', rarity: 'epic', tradeable: true, stackable: true, maxStack: 999, basePrice: 260
  },
  celik_plaka: {
    id: 'celik_plaka', name: 'Çelik Plaka',
    description: 'Gelişmiş silah ve zırh parçalarında kullanılan işlenmiş metal.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 110
  },
  'yay_kirişi': {
    id: 'yay_kirişi', name: 'Yay Kirişi',
    description: 'Yay ve mekanik fırlatıcıların üretiminde kullanılan dayanıklı kiriş.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 85
  },
  ok_demeti: {
    id: 'ok_demeti', name: 'Ok Demeti',
    description: 'Avcı yayları için kullanılan temel mühimmat.',
    category: 'ammunition', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 35
  },
  mana_iksiri: {
    id: 'mana_iksiri', name: 'Mana İksiri',
    description: 'Savaş sırasında mana yenilemek için kullanılan iksir.',
    category: 'potion', rarity: 'common', tradeable: true, stackable: true, maxStack: 99, basePrice: 90
  },

  demir_kilic: {
    id: 'demir_kilic', name: 'Demir Kılıç',
    description: 'Yeni savaşçılar için dengeli, güvenilir bir demir kılıç.',
    category: 'weapon', rarity: 'common', tradeable: true, stackable: false, basePrice: 700,
    stats: { attack: 18 }, slot: 'weapon'
  },
  avci_yayi: {
    id: 'avci_yayi', name: 'Avcı Yayı',
    description: 'Hafif ve dengeli yapısıyla uzak mesafeden saldırmayı sağlar.',
    category: 'weapon', rarity: 'rare', tradeable: true, stackable: false, basePrice: 1800,
    stats: { attack: 25, accuracy: 3 }, slot: 'weapon'
  },
  celik_balti: {
    id: 'celik_balti', name: 'Çelik Balta',
    description: 'Ağır darbeler için tasarlanmış güçlü bir çelik balta.',
    category: 'weapon', rarity: 'rare', tradeable: true, stackable: false, basePrice: 2100,
    stats: { attack: 32 }, slot: 'weapon'
  },
  kemik_hancer: {
    id: 'kemik_hancer', name: 'Kemik Hançer',
    description: 'Hızlı saldırılar ve kritik vuruşlar için hafif bir hançer.',
    category: 'weapon', rarity: 'rare', tradeable: true, stackable: false, basePrice: 1600,
    stats: { attack: 21, criticalChance: 2 }, slot: 'weapon'
  },
  kristal_asa: {
    id: 'kristal_asa', name: 'Kristal Asa',
    description: 'Simya enerjisiyle güçlendirilmiş, büyülü saldırılara uygun asa.',
    category: 'weapon', rarity: 'epic', tradeable: true, stackable: false, basePrice: 4200,
    stats: { attack: 38, mana: 12 }, slot: 'weapon'
  },
  kadim_mizrak: {
    id: 'kadim_mizrak', name: 'Kadim Mızrak',
    description: 'Kadim liflerle güçlendirilmiş, uzun erişimli savaş mızrağı.',
    category: 'weapon', rarity: 'epic', tradeable: true, stackable: false, basePrice: 3900,
    stats: { attack: 35, accuracy: 2 }, slot: 'weapon'
  },
  ejderha_kilici: {
    id: 'ejderha_kilici', name: 'Ejderha Dişi Kılıcı',
    description: 'Ejderha bosslarından elde edilebilen eşsiz bir ganimet. Normal üretim tarifi yoktur.',
    category: 'weapon', rarity: 'legendary', tradeable: true, stackable: false, basePrice: 12000,
    stats: { attack: 58 }, slot: 'weapon'
  },

  deri_zirh: {
    id: 'deri_zirh', name: 'Deri Zırh',
    description: 'Hareket kabiliyetini fazla kısıtlamayan temel deri zırh.',
    category: 'armor', rarity: 'common', tradeable: true, stackable: false, basePrice: 600,
    stats: { defense: 8 }, slot: 'chest'
  },
  celik_zirh: {
    id: 'celik_zirh', name: 'Çelik Zırh',
    description: 'Ağır darbeleri karşılamak için üretilmiş sağlam çelik zırh.',
    category: 'armor', rarity: 'rare', tradeable: true, stackable: false, basePrice: 2400,
    stats: { defense: 22 }, slot: 'chest'
  },
  ahsap_kalkan: {
    id: 'ahsap_kalkan', name: 'Ahşap Kalkan',
    description: 'Başlangıç seviyesinde savunma sağlayan dayanıklı ahşap kalkan.',
    category: 'shield', rarity: 'common', tradeable: true, stackable: false, basePrice: 450,
    stats: { defense: 7 }, slot: 'shield'
  },
  celik_kalkan: {
    id: 'celik_kalkan', name: 'Çelik Kalkan',
    description: 'Güçlü darbeleri karşılayabilen ağır çelik kalkan.',
    category: 'shield', rarity: 'rare', tradeable: true, stackable: false, basePrice: 1700,
    stats: { defense: 18 }, slot: 'shield'
  },
  avci_basligi: {
    id: 'avci_basligi', name: 'Avcı Başlığı',
    description: 'Avcılar için üretilmiş, hafif koruma sağlayan başlık.',
    category: 'armor', rarity: 'common', tradeable: true, stackable: false, basePrice: 500,
    stats: { defense: 5 }, slot: 'helmet'
  },
  gezgin_cizmesi: {
    id: 'gezgin_cizmesi', name: 'Gezgin Çizmesi',
    description: 'Uzun yolculuklarda koruma ve hareket kolaylığı sağlayan çizme.',
    category: 'armor', rarity: 'common', tradeable: true, stackable: false, basePrice: 400,
    stats: { defense: 4 }, slot: 'boots'
  },

  komur: {
    id: 'komur', name: 'Kömür',
    description: 'Maden ocaklarında bulunan, cevherleri eritmek için kullanılan yakıt.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 18
  },
  altin_cevheri: {
    id: 'altin_cevheri', name: 'Altın Cevheri',
    description: 'Mücevher ve değerli alaşımların üretiminde kullanılan altın cevheri.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 125
  },
  gumus_cevheri: {
    id: 'gumus_cevheri', name: 'Gümüş Cevheri',
    description: 'Takı, tılsım ve özel alaşımların hammaddesi.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 85
  },
  kadim_agac: {
    id: 'kadim_agac', name: 'Kadim Ağaç',
    description: 'Kadim ormanlardan elde edilen, büyülü ekipman yapımına uygun kereste.',
    category: 'material', rarity: 'epic', tradeable: true, stackable: true, maxStack: 999, basePrice: 260
  },
  kadim_tohum: {
    id: 'kadim_tohum', name: 'Kadim Tohum',
    description: 'Nadir bitkiler ve özel tarım ürünleri yetiştirmek için kullanılan tohum.',
    category: 'material', rarity: 'epic', tradeable: true, stackable: true, maxStack: 999, basePrice: 220
  },
  ahsap_parca: {
    id: 'ahsap_parca', name: 'Ahşap Parça',
    description: 'Basit araçlar, mekanik düzenekler ve ekipman sapları için işlenmiş ahşap.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 32
  },
  islenmemis_deri: {
    id: 'islenmemis_deri', name: 'İşlenmemiş Deri',
    description: 'Av hayvanlarından elde edilen, henüz tabaklanmamış deri.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 42
  },
  islenmis_deri: {
    id: 'islenmis_deri', name: 'İşlenmiş Deri',
    description: 'Zırh, çanta ve evcil hayvan ekipmanı üretiminde kullanılan dayanıklı deri.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 105
  },
  iplik: {
    id: 'iplik', name: 'İplik',
    description: 'Kumaş, çanta, sadak ve hafif zırh üretiminde kullanılan iplik.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 28
  },
  keten: {
    id: 'keten', name: 'Keten',
    description: 'Kumaş ve seyahat ekipmanları üretiminde kullanılan bitkisel lif.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 24
  },
  pamuk: {
    id: 'pamuk', name: 'Pamuk',
    description: 'İplik ve hafif kumaş üretiminde kullanılan tarım ürünü.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 22
  },
  boynuz: {
    id: 'boynuz', name: 'Yaratık Boynuzu',
    description: 'Silah kabzaları, tılsımlar ve av ekipmanlarında kullanılan sert ganimet.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 75
  },
  kemik: {
    id: 'kemik', name: 'Sağlam Kemik',
    description: 'Kemik silahlar, hançerler ve çeşitli av araçları için hammadde.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 38
  },
  kurk: {
    id: 'kurk', name: 'Yaratık Kürkü',
    description: 'Soğuk bölgelerde kullanılan giysiler ve pet yatakları için malzeme.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 48
  },
  av_malzemesi: {
    id: 'av_malzemesi', name: 'Av Malzemesi',
    description: 'Avcılıkta kullanılan temel işlenmiş yardımcı malzeme.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 30
  },
  nadir_ot: {
    id: 'nadir_ot', name: 'Nadir Ot',
    description: 'Güçlü iksirler ve özel tedavi karışımları için kullanılan bitki.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 115
  },
  nadir_bitki: {
    id: 'nadir_bitki', name: 'Nadir Bitki',
    description: 'Simya ve özel yetiştirme tariflerinde kullanılan ender bitki.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 130
  },
  deniz_otu: {
    id: 'deniz_otu', name: 'Deniz Otu',
    description: 'Deniz iksirleri ve balıkçı ürünlerinde kullanılan kıyı bitkisi.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 42
  },
  inci: {
    id: 'inci', name: 'İnci',
    description: 'Mücevher, deniz tılsımı ve değerli takı üretiminde kullanılan ganimet.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 190
  },
  deniz_kabugu: {
    id: 'deniz_kabugu', name: 'Deniz Kabuğu',
    description: 'Deniz süsleri, takılar ve bazı simya tariflerinde kullanılan kabuk.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 35
  },
  deniz_pulu: {
    id: 'deniz_pulu', name: 'Deniz Yaratığı Pulu',
    description: 'Suya dayanıklı ekipman ve deniz tılsımlarında kullanılan nadir pul.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 145
  },
  ejderha_pulu: {
    id: 'ejderha_pulu', name: 'Ejderha Pulu',
    description: 'Ejderha zırhları ve efsanevi ekipmanlar için kullanılan güçlü ganimet.',
    category: 'boss_loot', rarity: 'legendary', tradeable: true, stackable: true, maxStack: 999, basePrice: 850
  },
  ejderha_otu: {
    id: 'ejderha_otu', name: 'Ejderha Otu',
    description: 'Ejderha Tepesi çevresinde yetişen, ateşe dayanıklı nadir bitki.',
    category: 'material', rarity: 'epic', tradeable: true, stackable: true, maxStack: 999, basePrice: 320
  },
  yaratik_cekirdegi: {
    id: 'yaratik_cekirdegi', name: 'Yaratık Çekirdeği',
    description: 'Güçlü yaratıkların özünden elde edilen üretim bileşeni.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 175
  },

  metal_kulce: {
    id: 'metal_kulce', name: 'Metal Külçe',
    description: 'Demir ve bakır gibi madenlerin eritilmesiyle elde edilen temel üretim metali.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 95
  },
  celik_kulce: {
    id: 'celik_kulce', name: 'Çelik Külçe',
    description: 'Metal külçe ve kömürün ileri işlemlerinden elde edilen dayanıklı alaşım.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 180
  },
  altin_kulce: {
    id: 'altin_kulce', name: 'Altın Külçe',
    description: 'Altın cevherinin eritilmesiyle elde edilen değerli üretim metali.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 310
  },
  gumus_kulce: {
    id: 'gumus_kulce', name: 'Gümüş Külçe',
    description: 'Gümüş cevherinden elde edilen, mücevher ve tılsım üretiminde kullanılan metal.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 210
  },
  bitki_yagi: {
    id: 'bitki_yagi', name: 'Bitki Yağı',
    description: 'Bitkilerden çıkarılan, simya karışımları ve bakım ürünlerinde kullanılan yağ.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 55
  },
  silah_yagi: {
    id: 'silah_yagi', name: 'Silah Bakım Yağı',
    description: 'Silahların bakımında ve özel üretim işlemlerinde kullanılan karışım.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 125
  },
  deniz_yagi: {
    id: 'deniz_yagi', name: 'Deniz Yağı',
    description: 'Deniz canlılarından elde edilen, suya dayanıklı ürünlerde kullanılan özel yağ.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 145
  },
  mekanik_duzenek: {
    id: 'mekanik_duzenek', name: 'Mekanik Düzenek',
    description: 'Mekanik araçlar, tuzaklar ve gelişmiş üretim istasyonları için hassas parça.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 190
  },
  guclendirme_parcasi: {
    id: 'guclendirme_parcasi', name: 'Güçlendirme Parçası',
    description: 'Ekipman geliştirme ve dayanıklılık artırma işlemlerinde kullanılan parça.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 230
  },
  kristal: {
    id: 'kristal', name: 'İşlenmiş Kristal',
    description: 'Ham kristallerin işlenmesiyle elde edilen, büyülü üretimlerde kullanılan bileşen.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 205
  },
  degerli_tas: {
    id: 'degerli_tas', name: 'Değerli Taş',
    description: 'Mücevher, yüzük ve özel tılsım üretiminde kullanılan değerli taş.',
    category: 'material', rarity: 'epic', tradeable: true, stackable: true, maxStack: 999, basePrice: 340
  },
  rune: {
    id: 'rune', name: 'Kadim Rune',
    description: 'Büyülü ekipmanlara özel güçler kazandırmak için kullanılan kadim işaret taşı.',
    category: 'material', rarity: 'epic', tradeable: true, stackable: true, maxStack: 999, basePrice: 420
  },

  bugday: {
    id: 'bugday', name: 'Buğday',
    description: 'Un ve temel yemek tariflerinde kullanılan tarım ürünü.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 20
  },
  un: {
    id: 'un', name: 'Un',
    description: 'Ekmek ve hamur işi üretiminde kullanılan öğütülmüş buğday.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 32
  },
  sebze: {
    id: 'sebze', name: 'Taze Sebze',
    description: 'Çorba ve seyahat yemeklerinde kullanılan taze mahsul.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 25
  },
  meyve: {
    id: 'meyve', name: 'Mevsim Meyvesi',
    description: 'Tatlı, yemek ve evcil hayvan besinlerinde kullanılan meyve.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 28
  },
  orman_meyvesi: {
    id: 'orman_meyvesi', name: 'Orman Meyvesi',
    description: 'Ormanlarda yetişen, yemek ve pet besini olarak kullanılabilen yabani meyve.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 34
  },
  bal: {
    id: 'bal', name: 'Doğal Bal',
    description: 'Yemeklerde ve özel pet mamalarında kullanılan besleyici bal.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 75
  },
  et: {
    id: 'et', name: 'Çiğ Et',
    description: 'Pişirilerek yemek veya pet besini hâline getirilebilen av eti.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 42
  },
  balik_fileto: {
    id: 'balik_fileto', name: 'Balık Fileto',
    description: 'Yemek ve pet besini tariflerinde kullanılan temizlenmiş balık eti.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 55
  },
  tatli_su_baligi: {
    id: 'tatli_su_baligi', name: 'Tatlı Su Balığı',
    description: 'Göllerden ve nehirlerden yakalanan, yemeklerde kullanılan balık.',
    category: 'material', rarity: 'common', tradeable: true, stackable: true, maxStack: 999, basePrice: 38
  },
  tuzlu_su_baligi: {
    id: 'tuzlu_su_baligi', name: 'Tuzlu Su Balığı',
    description: 'Denizlerde yakalanan, yemek ve özel tariflerde kullanılan balık.',
    category: 'material', rarity: 'quality', tradeable: true, stackable: true, maxStack: 999, basePrice: 65
  },
  derin_deniz_baligi: {
    id: 'derin_deniz_baligi', name: 'Derin Deniz Balığı',
    description: 'Derin sularda bulunan, nadir yemek ve simya tariflerinde kullanılan balık.',
    category: 'material', rarity: 'rare', tradeable: true, stackable: true, maxStack: 999, basePrice: 150
  },
  pisirilmis_et: {
    id: 'pisirilmis_et', name: 'Pişirilmiş Et',
    description: 'Temel besin ihtiyacını karşılayan pişmiş av eti.',
    category: 'food', rarity: 'common', tradeable: true, stackable: true, maxStack: 99, basePrice: 75
  },
  ekmek: {
    id: 'ekmek', name: 'Köy Ekmeği',
    description: 'Buğday ve undan hazırlanan temel yol ve savaş azığı.',
    category: 'food', rarity: 'common', tradeable: true, stackable: true, maxStack: 99, basePrice: 58
  },
  corba: {
    id: 'corba', name: 'Besleyici Çorba',
    description: 'Sebzeler ve diğer malzemelerle hazırlanan doyurucu yemek.',
    category: 'food', rarity: 'quality', tradeable: true, stackable: true, maxStack: 99, basePrice: 110
  },
  et_yemegi: {
    id: 'et_yemegi', name: 'Avcı Yemeği',
    description: 'Pişmiş et ve baharatlarla hazırlanan, savaş öncesi güç veren yemek.',
    category: 'food', rarity: 'quality', tradeable: true, stackable: true, maxStack: 99, basePrice: 145
  },
  yol_azigi: {
    id: 'yol_azigi', name: 'Yol Azığı',
    description: 'Uzun keşif yolculuklarında kullanılmak üzere hazırlanmış dayanıklı erzak.',
    category: 'food', rarity: 'quality', tradeable: true, stackable: true, maxStack: 99, basePrice: 125
  },
  enerji_yemegi: {
    id: 'enerji_yemegi', name: 'Enerji Yemeği',
    description: 'Yoğun maceralar öncesinde enerji desteği sağlayan özel yemek.',
    category: 'food', rarity: 'rare', tradeable: true, stackable: true, maxStack: 99, basePrice: 220
  },
  saglik_iksiri: {
    id: 'saglik_iksiri', name: 'Sağlık İksiri',
    description: 'Kullanıldığında savaşçının sağlığını yenilemeye yardımcı olan simya ürünü.',
    category: 'potion', rarity: 'common', tradeable: true, stackable: true, maxStack: 99, basePrice: 115
  },
  panzehir: {
    id: 'panzehir', name: 'Panzehir',
    description: 'Zehirlenme etkilerini gidermek için kullanılan simya karışımı.',
    category: 'potion', rarity: 'quality', tradeable: true, stackable: true, maxStack: 99, basePrice: 140
  },
  zehir: {
    id: 'zehir', name: 'Zehir Şişesi',
    description: 'Uygun savaş eşyalarında kullanılabilen tehlikeli simya karışımı.',
    category: 'potion', rarity: 'quality', tradeable: true, stackable: true, maxStack: 99, basePrice: 155
  },
  pet_et: {
    id: 'pet_et', name: 'Pet Eti',
    description: 'Etçil evcil hayvanların beslenmesinde kullanılan çiğ et porsiyonu.',
    category: 'pet_food', rarity: 'common', tradeable: true, stackable: true, maxStack: 99, basePrice: 48
  },
  pet_balik: {
    id: 'pet_balik', name: 'Pet Balığı',
    description: 'Balıkla beslenen evcil hayvanlar için hazırlanmış taze balık.',
    category: 'pet_food', rarity: 'common', tradeable: true, stackable: true, maxStack: 99, basePrice: 62
  },
  buyulu_yem: {
    id: 'buyulu_yem', name: 'Büyülü Yem',
    description: 'Büyülü ve nadir evcil hayvanların beslenmesi için hazırlanmış özel yem.',
    category: 'pet_food', rarity: 'epic', tradeable: true, stackable: true, maxStack: 99, basePrice: 280
  },
  ejderha_yemi: {
    id: 'ejderha_yemi', name: 'Ejderha Yemi',
    description: 'Ejderha türü evcil hayvanların beslenmesi için gereken nadir özel besin.',
    category: 'pet_food', rarity: 'legendary', tradeable: true, stackable: true, maxStack: 99, basePrice: 650
  },
  kucuk_av: {
    id: 'kucuk_av', name: 'Küçük Av',
    description: 'Küçük etçil evcil hayvanlar için uygun av eti.',
    category: 'pet_food', rarity: 'common', tradeable: true, stackable: true, maxStack: 99, basePrice: 40
  },
  hasat_sepeti: {
    id: 'hasat_sepeti', name: 'Hasat Sepeti',
    description: 'Çiftçilik ürünlerini taşımak ve bazı üretim tariflerinde kullanmak için hazırlanmış sepet.',
    category: 'tool', rarity: 'common', tradeable: true, stackable: false, basePrice: 180
  },

  metal_mizrak: {
    id: 'metal_mizrak', name: 'Metal Mızrak',
    description: 'Dengeli menzili ve delici saldırısıyla öne çıkan mızrak.',
    category: 'weapon', rarity: 'common', tradeable: true, stackable: false, basePrice: 260,
    requiredLevel: 3, slot: 'weapon', stats: { attack: 18, accuracy: 3 }
  },
  celik_mizrak: {
    id: 'celik_mizrak', name: 'Çelik Mızrak',
    description: 'Usta demircilerin ürettiği dayanıklı ve keskin mızrak.',
    category: 'weapon', rarity: 'rare', tradeable: true, stackable: false, basePrice: 620,
    requiredLevel: 12, slot: 'weapon', stats: { attack: 38, accuracy: 5 }
  },
  avci_yay: {
    id: 'avci_yay', name: 'Avcı Yayı',
    description: 'Hafif gövdesi sayesinde hızlı ve isabetli atışlar sağlar.',
    category: 'weapon', rarity: 'quality', tradeable: true, stackable: false, basePrice: 340,
    requiredLevel: 5, slot: 'weapon', stats: { attack: 24, accuracy: 7, criticalChance: 2 }
  },
  usta_yayi: {
    id: 'usta_yayi', name: 'Usta Avcı Yayı',
    description: 'Özel ağaç ve güçlendirilmiş yay kirişiyle üretilmiş usta işi yay.',
    category: 'weapon', rarity: 'epic', tradeable: true, stackable: false, basePrice: 1250,
    requiredLevel: 22, slot: 'weapon', stats: { attack: 58, accuracy: 12, criticalChance: 5 }
  },
  kemik_mizrak: {
    id: 'kemik_mizrak', name: 'Kemik Mızrak',
    description: 'Büyük yaratıkların sağlam kemiklerinden yapılmış avcı silahı.',
    category: 'weapon', rarity: 'quality', tradeable: true, stackable: false, basePrice: 390,
    requiredLevel: 7, slot: 'weapon', stats: { attack: 29, criticalDamage: 8 }
  },
  deri_eldiven: {
    id: 'deri_eldiven', name: 'Deri Eldiven',
    description: 'Hareket kabiliyetini kısıtlamayan koruyucu deri eldiven.',
    category: 'armor', rarity: 'common', tradeable: true, stackable: false, basePrice: 150,
    slot: 'gloves', stats: { defense: 5, dodgeChance: 1 }
  },
  celik_eldiven: {
    id: 'celik_eldiven', name: 'Çelik Eldiven',
    description: 'Eller ve bilekler için güçlendirilmiş metal koruma.',
    category: 'armor', rarity: 'quality', tradeable: true, stackable: false, basePrice: 390,
    requiredLevel: 10, slot: 'gloves', stats: { defense: 13, health: 12 }
  },
  deri_miğfer: {
    id: 'deri_miğfer', name: 'Deri Miğfer',
    description: 'Hafif ve esnek deri başlık.',
    category: 'armor', rarity: 'common', tradeable: true, stackable: false, basePrice: 170,
    slot: 'helmet', stats: { defense: 6, health: 8 }
  },
  celik_miğfer: {
    id: 'celik_miğfer', name: 'Çelik Miğfer',
    description: 'Baş bölgesini ağır darbelerden koruyan sağlam miğfer.',
    category: 'armor', rarity: 'quality', tradeable: true, stackable: false, basePrice: 440,
    requiredLevel: 10, slot: 'helmet', stats: { defense: 15, health: 20 }
  },
  deri_pantolon: {
    id: 'deri_pantolon', name: 'Deri Pantolon',
    description: 'Avcılar ve gezginler için esnek koruyucu giysi.',
    category: 'armor', rarity: 'common', tradeable: true, stackable: false, basePrice: 185,
    slot: 'pants', stats: { defense: 7, dodgeChance: 2 }
  },
  celik_pantolon: {
    id: 'celik_pantolon', name: 'Çelik Zırhlı Pantolon',
    description: 'Hareket kabiliyeti korunarak metal parçalarla güçlendirilmiş zırh.',
    category: 'armor', rarity: 'quality', tradeable: true, stackable: false, basePrice: 480,
    requiredLevel: 12, slot: 'pants', stats: { defense: 17, health: 18 }
  },
  avci_pelerini: {
    id: 'avci_pelerini', name: 'Avcı Pelerini',
    description: 'Kamuflaj ve çeviklik sağlayan hafif pelerin.',
    category: 'armor', rarity: 'rare', tradeable: true, stackable: false, basePrice: 520,
    requiredLevel: 12, slot: 'cloak', stats: { defense: 10, dodgeChance: 4, accuracy: 3 }
  },
  deri_cizme: {
    id: 'deri_cizme', name: 'Deri Çizme',
    description: 'Uzun yürüyüşlerde rahatlık sağlayan dayanıklı çizmeler.',
    category: 'armor', rarity: 'common', tradeable: true, stackable: false, basePrice: 160,
    slot: 'boots', stats: { defense: 5, dodgeChance: 2 }
  },
  celik_cizme: {
    id: 'celik_cizme', name: 'Çelik Çizme',
    description: 'Ayakları darbelere karşı koruyan güçlendirilmiş çelik çizme.',
    category: 'armor', rarity: 'quality', tradeable: true, stackable: false, basePrice: 410,
    requiredLevel: 10, slot: 'boots', stats: { defense: 13, health: 10 }
  },
  deri_kemer: {
    id: 'deri_kemer', name: 'Deri Kemer',
    description: 'Ekipman ve küçük araçları taşımaya yarayan sağlam kemer.',
    category: 'armor', rarity: 'common', tradeable: true, stackable: false, basePrice: 120,
    slot: 'belt', stats: { defense: 3, health: 10 }
  },
  savas_kolyesi: {
    id: 'savas_kolyesi', name: 'Savaşçı Kolyesi',
    description: 'Saldırı gücünü destekleyen işlenmiş metal kolye.',
    category: 'accessory', rarity: 'quality', tradeable: true, stackable: false, basePrice: 420,
    slot: 'necklace', stats: { attack: 5, criticalChance: 2 }
  },
  koruma_kolyesi: {
    id: 'koruma_kolyesi', name: 'Koruyucu Kolye',
    description: 'Savunma ve dayanıklılığı artıran koruma kolyesi.',
    category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 680,
    requiredLevel: 15, slot: 'necklace', stats: { defense: 8, health: 25 }
  },
  guc_yuzugu: {
    id: 'guc_yuzugu', name: 'Güç Yüzüğü',
    description: 'Taşıyana saldırı gücü kazandıran işlenmiş yüzük.',
    category: 'accessory', rarity: 'quality', tradeable: true, stackable: false, basePrice: 390,
    slot: 'ring', stats: { attack: 4, criticalDamage: 5 }
  },
  cevher_yuzugu: {
    id: 'cevher_yuzugu', name: 'Cevher Yüzüğü',
    description: 'Nadir cevherle güçlendirilmiş, dayanıklılık sağlayan yüzük.',
    category: 'accessory', rarity: 'epic', tradeable: true, stackable: false, basePrice: 1150,
    requiredLevel: 20, slot: 'ring', stats: { defense: 7, health: 30, criticalChance: 3 }
  },
  kadim_tilsim: {
    id: 'kadim_tilsim', name: 'Kadim Tılsım',
    description: 'Kadim enerjilerle işlenmiş, çeşitli savaş özelliklerini destekleyen tılsım.',
    category: 'accessory', rarity: 'epic', tradeable: true, stackable: false, basePrice: 1450,
    requiredLevel: 25, slot: 'charm', stats: { attack: 8, defense: 8, resistance: { poison: 5, fire: 5 } }
  },
  koruyucu_muska: {
    id: 'koruyucu_muska', name: 'Koruyucu Muska',
    description: 'Zararlı etkiler karşısında koruma sağlayan eski muska.',
    category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 720,
    requiredLevel: 14, slot: 'charm', stats: { health: 25, resistance: { poison: 10 } }
  },
  avci_sadagi: {
    id: 'avci_sadagi', name: 'Avcı Sadak',
    description: 'Ok ve mühimmat taşımak için hazırlanmış deri sadak.',
    category: 'tool', rarity: 'common', tradeable: true, stackable: false, basePrice: 135,
    stats: { accuracy: 2 }
  },
  usta_demirci_takimi: {
    id: 'usta_demirci_takimi', name: 'Usta Demirci Takımı',
    description: 'Metal işleme ve silah üretiminde kaliteyi artıran profesyonel araç seti.',
    category: 'tool', rarity: 'rare', tradeable: true, stackable: false, basePrice: 850
  },
  deri_isleme_seti: {
    id: 'deri_isleme_seti', name: 'Deri İşleme Seti',
    description: 'Deri tabaklama ve zırh üretiminde kullanılan usta araçları.',
    category: 'tool', rarity: 'quality', tradeable: true, stackable: false, basePrice: 460
  },
  avci_tuzagi: {
    id: 'avci_tuzagi', name: 'Avcı Tuzağı',
    description: 'Yaratıkları yakalamak ve bazı av görevlerini tamamlamak için kullanılan tuzak.',
    category: 'tool', rarity: 'common', tradeable: true, stackable: true, maxStack: 20, basePrice: 95
  },
  deniz_hazinesi: {
    id: 'deniz_hazinesi', name: 'Deniz Hazinesi',
    description: 'Sisli Sahil ve derin denizlerde bulunan, nadir üretimlerde ve özel görevlerde kullanılan değerli bir hazine.',
    category: 'boss_loot', rarity: 'epic', tradeable: true, stackable: true, maxStack: 99, basePrice: 1200
  },
  ejderha_cekirdegi: {
    id: 'ejderha_cekirdegi', name: 'Ejderha Çekirdeği',
    description: 'Kadim ejderhaların özünden elde edilen, efsanevi üretimlerde ve ejderha mirası görevlerinde kullanılan güçlü çekirdek.',
    category: 'boss_loot', rarity: 'legendary', tradeable: true, stackable: true, maxStack: 99, basePrice: 2500
  },
  efsanevi_yumurta: {
    id: 'efsanevi_yumurta', name: 'Efsanevi Yumurta',
    description: 'İçinde eşsiz bir evcil hayvanın bulunduğu gizemli yumurta. Özel pet edinme işlemiyle açılabilir.',
    category: 'quest_item', rarity: 'legendary', tradeable: true, stackable: false, basePrice: 8000
  },
  // Meslek odakları ve yeni üretim çıktıları için tamamlayıcı katalog.
  'yay': { id: 'yay', name: 'Avcı Yayı', description: 'Avcı Yayı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'weapon', rarity: 'quality', tradeable: true, stackable: false, basePrice: 250, slot: 'weapon', stats: { attack: 4, defense: 2, health: 10 } },
  'asa': { id: 'asa', name: 'Oyma Asa', description: 'Oyma Asa; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'weapon', rarity: 'quality', tradeable: true, stackable: false, basePrice: 250, slot: 'weapon', stats: { attack: 4, defense: 2, health: 10 } },
  'kereste': { id: 'kereste', name: 'İşlenmiş Kereste', description: 'İşlenmiş Kereste; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'ok': { id: 'ok', name: 'Ok', description: 'Ok; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'orman_koruma': { id: 'orman_koruma', name: 'Orman Koruma Totemi', description: 'Orman Koruma Totemi; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'nadir_tohum': { id: 'nadir_tohum', name: 'Nadir Tohum', description: 'Nadir Tohum; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'dogal_oz': { id: 'dogal_oz', name: 'Doğal Öz', description: 'Doğal Öz; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'orman_izi': { id: 'orman_izi', name: 'Orman İzi', description: 'Orman İzi; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'mithril_cevheri': { id: 'mithril_cevheri', name: 'Mithril Cevheri', description: 'Mithril Cevheri; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'epic', tradeable: true, stackable: true, basePrice: 700 },
  'yer_alti_damari': { id: 'yer_alti_damari', name: 'Yeraltı Damarı', description: 'Yeraltı Damarı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'kadim_maden': { id: 'kadim_maden', name: 'Kadim Maden', description: 'Kadim Maden; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'epic', tradeable: true, stackable: true, basePrice: 700 },
  'fosil': { id: 'fosil', name: 'Fosil', description: 'Fosil; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'derin_kristal': { id: 'derin_kristal', name: 'Derin Kristal', description: 'Derin Kristal; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'epic', tradeable: true, stackable: true, basePrice: 700 },
  'dis': { id: 'dis', name: 'Yaratık Dişi', description: 'Yaratık Dişi; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'yaratik_izi': { id: 'yaratik_izi', name: 'Yaratık İzi', description: 'Yaratık İzi; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'av_rotasi': { id: 'av_rotasi', name: 'Av Rotası Kaydı', description: 'Av Rotası Kaydı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'iz_tuzagi': { id: 'iz_tuzagi', name: 'İz Tuzağı', description: 'İz Tuzağı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'takip_bilgisi': { id: 'takip_bilgisi', name: 'Takip Bilgisi', description: 'Takip Bilgisi; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'saldiri_iksiri': { id: 'saldiri_iksiri', name: 'Saldırı İksiri', description: 'Saldırı İksiri; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'potion', rarity: 'quality', tradeable: true, stackable: true, basePrice: 90 },
  'sifa_ozu': { id: 'sifa_ozu', name: 'Şifa Özü', description: 'Şifa Özü; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'quality', tradeable: true, stackable: true, basePrice: 90 },
  'ates_ozu': { id: 'ates_ozu', name: 'Ateş Özü', description: 'Ateş Özü; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'quality', tradeable: true, stackable: true, basePrice: 90 },
  'buz_ozu': { id: 'buz_ozu', name: 'Buz Özü', description: 'Buz Özü; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'quality', tradeable: true, stackable: true, basePrice: 90 },
  'yildirim_ozu': { id: 'yildirim_ozu', name: 'Yıldırım Özü', description: 'Yıldırım Özü; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'quality', tradeable: true, stackable: true, basePrice: 90 },
  'toprak_ozu': { id: 'toprak_ozu', name: 'Toprak Özü', description: 'Toprak Özü; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'quality', tradeable: true, stackable: true, basePrice: 90 },
  'doga_ozu': { id: 'doga_ozu', name: 'Doğa Özü', description: 'Doğa Özü; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'quality', tradeable: true, stackable: true, basePrice: 90 },
  'golge_ozu': { id: 'golge_ozu', name: 'Gölge Özü', description: 'Gölge Özü; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'quality', tradeable: true, stackable: true, basePrice: 90 },
  'tuzak': { id: 'tuzak', name: 'Av Tuzağı', description: 'Av Tuzağı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'usta_takimi': { id: 'usta_takimi', name: 'Usta Takımı', description: 'Usta Takımı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'kesif_aleti': { id: 'kesif_aleti', name: 'Keşif Aleti', description: 'Keşif Aleti; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'usta_duzenegi': { id: 'usta_duzenegi', name: 'Usta Düzeneği', description: 'Usta Düzeneği; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'mekanik_takim': { id: 'mekanik_takim', name: 'Mekanik Takım', description: 'Mekanik Takım; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'tuzak_parcasi': { id: 'tuzak_parcasi', name: 'Tuzak Parçası', description: 'Tuzak Parçası; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'metal_zirh': { id: 'metal_zirh', name: 'Metal Zırh', description: 'Metal Zırh; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'armor', rarity: 'quality', tradeable: true, stackable: false, basePrice: 300, slot: 'chest', stats: { attack: 4, defense: 2, health: 10 } },
  'metal_kalkan': { id: 'metal_kalkan', name: 'Metal Kalkan', description: 'Metal Kalkan; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'shield', rarity: 'quality', tradeable: true, stackable: false, basePrice: 220, slot: 'shield', stats: { attack: 4, defense: 2, health: 10 } },
  'kilic': { id: 'kilic', name: 'Çelik Kılıç', description: 'Çelik Kılıç; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'weapon', rarity: 'quality', tradeable: true, stackable: false, basePrice: 250, slot: 'weapon', stats: { attack: 4, defense: 2, health: 10 } },
  'balta': { id: 'balta', name: 'Savaş Baltası', description: 'Savaş Baltası; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'weapon', rarity: 'quality', tradeable: true, stackable: false, basePrice: 250, slot: 'weapon', stats: { attack: 4, defense: 2, health: 10 } },
  'hancer': { id: 'hancer', name: 'Avcı Hançeri', description: 'Avcı Hançeri; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'weapon', rarity: 'quality', tradeable: true, stackable: false, basePrice: 250, slot: 'weapon', stats: { attack: 4, defense: 2, health: 10 } },
  'mizrak': { id: 'mizrak', name: 'Savaş Mızrağı', description: 'Savaş Mızrağı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'weapon', rarity: 'quality', tradeable: true, stackable: false, basePrice: 250, slot: 'weapon', stats: { attack: 4, defense: 2, health: 10 } },
  'cekic': { id: 'cekic', name: 'Demirci Çekici', description: 'Demirci Çekici; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'weapon', rarity: 'quality', tradeable: true, stackable: false, basePrice: 250, slot: 'weapon', stats: { attack: 4, defense: 2, health: 10 } },
  'agir_zirh': { id: 'agir_zirh', name: 'Ağır Zırh', description: 'Ağır Zırh; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'armor', rarity: 'quality', tradeable: true, stackable: false, basePrice: 300, slot: 'chest', stats: { attack: 4, defense: 2, health: 10 } },
  'miğfer': { id: 'miğfer', name: 'Miğfer', description: 'Miğfer; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'armor', rarity: 'quality', tradeable: true, stackable: false, basePrice: 300, slot: 'helmet', stats: { attack: 4, defense: 2, health: 10 } },
  'zincir_zirh': { id: 'zincir_zirh', name: 'Zincir Zırh', description: 'Zincir Zırh; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'armor', rarity: 'quality', tradeable: true, stackable: false, basePrice: 300, slot: 'chest', stats: { attack: 4, defense: 2, health: 10 } },
  'usta_celigi': { id: 'usta_celigi', name: 'Usta Çeliği', description: 'Usta Çeliği; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'epic', tradeable: true, stackable: true, basePrice: 700 },
  'kadim_alasim': { id: 'kadim_alasim', name: 'Kadim Alaşım', description: 'Kadim Alaşım; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'epic', tradeable: true, stackable: true, basePrice: 700 },
  'silah_dovme': { id: 'silah_dovme', name: 'Silah Dövme Kalıbı', description: 'Silah Dövme Kalıbı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'zirh_dovme': { id: 'zirh_dovme', name: 'Zırh Dövme Kalıbı', description: 'Zırh Dövme Kalıbı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'canta': { id: 'canta', name: 'Gezgin Çantası', description: 'Gezgin Çantası; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'sadak': { id: 'sadak', name: 'Ok Sadak', description: 'Ok Sadak; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'avci_kemeri': { id: 'avci_kemeri', name: 'Avcı Kemeri', description: 'Avcı Kemeri; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'eyer': { id: 'eyer', name: 'Binek Eyeri', description: 'Binek Eyeri; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'kosum': { id: 'kosum', name: 'Binek Koşumu', description: 'Binek Koşumu; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'pet_zirhi': { id: 'pet_zirhi', name: 'Pet Zırhı', description: 'Yoldaşının savunmasını güçlendiren hafif zırh.', category: 'pet_equipment', rarity: 'quality', tradeable: true, stackable: false, basePrice: 300, requiredProfession: 'derici', requiredProfessionLevel: 10, slot: 'pet_armor', stats: { defense: 8, health: 15 } },
  'pet_tasmasi': { id: 'pet_tasmasi', name: 'Yoldaş Tasması', description: 'Petin bağını ve dayanıklılığını destekleyen işlenmiş tasma.', category: 'pet_equipment', rarity: 'quality', tradeable: true, stackable: false, basePrice: 220, requiredProfession: 'derici', requiredProfessionLevel: 5, slot: 'pet_collar', stats: { health: 10, defense: 2 } },
  'pet_tilsimi': { id: 'pet_tilsimi', name: 'Yoldaş Tılsımı', description: 'Petin saldırı gücünü kadim bir işaretle destekleyen tılsım.', category: 'pet_equipment', rarity: 'rare', tradeable: true, stackable: false, basePrice: 500, requiredProfession: 'mucevherci', requiredProfessionLevel: 20, slot: 'pet_talisman', stats: { attack: 8, criticalChance: 2 } },
  'binek_takimi': { id: 'binek_takimi', name: 'Binek Takımı', description: 'Binek Takımı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'tool', rarity: 'common', tradeable: true, stackable: true, basePrice: 120 },
  'yuzuk': { id: 'yuzuk', name: 'Değerli Taş Yüzük', description: 'Değerli Taş Yüzük; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 500, slot: 'ring', stats: { attack: 4, defense: 2, health: 10 } },
  'kolye': { id: 'kolye', name: 'Koruyucu Kolye', description: 'Koruyucu Kolye; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 500, slot: 'necklace', stats: { attack: 4, defense: 2, health: 10 } },
  'tilsim': { id: 'tilsim', name: 'Koruyucu Tılsım', description: 'Koruyucu Tılsım; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 500, slot: 'charm', stats: { attack: 4, defense: 2, health: 10 } },
  'muska': { id: 'muska', name: 'Kadim Muska', description: 'Kadim Muska; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 500, slot: 'charm', stats: { attack: 4, defense: 2, health: 10 } },
  'saldiri_yuzugu': { id: 'saldiri_yuzugu', name: 'Saldırı Yüzüğü', description: 'Saldırı Yüzüğü; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 500, slot: 'charm', stats: { attack: 4, defense: 2, health: 10 } },
  'kritik_tasi': { id: 'kritik_tasi', name: 'Kritik Taşı', description: 'Kritik Taşı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 500, slot: 'charm', stats: { attack: 4, defense: 2, health: 10 } },
  'koruma_tilsimi': { id: 'koruma_tilsimi', name: 'Koruma Tılsımı', description: 'Koruma Tılsımı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 500, slot: 'charm', stats: { attack: 4, defense: 2, health: 10 } },
  'direnc_kolyesi': { id: 'direnc_kolyesi', name: 'Direnç Kolyesi', description: 'Direnç Kolyesi; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 500, slot: 'necklace', stats: { attack: 4, defense: 2, health: 10 } },
  'kadim_rune': { id: 'kadim_rune', name: 'Kadim Rün', description: 'Kadim Rün; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'accessory', rarity: 'epic', tradeable: true, stackable: false, basePrice: 700, slot: 'charm', stats: { attack: 4, defense: 2, health: 10 } },
  'run_tasi': { id: 'run_tasi', name: 'Rün Taşı', description: 'Rün Taşı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 500, slot: 'charm', stats: { attack: 4, defense: 2, health: 10 } },
  'rune_levhasi': { id: 'rune_levhasi', name: 'Rün Levhası', description: 'Rün Levhası; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'accessory', rarity: 'rare', tradeable: true, stackable: false, basePrice: 500, slot: 'charm', stats: { attack: 4, defense: 2, health: 10 } },
  'buyulu_bitki': { id: 'buyulu_bitki', name: 'Büyülü Bitki', description: 'Büyülü Bitki; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'quality', tradeable: true, stackable: true, basePrice: 90 },
  'tohum': { id: 'tohum', name: 'Seçilmiş Tohum', description: 'Seçilmiş Tohum; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'hayvan_yemi': { id: 'hayvan_yemi', name: 'Hayvan Yemi', description: 'Hayvan Yemi; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'ari_mumu': { id: 'ari_mumu', name: 'Arı Mumu', description: 'Arı Mumu; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'sut': { id: 'sut', name: 'Taze Süt', description: 'Taze Süt; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'yumurta': { id: 'yumurta', name: 'Çiftlik Yumurtası', description: 'Çiftlik Yumurtası; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'yun': { id: 'yun', name: 'Yün', description: 'Yün; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'batik_hazine': { id: 'batik_hazine', name: 'Batık Hazine Parçası', description: 'Batık Hazine Parçası; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'nehir_incisi': { id: 'nehir_incisi', name: 'Nehir İncisi', description: 'Nehir İncisi; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'gol_otlari': { id: 'gol_otlari', name: 'Göl Otları', description: 'Göl Otları; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'tatli_su_hazinesi': { id: 'tatli_su_hazinesi', name: 'Tatlı Su Hazinesi', description: 'Tatlı Su Hazinesi; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'savascinin_tabagi': { id: 'savascinin_tabagi', name: 'Savaşçının Tabağı', description: 'Savaşçının Tabağı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'food', rarity: 'quality', tradeable: true, stackable: true, basePrice: 120 },
  'direnc_corba': { id: 'direnc_corba', name: 'Direnç Çorbası', description: 'Direnç Çorbası; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'food', rarity: 'quality', tradeable: true, stackable: true, basePrice: 120 },
  'kamp_yemegi': { id: 'kamp_yemegi', name: 'Kamp Yemeği', description: 'Kamp Yemeği; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'food', rarity: 'quality', tradeable: true, stackable: true, basePrice: 120 },
  'solen_yemegi': { id: 'solen_yemegi', name: 'Şölen Yemeği', description: 'Şölen Yemeği; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'food', rarity: 'quality', tradeable: true, stackable: true, basePrice: 120 },
  'usta_sofrasi': { id: 'usta_sofrasi', name: 'Usta Sofrası', description: 'Usta Sofrası; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'food', rarity: 'quality', tradeable: true, stackable: true, basePrice: 120 },
  'nadir_baharat': { id: 'nadir_baharat', name: 'Nadir Baharat', description: 'Nadir Baharat; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'material', rarity: 'common', tradeable: true, stackable: true, basePrice: 30 },
  'ziyafet_tatlisi': { id: 'ziyafet_tatlisi', name: 'Ziyafet Tatlısı', description: 'Ziyafet Tatlısı; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'food', rarity: 'quality', tradeable: true, stackable: true, basePrice: 120 },
  'nadir_yumurta': { id: 'nadir_yumurta', name: 'Nadir Yumurta', description: 'Nadir Yumurta; NEXUS dünyasında üretim, keşif veya ekipman gelişiminde kullanılan bir kaynak.', category: 'quest_item', rarity: 'epic', tradeable: true, stackable: false, basePrice: 2500 },
};
export function getRpgItem(id: string): RpgItemDefinition | undefined {
  return RPG_ITEMS[id];
}

export function getRpgItemsByCategory(category: RpgItemDefinition['category']): RpgItemDefinition[] {
  return Object.values(RPG_ITEMS).filter(item => item.category === category);
}





