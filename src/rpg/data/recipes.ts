import type { RpgRecipe } from '../types';

export const RPG_RECIPES: RpgRecipe[] = [
  // DEMİRCİ — Silah ve metal ekipman
  {
    id: 'demir_kilic_tarifi',
    name: 'Demir Kılıç Üretimi',
    profession: 'demirci',
    ingredients: [
      { itemId: 'demir_cevheri', quantity: 4 },
      { itemId: 'hurda_metal', quantity: 2 },
      { itemId: 'sert_agac', quantity: 1 }
    ],
    outputItemId: 'demir_kilic',
    outputQuantity: 1,
    requiredLevel: 1,
    baseQuality: 50,
    difficulty: 10
  },
  {
    id: 'celik_balti_tarifi',
    name: 'Çelik Balta Üretimi',
    profession: 'demirci',
    ingredients: [
      { itemId: 'demir_cevheri', quantity: 5 },
      { itemId: 'hurda_metal', quantity: 4 },
      { itemId: 'mekanik_parca', quantity: 1 }
    ],
    outputItemId: 'celik_balti',
    outputQuantity: 1,
    requiredLevel: 8,
    requiredMastery: 10,
    baseQuality: 55,
    difficulty: 25
  },
  {
    id: 'celik_zirh_tarifi',
    name: 'Çelik Zırh Üretimi',
    profession: 'demirci',
    ingredients: [
      { itemId: 'demir_cevheri', quantity: 6 },
      { itemId: 'hurda_metal', quantity: 4 },
      { itemId: 'yaratik_derisi', quantity: 2 }
    ],
    outputItemId: 'celik_zirh',
    outputQuantity: 1,
    requiredLevel: 10,
    requiredMastery: 15,
    baseQuality: 55,
    difficulty: 30
  },
  {
    id: 'ahsap_kalkan_tarifi',
    name: 'Ahşap Kalkan Üretimi',
    profession: 'demirci',
    ingredients: [
      { itemId: 'sert_agac', quantity: 3 },
      { itemId: 'recine', quantity: 2 }
    ],
    outputItemId: 'ahsap_kalkan',
    outputQuantity: 1,
    requiredLevel: 1,
    baseQuality: 50,
    difficulty: 10
  },
  {
    id: 'celik_kalkan_tarifi',
    name: 'Çelik Kalkan Üretimi',
    profession: 'demirci',
    ingredients: [
      { itemId: 'demir_cevheri', quantity: 4 },
      { itemId: 'hurda_metal', quantity: 3 },
      { itemId: 'yaratik_derisi', quantity: 1 }
    ],
    outputItemId: 'celik_kalkan',
    outputQuantity: 1,
    requiredLevel: 7,
    requiredMastery: 10,
    baseQuality: 55,
    difficulty: 22
  },

  // ORMANCİ — Ahşap silah ve yay üretimi
  {
    id: 'avci_yayi_tarifi',
    name: 'Avcı Yayı Üretimi',
    profession: 'ormanci',
    ingredients: [
      { itemId: 'sert_agac', quantity: 4 },
      { itemId: 'yaratik_derisi', quantity: 2 },
      { itemId: 'yay_kirişi', quantity: 1 }
    ],
    outputItemId: 'avci_yayi',
    outputQuantity: 1,
    requiredLevel: 5,
    requiredMastery: 5,
    baseQuality: 50,
    difficulty: 20
  },

  // AVCI — Av ganimetlerinden ekipman
  {
    id: 'kemik_hancer_tarifi',
    name: 'Kemik Hançer Üretimi',
    profession: 'avci',
    ingredients: [
      { itemId: 'yaratik_derisi', quantity: 2 },
      { itemId: 'pençe', quantity: 3 },
      { itemId: 'demir_cevheri', quantity: 1 }
    ],
    outputItemId: 'kemik_hancer',
    outputQuantity: 1,
    requiredLevel: 6,
    requiredMastery: 8,
    baseQuality: 50,
    difficulty: 22
  },

  // DERİCİ — Deri koruma ekipmanları
  {
    id: 'deri_zirh_tarifi',
    name: 'Deri Zırh Üretimi',
    profession: 'derici',
    ingredients: [
      { itemId: 'yaratik_derisi', quantity: 4 },
      { itemId: 'sert_agac', quantity: 1 }
    ],
    outputItemId: 'deri_zirh',
    outputQuantity: 1,
    requiredLevel: 1,
    baseQuality: 50,
    difficulty: 12
  },
  {
    id: 'avci_basligi_tarifi',
    name: 'Avcı Başlığı Üretimi',
    profession: 'derici',
    ingredients: [
      { itemId: 'yaratik_derisi', quantity: 3 },
      { itemId: 'pençe', quantity: 1 }
    ],
    outputItemId: 'avci_basligi',
    outputQuantity: 1,
    requiredLevel: 3,
    requiredMastery: 5,
    baseQuality: 50,
    difficulty: 15
  },
  {
    id: 'gezgin_cizmesi_tarifi',
    name: 'Gezgin Çizmesi Üretimi',
    profession: 'derici',
    ingredients: [
      { itemId: 'yaratik_derisi', quantity: 2 },
      { itemId: 'sert_agac', quantity: 1 },
      { itemId: 'recine', quantity: 1 }
    ],
    outputItemId: 'gezgin_cizmesi',
    outputQuantity: 1,
    requiredLevel: 2,
    baseQuality: 50,
    difficulty: 12
  },

  // SİMYACI — İksir ve büyülü ekipman
  {
    id: 'mana_iksiri_tarifi',
    name: 'Mana İksiri Üretimi',
    profession: 'simyaci',
    ingredients: [
      { itemId: 'sifali_ot', quantity: 3 },
      { itemId: 'simya_ozu', quantity: 1 }
    ],
    outputItemId: 'mana_iksiri',
    outputQuantity: 1,
    requiredLevel: 1,
    baseQuality: 50,
    difficulty: 10
  },
  {
    id: 'kristal_asa_tarifi',
    name: 'Kristal Asa Üretimi',
    profession: 'simyaci',
    ingredients: [
      { itemId: 'sert_agac', quantity: 3 },
      { itemId: 'buyulu_kristal', quantity: 2 },
      { itemId: 'simya_ozu', quantity: 3 },
      { itemId: 'mekanik_parca', quantity: 1 }
    ],
    outputItemId: 'kristal_asa',
    outputQuantity: 1,
    requiredLevel: 15,
    requiredMastery: 25,
    baseQuality: 60,
    difficulty: 40
  },

  // ORTAK USTALIK — Kadim silah
  {
    id: 'kadim_mizrak_tarifi',
    name: 'Kadim Mızrak Üretimi',
    profession: 'zanaatkar',
    ingredients: [
      { itemId: 'sert_agac', quantity: 3 },
      { itemId: 'demir_cevheri', quantity: 4 },
      { itemId: 'kadim_lif', quantity: 1 },
      { itemId: 'simya_ozu', quantity: 1 }
    ],
    outputItemId: 'kadim_mizrak',
    outputQuantity: 1,
    requiredLevel: 15,
    requiredMastery: 25,
    baseQuality: 60,
    difficulty: 40
  },

  // Mesleklerin tamamına başlangıç ve uzmanlık ilerlemesi sağlayan ek tarifler.
  { id: 'kereste_isleme_tarifi', name: 'Kereste İşleme', profession: 'ormanci', ingredients: [{ itemId: 'sert_agac', quantity: 2 }, { itemId: 'recine', quantity: 1 }], outputItemId: 'kereste', outputQuantity: 1, requiredLevel: 1, baseQuality: 55, difficulty: 6 },
  { id: 'izci_yayi_tarifi', name: 'İzci Yayı Üretimi', profession: 'ormanci', ingredients: [{ itemId: 'kereste', quantity: 2 }, { itemId: 'yaratik_derisi', quantity: 1 }], outputItemId: 'yay', outputQuantity: 1, requiredLevel: 8, baseQuality: 55, difficulty: 13 },
  { id: 'cevher_kulce_tarifi', name: 'Cevherden Külçe', profession: 'madenci', ingredients: [{ itemId: 'demir_cevheri', quantity: 3 }, { itemId: 'komur', quantity: 1 }], outputItemId: 'metal_kulce', outputQuantity: 2, requiredLevel: 1, baseQuality: 55, difficulty: 6 },
  { id: 'kristal_isleme_tarifi', name: 'Kristal İşleme', profession: 'madenci', ingredients: [{ itemId: 'nadir_kristal', quantity: 2 }, { itemId: 'buyulu_kristal', quantity: 1 }], outputItemId: 'kristal', outputQuantity: 1, requiredLevel: 12, baseQuality: 55, difficulty: 17 },
  { id: 'avci_sadagi_tarifi', name: 'Avcı Sadak Üretimi', profession: 'avci', ingredients: [{ itemId: 'yaratik_derisi', quantity: 2 }, { itemId: 'sert_agac', quantity: 1 }], outputItemId: 'sadak', outputQuantity: 1, requiredLevel: 1, baseQuality: 55, difficulty: 6 },
  { id: 'iz_tuzagi_tarifi', name: 'İz Tuzağı Üretimi', profession: 'avci', ingredients: [{ itemId: 'mekanik_parca', quantity: 1 }, { itemId: 'yaratik_derisi', quantity: 1 }], outputItemId: 'iz_tuzagi', outputQuantity: 1, requiredLevel: 8, baseQuality: 55, difficulty: 13 },
  { id: 'mekanik_takim_tarifi', name: 'Mekanik Takım Üretimi', profession: 'zanaatkar', ingredients: [{ itemId: 'hurda_metal', quantity: 3 }, { itemId: 'mekanik_parca', quantity: 2 }], outputItemId: 'mekanik_takim', outputQuantity: 1, requiredLevel: 1, baseQuality: 55, difficulty: 6 },
  { id: 'usta_duzenegi_tarifi', name: 'Usta Düzeneği Üretimi', profession: 'zanaatkar', ingredients: [{ itemId: 'mekanik_takim', quantity: 1 }, { itemId: 'gelistirme_cekirdegi', quantity: 1 }], outputItemId: 'usta_duzenegi', outputQuantity: 1, requiredLevel: 18, baseQuality: 55, difficulty: 23 },
  { id: 'baslangic_yuzugu_tarifi', name: 'Başlangıç Yüzüğü', profession: 'mucevherci', ingredients: [{ itemId: 'degerli_tas', quantity: 1 }, { itemId: 'metal_kulce', quantity: 1 }], outputItemId: 'yuzuk', outputQuantity: 1, requiredLevel: 1, baseQuality: 45, difficulty: 5 },
  { id: 'kadim_tilsim_tarifi', name: 'Kadim Tılsım İşleme', profession: 'mucevherci', ingredients: [{ itemId: 'degerli_tas', quantity: 2 }, { itemId: 'buyulu_kristal', quantity: 1 }], outputItemId: 'tilsim', outputQuantity: 1, requiredLevel: 15, baseQuality: 55, difficulty: 20 },
  { id: 'run_levhasi_tarifi', name: 'Rün Levhası İşleme', profession: 'mucevherci', ingredients: [{ itemId: 'kadim_rune', quantity: 1 }, { itemId: 'nadir_kristal', quantity: 2 }], outputItemId: 'rune_levhasi', outputQuantity: 1, requiredLevel: 25, baseQuality: 55, difficulty: 30 },
  { id: 'tohum_ayirma_tarifi', name: 'Tohum Ayırma', profession: 'ciftci', ingredients: [{ itemId: 'bugday', quantity: 3 }], outputItemId: 'tohum', outputQuantity: 2, requiredLevel: 1, baseQuality: 55, difficulty: 6 },
  { id: 'hasat_sepeti_tarifi', name: 'Hasat Sepeti', profession: 'ciftci', ingredients: [{ itemId: 'bugday', quantity: 2 }, { itemId: 'meyve', quantity: 2 }], outputItemId: 'hasat_sepeti', outputQuantity: 1, requiredLevel: 8, baseQuality: 55, difficulty: 13 },
  { id: 'tatli_su_fileto_tarifi', name: 'Tatlı Su Filetosu', profession: 'balikci', ingredients: [{ itemId: 'tatli_su_baligi', quantity: 2 }], outputItemId: 'balik_fileto', outputQuantity: 2, requiredLevel: 1, baseQuality: 55, difficulty: 6 },
  { id: 'deniz_yagi_tarifi', name: 'Deniz Yağı İşleme', profession: 'balikci', ingredients: [{ itemId: 'tuzlu_su_baligi', quantity: 2 }, { itemId: 'deniz_otu', quantity: 1 }], outputItemId: 'deniz_yagi', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 15 },
  { id: 'yol_azigi_tarifi', name: 'Yol Azığı Hazırlama', profession: 'asci', ingredients: [{ itemId: 'bugday', quantity: 2 }, { itemId: 'meyve', quantity: 1 }], outputItemId: 'yol_azigi', outputQuantity: 2, requiredLevel: 1, baseQuality: 55, difficulty: 6 },
  { id: 'solen_sofrasi_tarifi', name: 'Şölen Sofrası', profession: 'asci', ingredients: [{ itemId: 'et', quantity: 2 }, { itemId: 'bal', quantity: 1 }, { itemId: 'nadir_baharat', quantity: 1 }], outputItemId: 'solen_yemegi', outputQuantity: 1, requiredLevel: 20, baseQuality: 55, difficulty: 25 },

  // Her uzmanlaşma dalına özel, dal seviyesi ve ustalık gerektiren üretimler.
  { id: 'ormanci_kerestecilik_uzmanlik_tarifi', name: 'Kerestecilik Özel Üretimi', profession: 'ormanci', specialization: 'kerestecilik', requiredSpecializationLevel: 1, requiredMastery: 0, ingredients: [{ itemId: 'sert_agac', quantity: 2 }, { itemId: 'recine', quantity: 1 }], outputItemId: 'kereste', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 10 },
  { id: 'ormanci_yay_ustaligi_uzmanlik_tarifi', name: 'Yay Ustaligi Özel Üretimi', profession: 'ormanci', specialization: 'yay_ustaligi', requiredSpecializationLevel: 2, requiredMastery: 10, ingredients: [{ itemId: 'sert_agac', quantity: 3 }, { itemId: 'recine', quantity: 2 }], outputItemId: 'yay', outputQuantity: 1, requiredLevel: 20, baseQuality: 60, difficulty: 20 },
  { id: 'ormanci_orman_koruyuculugu_uzmanlik_tarifi', name: 'Orman Koruyuculugu Özel Üretimi', profession: 'ormanci', specialization: 'orman_koruyuculugu', requiredSpecializationLevel: 3, requiredMastery: 25, ingredients: [{ itemId: 'sert_agac', quantity: 4 }, { itemId: 'recine', quantity: 3 }], outputItemId: 'orman_koruma', outputQuantity: 1, requiredLevel: 30, baseQuality: 65, difficulty: 30 },
  { id: 'madenci_metal_madenciligi_uzmanlik_tarifi', name: 'Metal Madenciligi Özel Üretimi', profession: 'madenci', specialization: 'metal_madenciligi', requiredSpecializationLevel: 1, requiredMastery: 0, ingredients: [{ itemId: 'demir_cevheri', quantity: 2 }, { itemId: 'komur', quantity: 1 }], outputItemId: 'metal_kulce', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 10 },
  { id: 'madenci_kristal_ustaligi_uzmanlik_tarifi', name: 'Kristal Ustaligi Özel Üretimi', profession: 'madenci', specialization: 'kristal_ustaligi', requiredSpecializationLevel: 2, requiredMastery: 10, ingredients: [{ itemId: 'demir_cevheri', quantity: 3 }, { itemId: 'komur', quantity: 2 }], outputItemId: 'kristal', outputQuantity: 1, requiredLevel: 20, baseQuality: 60, difficulty: 20 },
  { id: 'madenci_yeralti_kesifciligi_uzmanlik_tarifi', name: 'Yeralti Kesifciligi Özel Üretimi', profession: 'madenci', specialization: 'yeralti_kesifciligi', requiredSpecializationLevel: 3, requiredMastery: 25, ingredients: [{ itemId: 'demir_cevheri', quantity: 4 }, { itemId: 'komur', quantity: 3 }], outputItemId: 'derin_kristal', outputQuantity: 1, requiredLevel: 30, baseQuality: 65, difficulty: 30 },
  { id: 'avci_canavar_avciligi_uzmanlik_tarifi', name: 'Canavar Avciligi Özel Üretimi', profession: 'avci', specialization: 'canavar_avciligi', requiredSpecializationLevel: 1, requiredMastery: 0, ingredients: [{ itemId: 'yaratik_derisi', quantity: 2 }, { itemId: 'pençe', quantity: 1 }], outputItemId: 'yaratik_cekirdegi', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 10 },
  { id: 'avci_kurk_deri_uzmanlik_tarifi', name: 'Kurk Deri Özel Üretimi', profession: 'avci', specialization: 'kurk_deri', requiredSpecializationLevel: 2, requiredMastery: 10, ingredients: [{ itemId: 'yaratik_derisi', quantity: 3 }, { itemId: 'pençe', quantity: 2 }], outputItemId: 'islenmis_deri', outputQuantity: 1, requiredLevel: 20, baseQuality: 60, difficulty: 20 },
  { id: 'avci_iz_suruculugu_uzmanlik_tarifi', name: 'Iz Suruculugu Özel Üretimi', profession: 'avci', specialization: 'iz_suruculugu', requiredSpecializationLevel: 3, requiredMastery: 25, ingredients: [{ itemId: 'yaratik_derisi', quantity: 4 }, { itemId: 'pençe', quantity: 3 }], outputItemId: 'iz_tuzagi', outputQuantity: 1, requiredLevel: 30, baseQuality: 65, difficulty: 30 },
  { id: 'simyaci_savas_simyasi_uzmanlik_tarifi', name: 'Savas Simyasi Özel Üretimi', profession: 'simyaci', specialization: 'savas_simyasi', requiredSpecializationLevel: 1, requiredMastery: 0, ingredients: [{ itemId: 'sifali_ot', quantity: 2 }, { itemId: 'simya_ozu', quantity: 1 }], outputItemId: 'saldiri_iksiri', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 10 },
  { id: 'simyaci_sifa_simyasi_uzmanlik_tarifi', name: 'Sifa Simyasi Özel Üretimi', profession: 'simyaci', specialization: 'sifa_simyasi', requiredSpecializationLevel: 2, requiredMastery: 10, ingredients: [{ itemId: 'sifali_ot', quantity: 3 }, { itemId: 'simya_ozu', quantity: 2 }], outputItemId: 'saglik_iksiri', outputQuantity: 1, requiredLevel: 20, baseQuality: 60, difficulty: 20 },
  { id: 'simyaci_element_simyasi_uzmanlik_tarifi', name: 'Element Simyasi Özel Üretimi', profession: 'simyaci', specialization: 'element_simyasi', requiredSpecializationLevel: 3, requiredMastery: 25, ingredients: [{ itemId: 'sifali_ot', quantity: 4 }, { itemId: 'simya_ozu', quantity: 3 }], outputItemId: 'ates_ozu', outputQuantity: 1, requiredLevel: 30, baseQuality: 65, difficulty: 30 },
  { id: 'zanaatkar_mekanik_ustalik_uzmanlik_tarifi', name: 'Mekanik Ustalik Özel Üretimi', profession: 'zanaatkar', specialization: 'mekanik_ustalik', requiredSpecializationLevel: 1, requiredMastery: 0, ingredients: [{ itemId: 'hurda_metal', quantity: 2 }, { itemId: 'mekanik_parca', quantity: 1 }], outputItemId: 'tuzak', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 10 },
  { id: 'zanaatkar_gelistirme_ustaligi_uzmanlik_tarifi', name: 'Gelistirme Ustaligi Özel Üretimi', profession: 'zanaatkar', specialization: 'gelistirme_ustaligi', requiredSpecializationLevel: 2, requiredMastery: 10, ingredients: [{ itemId: 'hurda_metal', quantity: 3 }, { itemId: 'mekanik_parca', quantity: 2 }], outputItemId: 'guclendirme_parcasi', outputQuantity: 1, requiredLevel: 20, baseQuality: 60, difficulty: 20 },
  { id: 'zanaatkar_alet_duzenek_ustaligi_uzmanlik_tarifi', name: 'Alet Duzenek Ustaligi Özel Üretimi', profession: 'zanaatkar', specialization: 'alet_duzenek_ustaligi', requiredSpecializationLevel: 3, requiredMastery: 25, ingredients: [{ itemId: 'hurda_metal', quantity: 4 }, { itemId: 'mekanik_parca', quantity: 3 }], outputItemId: 'kesif_aleti', outputQuantity: 1, requiredLevel: 30, baseQuality: 65, difficulty: 30 },
  { id: 'demirci_silah_ustaligi_uzmanlik_tarifi', name: 'Silah Ustaligi Özel Üretimi', profession: 'demirci', specialization: 'silah_ustaligi', requiredSpecializationLevel: 1, requiredMastery: 0, ingredients: [{ itemId: 'metal_kulce', quantity: 2 }, { itemId: 'celik_kulce', quantity: 1 }], outputItemId: 'kilic', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 10 },
  { id: 'demirci_zirh_kalkan_ustaligi_uzmanlik_tarifi', name: 'Zirh Kalkan Ustaligi Özel Üretimi', profession: 'demirci', specialization: 'zirh_kalkan_ustaligi', requiredSpecializationLevel: 2, requiredMastery: 10, ingredients: [{ itemId: 'metal_kulce', quantity: 3 }, { itemId: 'celik_kulce', quantity: 2 }], outputItemId: 'metal_zirh', outputQuantity: 1, requiredLevel: 20, baseQuality: 60, difficulty: 20 },
  { id: 'demirci_usta_dovuculuk_uzmanlik_tarifi', name: 'Usta Dovuculuk Özel Üretimi', profession: 'demirci', specialization: 'usta_dovuculuk', requiredSpecializationLevel: 3, requiredMastery: 25, ingredients: [{ itemId: 'metal_kulce', quantity: 4 }, { itemId: 'celik_kulce', quantity: 3 }], outputItemId: 'usta_celigi', outputQuantity: 1, requiredLevel: 30, baseQuality: 65, difficulty: 30 },
  { id: 'derici_hafif_zirh_uzmanlik_tarifi', name: 'Hafif Zirh Özel Üretimi', profession: 'derici', specialization: 'hafif_zirh', requiredSpecializationLevel: 1, requiredMastery: 0, ingredients: [{ itemId: 'islenmis_deri', quantity: 2 }, { itemId: 'kurk', quantity: 1 }], outputItemId: 'deri_zirh', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 10 },
  { id: 'derici_canta_av_uzmanlik_tarifi', name: 'Canta Av Özel Üretimi', profession: 'derici', specialization: 'canta_av', requiredSpecializationLevel: 2, requiredMastery: 10, ingredients: [{ itemId: 'islenmis_deri', quantity: 3 }, { itemId: 'kurk', quantity: 2 }], outputItemId: 'canta', outputQuantity: 1, requiredLevel: 20, baseQuality: 60, difficulty: 20 },
  { id: 'derici_binek_pet_donanimi_uzmanlik_tarifi', name: 'Binek Pet Donanimi Özel Üretimi', profession: 'derici', specialization: 'binek_pet_donanimi', requiredSpecializationLevel: 3, requiredMastery: 25, ingredients: [{ itemId: 'islenmis_deri', quantity: 4 }, { itemId: 'kurk', quantity: 3 }], outputItemId: 'pet_zirhi', outputQuantity: 1, requiredLevel: 30, baseQuality: 65, difficulty: 30 },
  { id: 'mucevherci_savas_mucevherleri_uzmanlik_tarifi', name: 'Savas Mucevherleri Özel Üretimi', profession: 'mucevherci', specialization: 'savas_mucevherleri', requiredSpecializationLevel: 1, requiredMastery: 0, ingredients: [{ itemId: 'degerli_tas', quantity: 2 }, { itemId: 'buyulu_kristal', quantity: 1 }], outputItemId: 'saldiri_yuzugu', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 10 },
  { id: 'mucevherci_tilsim_koruma_uzmanlik_tarifi', name: 'Tilsim Koruma Özel Üretimi', profession: 'mucevherci', specialization: 'tilsim_koruma', requiredSpecializationLevel: 2, requiredMastery: 10, ingredients: [{ itemId: 'degerli_tas', quantity: 3 }, { itemId: 'buyulu_kristal', quantity: 2 }], outputItemId: 'koruma_tilsimi', outputQuantity: 1, requiredLevel: 20, baseQuality: 60, difficulty: 20 },
  { id: 'mucevherci_kadim_run_isciligi_uzmanlik_tarifi', name: 'Kadim Run Isciligi Özel Üretimi', profession: 'mucevherci', specialization: 'kadim_run_isciligi', requiredSpecializationLevel: 3, requiredMastery: 25, ingredients: [{ itemId: 'degerli_tas', quantity: 4 }, { itemId: 'buyulu_kristal', quantity: 3 }], outputItemId: 'kadim_rune', outputQuantity: 1, requiredLevel: 30, baseQuality: 65, difficulty: 30 },
  { id: 'ciftci_tarim_uzmanlik_tarifi', name: 'Tarim Özel Üretimi', profession: 'ciftci', specialization: 'tarim', requiredSpecializationLevel: 1, requiredMastery: 0, ingredients: [{ itemId: 'bugday', quantity: 2 }, { itemId: 'sebze', quantity: 1 }], outputItemId: 'un', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 10 },
  { id: 'ciftci_nadir_bitki_uzmanlik_tarifi', name: 'Nadir Bitki Özel Üretimi', profession: 'ciftci', specialization: 'nadir_bitki', requiredSpecializationLevel: 2, requiredMastery: 10, ingredients: [{ itemId: 'bugday', quantity: 3 }, { itemId: 'sebze', quantity: 2 }], outputItemId: 'buyulu_bitki', outputQuantity: 1, requiredLevel: 20, baseQuality: 60, difficulty: 20 },
  { id: 'ciftci_hayvancilik_ve_aricilik_uzmanlik_tarifi', name: 'Hayvancilik Ve Aricilik Özel Üretimi', profession: 'ciftci', specialization: 'hayvancilik_ve_aricilik', requiredSpecializationLevel: 3, requiredMastery: 25, ingredients: [{ itemId: 'bugday', quantity: 4 }, { itemId: 'sebze', quantity: 3 }], outputItemId: 'ari_mumu', outputQuantity: 1, requiredLevel: 30, baseQuality: 65, difficulty: 30 },
  { id: 'balikci_derin_deniz_uzmanlik_tarifi', name: 'Derin Deniz Özel Üretimi', profession: 'balikci', specialization: 'derin_deniz', requiredSpecializationLevel: 1, requiredMastery: 0, ingredients: [{ itemId: 'tuzlu_su_baligi', quantity: 2 }, { itemId: 'inci', quantity: 1 }], outputItemId: 'deniz_yagi', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 10 },
  { id: 'balikci_inci_hazine_uzmanlik_tarifi', name: 'Inci Hazine Özel Üretimi', profession: 'balikci', specialization: 'inci_hazine', requiredSpecializationLevel: 2, requiredMastery: 10, ingredients: [{ itemId: 'tuzlu_su_baligi', quantity: 3 }, { itemId: 'inci', quantity: 2 }], outputItemId: 'nehir_incisi', outputQuantity: 1, requiredLevel: 20, baseQuality: 60, difficulty: 20 },
  { id: 'balikci_tatli_su_ustaligi_uzmanlik_tarifi', name: 'Tatli Su Ustaligi Özel Üretimi', profession: 'balikci', specialization: 'tatli_su_ustaligi', requiredSpecializationLevel: 3, requiredMastery: 25, ingredients: [{ itemId: 'tuzlu_su_baligi', quantity: 4 }, { itemId: 'inci', quantity: 3 }], outputItemId: 'tatli_su_hazinesi', outputQuantity: 1, requiredLevel: 30, baseQuality: 65, difficulty: 30 },
  { id: 'asci_savas_yemekleri_uzmanlik_tarifi', name: 'Savas Yemekleri Özel Üretimi', profession: 'asci', specialization: 'savas_yemekleri', requiredSpecializationLevel: 1, requiredMastery: 0, ingredients: [{ itemId: 'et', quantity: 2 }, { itemId: 'bugday', quantity: 1 }], outputItemId: 'savascinin_tabagi', outputQuantity: 1, requiredLevel: 10, baseQuality: 55, difficulty: 10 },
  { id: 'asci_seyahat_yemekleri_uzmanlik_tarifi', name: 'Seyahat Yemekleri Özel Üretimi', profession: 'asci', specialization: 'seyahat_yemekleri', requiredSpecializationLevel: 2, requiredMastery: 10, ingredients: [{ itemId: 'et', quantity: 3 }, { itemId: 'bugday', quantity: 2 }], outputItemId: 'kamp_yemegi', outputQuantity: 1, requiredLevel: 20, baseQuality: 60, difficulty: 20 },
  { id: 'asci_solen_ve_ustalik_mutfagi_uzmanlik_tarifi', name: 'Solen Ve Ustalik Mutfagi Özel Üretimi', profession: 'asci', specialization: 'solen_ve_ustalik_mutfagi', requiredSpecializationLevel: 3, requiredMastery: 25, ingredients: [{ itemId: 'et', quantity: 4 }, { itemId: 'bugday', quantity: 3 }], outputItemId: 'solen_yemegi', outputQuantity: 1, requiredLevel: 30, baseQuality: 65, difficulty: 30 },

  { id: 'pet_tasmasi_tarifi', name: 'Yoldaş Tasması', profession: 'derici', ingredients: [{ itemId: 'yaratik_derisi', quantity: 2 }, { itemId: 'mekanik_parca', quantity: 1 }], outputItemId: 'pet_tasmasi', outputQuantity: 1, requiredLevel: 5, baseQuality: 55, difficulty: 8 },
  { id: 'pet_zirhi_tarifi', name: 'Yoldaş Zırhı', profession: 'derici', ingredients: [{ itemId: 'islenmis_deri', quantity: 4 }, { itemId: 'kemik', quantity: 2 }], outputItemId: 'pet_zirhi', outputQuantity: 1, requiredLevel: 10, baseQuality: 60, difficulty: 14 },
  { id: 'pet_tilsimi_tarifi', name: 'Yoldaş Tılsımı', profession: 'mucevherci', ingredients: [{ itemId: 'buyulu_kristal', quantity: 1 }, { itemId: 'degerli_tas', quantity: 2 }], outputItemId: 'pet_tilsimi', outputQuantity: 1, requiredLevel: 20, requiredMastery: 10, baseQuality: 65, difficulty: 22 },
];

export function getRpgRecipe(id: string): RpgRecipe | undefined {
  return RPG_RECIPES.find(recipe => recipe.id === id);
}

export function getRecipesForProfession(professionId: string): RpgRecipe[] {
  return RPG_RECIPES.filter(recipe => recipe.profession === professionId);
}

export function getRecipesForItem(itemId: string): RpgRecipe[] {
  return RPG_RECIPES.filter(recipe => recipe.outputItemId === itemId);
}
