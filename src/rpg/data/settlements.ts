export interface RpgSettlementDefinition {
 id:string;name:string;regionId:string;type:'village'|'town'|'city'|'harbor'|'fortress'|'sanctuary'|'outpost'|'ruins';
 populationBand:string;description:string;services:string[];notableNpcIds:string[];
}
export const RPG_SETTLEMENTS:RpgSettlementDefinition[]=[
 {id:'yol_agzi',name:'Yol Ağzı Kasabası',regionId:'baslangic_duzlugu',type:'town',populationBand:'800–1.200',description:'Kervan yollarının kesiştiği, yeni maceracıların ilk sığınağı.',services:['genel tüccar','görev panosu','dinlenme alanı','macera loncası'],notableNpcIds:['turgut','maden_rehberi','kutlu','selcen']},
 {id:'yesil_yurt',name:'Yeşil Yurt',regionId:'yesilorman',type:'village',populationBand:'250–400',description:'Orman kıyısında, avcıların ve toplayıcıların kurduğu korunaklı köy.',services:['şifacı','izci rehberi','yerel görevler'],notableNpcIds:['bilge_tomris','denizci_salih','ayaz']},
 {id:'kok_sehri',name:'Kök Şehri',regionId:'kadim_orman',type:'sanctuary',populationBand:'100–180',description:'Kadim ağaçların kökleri arasına kurulmuş, doğa öğretilerini koruyan kutsal yerleşim.',services:['kadim arşiv','nadir eşya tüccarı','simya tezgâhı'],notableNpcIds:['narin','umay']},
 {id:'derin_ocak',name:'Derin Ocak',regionId:'derin_maden',type:'city',populationBand:'1.500–2.200',description:'Maden galerileri çevresinde büyümüş, demirci ve madencilerin güçlü yeraltı şehri.',services:['maden pazarı','demirci loncası','usta eğitimi'],notableNpcIds:['usta_kara']},
 {id:'sis_limani',name:'Sis Limanı',regionId:'sisli_sahil',type:'harbor',populationBand:'600–900',description:'Sis fenerinin gölgesinde balıkçılık ve kıyı ticaretiyle yaşayan liman kasabası.',services:['balıkçı pazarı','tekne iskelesi','denizci görevleri'],notableNpcIds:['derya']},
 {id:'muhur_kalesi',name:'Mühür Kalesi',regionId:'unutulmus_gecit',type:'fortress',populationBand:'80–140',description:'Geçit mühürlerini korumak için kurulmuş, bugün yarı terk edilmiş eski savunma kalesi.',services:['mühür arşivi','nöbetçi sığınağı','boss hazırlığı'],notableNpcIds:['muhur_nobetcisi']},
 {id:'ates_yurdu',name:'Ateş Yurdu',regionId:'ejderha_tepesi',type:'sanctuary',populationBand:'40–90',description:'Ejderha ateşinin izlerini inceleyen son ocakların yüksek dağ yerleşimi.',services:['kadim ocak','ejderha araştırması','usta zanaat'],notableNpcIds:['ates_bilgesi']},
 {id:'yitik_siginak',name:'Yitik Sığınak',regionId:'gizli_magara',type:'outpost',populationBand:'20–50',description:'Kayıp kâşiflerin ve mağara rehberlerinin kullandığı gizli yeraltı sığınağı.',services:['keşif kayıtları','yaralı bakımı','gizli görevler'],notableNpcIds:['kayip_kasif']},
 {id:'yitik_saray',name:'Yitik Saray',regionId:'karanlik_yar',type:'ruins',populationBand:'Yerleşik nüfus yok',description:'Karanlık Yâr’ın kalbinde, eski hükümdarlığın gölgelerle örtülmüş kalıntısı.',services:['son hikâye bölümü','dünya bossu sunağı','kadim emanetler'],notableNpcIds:['yitik_ses']}
];
export function getSettlement(id:string){return RPG_SETTLEMENTS.find(item=>item.id===id);}
export function getSettlementForRegion(regionId:string){return RPG_SETTLEMENTS.find(item=>item.regionId===regionId);}
