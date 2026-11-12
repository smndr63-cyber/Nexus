export interface RpgAncientPower { id:string; name:string; domain:string; symbol:string; teaching:string; regionIds:string[]; }
export interface RpgAncientCulture { id:string; name:string; regionIds:string[]; summary:string; values:string[]; relics:string[]; }
export const RPG_ANCIENT_POWERS: RpgAncientPower[] = [
 {id:'kor',name:'Korun Ateşi',domain:'cesaret, dönüşüm ve irade',symbol:'🔥',teaching:'Ateş yıkmak için değil, karanlıkta yol açmak için yanar.',regionIds:['baslangic_duzlugu','ejderha_tepesi']},
 {id:'kok',name:'Kökün Hafızası',domain:'yaşam, doğa ve süreklilik',symbol:'🌿',teaching:'Kökünü unutan dal, ilk fırtınada yönünü kaybeder.',regionIds:['yesilorman','kadim_orman']},
 {id:'tas',name:'Taşın Sözü',domain:'dayanıklılık, emek ve zanaat',symbol:'⛰️',teaching:'Kalıcı olan, sabırla biçim verilendir.',regionIds:['derin_maden','gizli_magara']},
 {id:'yel',name:'Yelin Özgürlüğü',domain:'hareket, keşif ve değişim',symbol:'🌬️',teaching:'Yol, yürüyenin cesaretiyle görünür olur.',regionIds:['sisli_sahil','baslangic_duzlugu']},
 {id:'su',name:'Suyun Belleği',domain:'şifa, uyum ve bilgelik',symbol:'💧',teaching:'Su, engeli gücüyle değil sabrıyla aşar.',regionIds:['sisli_sahil','unutulmus_gecit']},
 {id:'yildiz',name:'Yıldızın Rehberi',domain:'umut, yön ve kader',symbol:'✨',teaching:'En uzun gecede bile yönünü arayan ışığı bulur.',regionIds:['ejderha_tepesi','karanlik_yar']},
 {id:'golge',name:'Gölgenin Sınırı',domain:'sır, korku ve yüzleşme',symbol:'🌑',teaching:'Kendi gölgesini tanımayan, başkasının karanlığında kaybolur.',regionIds:['unutulmus_gecit','karanlik_yar']},
 {id:'zaman',name:'Zamanın Döngüsü',domain:'hafıza, bedel ve yenilenme',symbol:'⌛',teaching:'Her seçim bir iz bırakır; hiçbir iz bütünüyle silinmez.',regionIds:['gizli_magara','kadim_orman']}
];
export const RPG_ANCIENT_CULTURES: RpgAncientCulture[] = [
 {id:'duzluk_birligi',name:'Düzlük Birliği',regionIds:['baslangic_duzlugu'],summary:'Kervan yollarını ve ortak yaşamı koruyan yerleşim toplulukları.',values:['dayanışma','konukseverlik','sözünde durmak'],relics:['yolcu_mührü','eski_kervan_haritasi']},
 {id:'yesil_koruyucular',name:'Yeşil Koruyucular',regionIds:['yesilorman','kadim_orman'],summary:'Ormanla uyum içinde yaşayan, kaynakları gelecek kuşaklar için koruyan topluluk.',values:['denge','sabır','emanet bilinci'],relics:['kök_tableti','orman_tacı']},
 {id:'derin_ocaklar',name:'Derin Ocaklar',regionIds:['derin_maden','gizli_magara'],summary:'Taş işçiliği ve maden ustalığıyla tanınan yeraltı şehirlerinin halkı.',values:['ustalık','dürüst emek','dayanıklılık'],relics:['ilk_örs','maden_mührü']},
 {id:'sis_denizcileri',name:'Sis Denizcileri',regionIds:['sisli_sahil'],summary:'Sisli kıyılarda deniz fenerleri ve ticaret rotaları kuran deniz toplulukları.',values:['cesaret','yol arkadaşlığı','öngörü'],relics:['fener_merceği','inci_pusula']},
 {id:'gecit_nobetcileri',name:'Geçit Nöbetçileri',regionIds:['unutulmus_gecit'],summary:'Eski geçitleri ve mühür taşlarını korumakla görevli unutulmuş muhafızlar.',values:['sadakat','ölçülülük','hafıza'],relics:['nöbetçi_mührü','gölge_levhası']},
 {id:'ates_soyu',name:'Ateş Soyu',regionIds:['ejderha_tepesi'],summary:'Ejderha ateşini bir güç değil, sorumluluk olarak gören eski ocaklar.',values:['özdenetim','cesaret','sorumluluk'],relics:['kor_çekirdeği','kanat_kazısı']},
 {id:'yitikler',name:'Yitikler',regionIds:['karanlik_yar'],summary:'Karanlık Yâr’ın felaketinden sonra adları ve kayıtları silinmiş halk.',values:['hafızayı yaşatmak','bedel ödemek','umut'],relics:['yitik_kitabe','son_yemin']}
];
export function getAncientPower(id:string){return RPG_ANCIENT_POWERS.find(item=>item.id===id);}
export function getAncientCulture(id:string){return RPG_ANCIENT_CULTURES.find(item=>item.id===id);}

export interface RpgFaithTradition { id:string;name:string;powerId:string;belief:string;ritual:string;taboo:string;holySite:string; }
export const RPG_FAITH_TRADITIONS:RpgFaithTradition[]=[
 {id:'kor_ocagi',name:'Kor Ocağı Öğretisi',powerId:'kor',belief:'Ateşin gücü, onu taşıyanın iradesi ve sorumluluğuyla ölçülür.',ritual:'Yeni bir yolculuk öncesi ocakta küçük bir kor bırakılır.',taboo:'Öfkeyle yakmak ve korunmasını üstlendiğin ateşi terk etmek.',holySite:'Ateş Yurdu’nun İlk Ocak Salonu'},
 {id:'kok_yemini',name:'Kök Yemini',powerId:'kok',belief:'Yaşam bir emanettir; alınan her kaynak yerine yenisi bırakılmalıdır.',ritual:'Mevsim dönüşünde bir fidan dikilir ve geçmiş kuşaklar anılır.',taboo:'Kutsal korulukları çıkar için yok etmek.',holySite:'Kök Şehri’nin Yaşlı Ağacı'},
 {id:'tas_ahdi',name:'Taş Ahdi',powerId:'tas',belief:'Emek ve söz, zamanın aşındıramadığı iki mirastır.',ritual:'Usta, ilk eserinin küçük bir parçasını ortak ocağa bırakır.',taboo:'Emeği çalmak veya verilen sözü bilerek bozmak.',holySite:'Derin Ocak’ın İlk Örsü'},
 {id:'yel_yolu',name:'Yel Yolu',powerId:'yel',belief:'Özgürlük, başkasının yolunu kapatmadan kendi yolunu seçmektir.',ritual:'Yolcular rüzgâr yönüne bakıp gidecekleri rotayı yüksek sesle söyler.',taboo:'Kılavuzluk isteyen yolcuyu bilerek yanlış yola sürmek.',holySite:'Yol Ağzı’nın Dört Rüzgâr Taşı'},
 {id:'su_hafizasi',name:'Su Hafızası',powerId:'su',belief:'Şifa, merhamet ve dengeyle tamamlanır.',ritual:'Şifa bulan kişi kaynağa temiz su dökerek teşekkür eder.',taboo:'İçme suyunu zehirlemek veya ihtiyaç sahibinden esirgemek.',holySite:'Sis Limanı’nın Sessiz Pınarı'},
 {id:'yildiz_rehberi',name:'Yıldız Rehberleri',powerId:'yildiz',belief:'Umut, karanlığı inkâr etmek değil; karanlıkta yön bulmaktır.',ritual:'Gece yolculuklarında ilk görülen yıldıza bir dilek emanet edilir.',taboo:'Yolunu kaybedenleri bilerek yalnız bırakmak.',holySite:'Ateş Yurdu’nun Gökkubbe Terası'},
 {id:'golge_nobeti',name:'Gölge Nöbeti',powerId:'golge',belief:'Korku saklandıkça büyür; yüzleşildiğinde sınırını bulur.',ritual:'Nöbetçiler karanlık geçitlerde birbirlerine gerçek adlarını söyler.',taboo:'Bir başkasının korkusunu onu yönetmek için kullanmak.',holySite:'Mühür Kalesi’nin Gece Avlusu'},
 {id:'zaman_dongusu',name:'Zaman Döngüsü',powerId:'zaman',belief:'Her karar bir bedel ve bir hatıra bırakır; geçmişten ders almak gerekir.',ritual:'Yıl sonunda eski bir kayıt okunur ve yeni bir söz yazılır.',taboo:'Geçmişin hatalarını bilerek tekrarlayıp sorumluluktan kaçmak.',holySite:'Yitik Saray’ın Saat Taşı'}
];
export function getFaithTradition(id:string){return RPG_FAITH_TRADITIONS.find(item=>item.id===id);}
