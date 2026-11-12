import type { RpgVisualRef } from '../types';

export interface RpgSpecialization {
  id: string;
  name: string;
  description: string;
  focus: string[];
  visual?: RpgVisualRef;
}

export interface RpgProfessionDefinition {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  specializations: RpgSpecialization[];
  primaryResources: string[];
  products: string[];
  visual?: RpgVisualRef;
}

export const RPG_MAX_PROFESSION_LEVEL = 50;
export const RPG_MAX_MASTERY = 100;

export const RPG_PROFESSIONS: RpgProfessionDefinition[] = [
  {
    id: 'ormanci',
    name: 'Ormancı',
    description: 'Ormanlardan kereste, reçine ve nadir doğal kaynaklar toplar.',
    maxLevel: RPG_MAX_PROFESSION_LEVEL,
    specializations: [
      { id: 'kerestecilik', name: 'Kerestecilik', description: 'Dayanıklı kereste ve yapı malzemeleri üretiminde uzmanlaşır.', focus: ['sert_agac', 'kadim_agac', 'kereste'] },
      { id: 'yay_ustaligi', name: 'Yay ve Ahşap Ustalığı', description: 'Yay, asa, kalkan ve ahşap silah parçaları üretir.', focus: ['yay', 'asa', 'ahsap_kalkan', 'ok'] },
      { id: 'orman_koruyuculugu', name: 'Orman Koruyuculuğu', description: 'Orman ekosistemini korur; nadir bitkileri, tohumları ve doğal izleri gözetir.', focus: ['orman_koruma', 'nadir_tohum', 'dogal_oz', 'orman_izi'] },
    ],
    primaryResources: ['sert_agac', 'recine', 'kadim_lif', 'kadim_agac'],
    products: ['yay', 'asa', 'ahsap_kalkan', 'ok_demeti', 'ahsap_parca']
  },
  {
    id: 'madenci',
    name: 'Madenci',
    description: 'Maden damarlarını, kristalleri ve değerli taşları keşfeder.',
    maxLevel: RPG_MAX_PROFESSION_LEVEL,
    specializations: [
      { id: 'metal_madenciligi', name: 'Metal Madenciliği', description: 'Metal cevherleri ve alaşım hammaddeleri toplar.', focus: ['demir_cevheri', 'bakir_cevheri', 'gumus_cevheri', 'komur'] },
      { id: 'kristal_ustaligi', name: 'Kristal ve Değerli Taş', description: 'Büyülü kristal ve mücevher hammaddeleri bulur.', focus: ['nadir_kristal', 'buyulu_kristal', 'degerli_tas', 'mithril_cevheri'] },
      { id: 'yeralti_kesifciligi', name: 'Yeraltı Kaşifliği', description: 'Yeraltı katmanlarını keşfeder, gizli damarları ve kadim kalıntıları bulur.', focus: ['yer_alti_damari', 'kadim_maden', 'fosil', 'derin_kristal'] },
    ],
    primaryResources: ['demir_cevheri', 'bakir_cevheri', 'komur', 'gumus_cevheri', 'altin_cevheri', 'nadir_kristal'],
    products: ['metal_kulce', 'celik_kulce', 'kristal', 'degerli_tas']
  },
  {
    id: 'avci',
    name: 'Avcı',
    description: 'Yaratıkları avlar, post, kemik ve canavar parçaları toplar.',
    maxLevel: RPG_MAX_PROFESSION_LEVEL,
    specializations: [
      { id: 'canavar_avciligi', name: 'Canavar Avcılığı', description: 'Tehlikeli yaratıkları takip eder ve nadir parçalarını toplar.', focus: ['boss_ozu', 'yaratik_cekirdegi', 'pençe', 'boynuz'] },
      { id: 'kurk_deri', name: 'Kürk ve Deri Avcılığı', description: 'Kaliteli post, deri ve av malzemeleri elde eder.', focus: ['yaratik_derisi', 'kurk', 'kemik', 'dis'] },
      { id: 'iz_suruculugu', name: 'İz Sürücülüğü', description: 'Yaratıkların izlerini okuyarak hedefleri takip eder ve av rotaları belirler.', focus: ['yaratik_izi', 'av_rotasi', 'iz_tuzagi', 'takip_bilgisi'] },
    ],
    primaryResources: ['yaratik_derisi', 'pençe', 'boss_ozu', 'kemik', 'kurk', 'boynuz'],
    products: ['av_malzemesi', 'islenmemis_deri', 'yaratik_cekirdegi']
  },
  {
    id: 'simyaci',
    name: 'Simyacı',
    description: 'İksir, öz, panzehir ve büyülü karışımlar hazırlar.',
    maxLevel: RPG_MAX_PROFESSION_LEVEL,
    specializations: [
      { id: 'savas_simyasi', name: 'Savaş Simyası', description: 'Savaşta saldırı ve direnç sağlayan karışımlar hazırlar.', focus: ['zehir', 'silah_yagi', 'saldiri_iksiri', 'simya_ozu'] },
      { id: 'sifa_simyasi', name: 'Şifa ve Destek Simyası', description: 'Can, mana ve durum etkilerini iyileştiren iksirler üretir.', focus: ['saglik_iksiri', 'mana_iksiri', 'panzehir', 'sifa_ozu'] },
      { id: 'element_simyasi', name: 'Element Simyası', description: 'Ateş, buz, yıldırım, toprak, doğa ve gölge özlerini işler.', focus: ['ates_ozu', 'buz_ozu', 'yildirim_ozu', 'toprak_ozu', 'doga_ozu', 'golge_ozu'] },
    ],
    primaryResources: ['sifali_ot', 'simya_ozu', 'buyulu_kristal'],
    products: ['saglik_iksiri', 'mana_iksiri', 'panzehir', 'zehir', 'silah_yagi']
  },
  {
    id: 'zanaatkar',
    name: 'Zanaatkâr',
    description: 'Mekanik parçalar, üretim araçları ve geliştirme bileşenleri hazırlar.',
    maxLevel: RPG_MAX_PROFESSION_LEVEL,
    specializations: [
      { id: 'mekanik_ustalik', name: 'Mekanik Ustalık', description: 'Tuzak, mekanizma ve gelişmiş üretim araçları tasarlar.', focus: ['mekanik_parca', 'tuzak', 'mekanik_duzenek'] },
      { id: 'gelistirme_ustaligi', name: 'Geliştirme ve Eşya Ustalığı', description: 'Ekipman geliştirme ve kalite artırma bileşenleri üretir.', focus: ['gelistirme_cekirdegi', 'usta_takimi', 'guclendirme_parcasi'] },
      { id: 'alet_duzenek_ustaligi', name: 'Alet ve Düzenek Ustalığı', description: 'Keşif, üretim ve zanaat için gelişmiş aletler ve düzenekler tasarlar.', focus: ['kesif_aleti', 'usta_duzenegi', 'mekanik_takim', 'tuzak_parcasi'] },
    ],
    primaryResources: ['hurda_metal', 'mekanik_parca', 'gelistirme_cekirdegi'],
    products: ['tuzak', 'usta_takimi', 'mekanik_duzenek', 'guclendirme_parcasi']
  },
  {
    id: 'demirci',
    name: 'Demirci',
    description: 'Metal cevherlerini silah, zırh ve savunma ekipmanına dönüştürür.',
    maxLevel: RPG_MAX_PROFESSION_LEVEL,
    specializations: [
      { id: 'silah_ustaligi', name: 'Silah Ustalığı', description: 'Kılıç, balta, hançer, mızrak ve savaş silahları üretir.', focus: ['kilic', 'balta', 'hancer', 'mizrak', 'cekic'] },
      { id: 'zirh_kalkan_ustaligi', name: 'Zırh ve Kalkan Ustalığı', description: 'Ağır zırhlar, miğferler ve kalkanlar üretir.', focus: ['agir_zirh', 'miğfer', 'metal_kalkan', 'zincir_zirh'] },
      { id: 'usta_dovuculuk', name: 'Usta Dövücülük', description: 'Üst düzey alaşımları işleyerek seçkin silah ve zırhlar döver.', focus: ['usta_celigi', 'kadim_alasim', 'silah_dovme', 'zirh_dovme'] },
    ],
    primaryResources: ['metal_kulce', 'celik_kulce', 'komur', 'mekanik_parca'],
    products: ['demir_kilic', 'celik_balti', 'metal_zirh', 'metal_kalkan', 'metal_mizrak']
  },
  {
    id: 'derici',
    name: 'Derici',
    description: 'Postları işleyerek hafif zırh ve taşıma ekipmanları üretir.',
    maxLevel: RPG_MAX_PROFESSION_LEVEL,
    specializations: [
      { id: 'hafif_zirh', name: 'Hafif Zırh Ustalığı', description: 'Hareket kabiliyeti sağlayan deri zırhlar üretir.', focus: ['deri_zirh', 'deri_cizme', 'deri_eldiven'] },
      { id: 'canta_av', name: 'Çanta ve Av Ekipmanları', description: 'Çanta, sadak, kemer ve avcı ekipmanları hazırlar.', focus: ['canta', 'sadak', 'avci_kemeri', 'eyer'] },
      { id: 'binek_pet_donanimi', name: 'Binek ve Pet Donanımı', description: 'Binekler ve yoldaş petler için koruyucu ve işlevsel donanımlar üretir.', focus: ['eyer', 'kosum', 'pet_zirhi', 'binek_takimi'] },
    ],
    primaryResources: ['islenmis_deri', 'kurk', 'kadim_lif'],
    products: ['deri_zirh', 'deri_cizme', 'deri_eldiven', 'canta', 'sadak']
  },
  {
    id: 'mucevherci',
    name: 'Mücevherci',
    description: 'Değerli taşları takı, tılsım ve büyülü aksesuarlara dönüştürür.',
    maxLevel: RPG_MAX_PROFESSION_LEVEL,
    specializations: [
      { id: 'savas_mucevherleri', name: 'Savaş Mücevherleri', description: 'Saldırı ve kritik vuruş odaklı takılar üretir.', focus: ['saldiri_yuzugu', 'kritik_tasi', 'savas_kolyesi'] },
      { id: 'tilsim_koruma', name: 'Tılsım ve Koruma', description: 'Savunma, direnç ve özel etkili tılsımlar hazırlar.', focus: ['koruma_tilsimi', 'direnc_kolyesi', 'rune'] },
      { id: 'kadim_run_isciligi', name: 'Kadim Rün İşçiliği', description: 'Kadim yazıları ve rünleri değerli taşlara işleyerek özel eşyalar hazırlar.', focus: ['kadim_rune', 'run_tasi', 'rune_levhasi', 'kadim_tilsim'] },
    ],
    primaryResources: ['degerli_tas', 'altin_kulce', 'buyulu_kristal', 'inci'],
    products: ['yuzuk', 'kolye', 'tilsim', 'rune', 'muska']
  },
  {
    id: 'ciftci',
    name: 'Çiftçi',
    description: 'Mahsul, lif, meyve ve nadir bitkiler yetiştirir.',
    maxLevel: RPG_MAX_PROFESSION_LEVEL,
    specializations: [
      { id: 'tarim', name: 'Tarım ve Mahsul', description: 'Yiyecek ve üretim için temel tarım ürünleri yetiştirir.', focus: ['bugday', 'sebze', 'meyve', 'pamuk'] },
      { id: 'nadir_bitki', name: 'Nadir Bitki Yetiştiriciliği', description: 'Simya ve özel tariflerde kullanılan bitkiler yetiştirir.', focus: ['nadir_ot', 'buyulu_bitki', 'tohum', 'sifali_ot'] },
      { id: 'hayvancilik_ve_aricilik', name: 'Hayvancılık ve Arıcılık', description: 'Çiftlik hayvanları yetiştirir; bal, balmumu ve hayvansal ürünler elde eder.', focus: ['hayvan_yemi', 'ari_mumu', 'bal', 'sut', 'yumurta', 'yun'] },
    ],
    primaryResources: ['bugday', 'sebze', 'meyve', 'pamuk', 'keten', 'nadir_ot'],
    products: ['un', 'iplik', 'hasat_sepeti', 'bitki_yagi']
  },
  {
    id: 'balikci',
    name: 'Balıkçı',
    description: 'Tatlı su, tuzlu su ve derin deniz kaynaklarını toplar.',
    maxLevel: RPG_MAX_PROFESSION_LEVEL,
    specializations: [
      { id: 'derin_deniz', name: 'Derin Deniz Avcılığı', description: 'Nadir balıklar ve tehlikeli deniz canlıları yakalar.', focus: ['derin_deniz_baligi', 'deniz_pulu', 'deniz_yagi'] },
      { id: 'inci_hazine', name: 'İnci ve Deniz Hazineleri', description: 'İnci, deniz kabuğu ve batık hazine bulur.', focus: ['inci', 'deniz_kabugu', 'batik_hazine'] },
      { id: 'tatli_su_ustaligi', name: 'Tatlı Su Ustalığı', description: 'Nehir, göl ve iç sulardaki balıkları ve özel su kaynaklarını keşfeder.', focus: ['tatli_su_baligi', 'nehir_incisi', 'gol_otlari', 'tatli_su_hazinesi'] },
    ],
    primaryResources: ['tatli_su_baligi', 'tuzlu_su_baligi', 'derin_deniz_baligi', 'inci', 'deniz_kabugu'],
    products: ['balik_fileto', 'deniz_yagi', 'inci', 'deniz_pulu']
  },
  {
    id: 'asci',
    name: 'Aşçı',
    description: 'Yemekler ve özel öğünlerle karakterlere geçici faydalar sağlar.',
    maxLevel: RPG_MAX_PROFESSION_LEVEL,
    specializations: [
      { id: 'savas_yemekleri', name: 'Savaş Yemekleri', description: 'Savaşta saldırı, savunma ve dayanıklılık sağlayan yemekler hazırlar.', focus: ['et_yemegi', 'savascinin_tabagi', 'direnc_corba'] },
      { id: 'seyahat_yemekleri', name: 'Seyahat ve Destek Yemekleri', description: 'Keşif, dinlenme ve meslek çalışmalarını destekleyen yemekler yapar.', focus: ['yol_azigi', 'enerji_yemegi', 'kamp_yemegi'] },
      { id: 'solen_ve_ustalik_mutfagi', name: 'Şölen ve Ustalık Mutfağı', description: 'Büyük şölenler ve nadir malzemelerle özel ustalık yemekleri hazırlar.', focus: ['solen_yemegi', 'usta_sofrasi', 'nadir_baharat', 'ziyafet_tatlisi'] },
    ],
    primaryResources: ['bugday', 'sebze', 'meyve', 'et', 'tatli_su_baligi', 'tuzlu_su_baligi'],
    products: ['ekmek', 'corba', 'et_yemegi', 'yol_azigi', 'enerji_yemegi']
  }
];

export const getProfession = (id: string) =>
  RPG_PROFESSIONS.find(profession => profession.id === id);

export const getSpecialization = (professionId: string, specializationId: string) =>
  getProfession(professionId)?.specializations.find(
    specialization => specialization.id === specializationId
  );
