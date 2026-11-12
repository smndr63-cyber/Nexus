# NEXUS 1.1.0 — Komut Rehberi

NEXUS hem slash (`/`) hem prefix (`!`) komutlarını destekler. Aşağıdaki RPG komutları slash üzerinden kullanılabilir.

## Karakter ve ilerleme
- `/rpg-profil` — seviye, XP, özellikler, meslekler, ana uzmanlık, cüzdan ve pet özeti.
- `/istatistik-puan ozellik puan` — seviye atlayınca kazanılan özellik puanlarını dağıtır. Özellikler: güç, dayanıklılık, çeviklik, zekâ.
- `/ustalik` — 100. seviye sonrası sınırsız ustalık, ustalık XP'si, puanları, unvan ve kozmetik koleksiyonunu gösterir.
- `/uzmanlasma` — 11 meslekten birinin 3 uzmanlık dalından ana dal seçer. İlk seçim ücretsizdir; değişiklik ücretleri onaylanan artan tarifeye göre uygulanır.

## Dünya, keşif ve hikâye
- `/harita` — açık, keşfedilmiş ve kilitli bölgeleri gösterir.
- `/seyahat bolge` — açık bir bölgeye gider. Bölge kimliği haritada gösterilir.
- `/kesif` — bulunduğun bölgeden kaynak toplar; ilgili meslek XP'si ve görev ilerlemesi sağlar.
- `/hikaye` — sıradaki ana hikâye bölümünü ve seçimlerini gösterir.
- `/hikaye-sec bolum secim` — bölümde kalıcı bir karar verir. Kararlar sonraki hikâye ve bölge açılışlarını etkiler.
- `/kadim-bilgi` — sekiz kadim gücün öğretilerini gösterir.
- `/inanc` — sekiz inanç geleneğinin öğretilerini, ritüellerini ve kutsal yerlerini gösterir.
- `/kulturler` — kadim uygarlıkları, değerlerini ve kalıntılarını tanıtır.

## Görevler ve NPC'ler
- `/gorevler` — alınabilir ve devam eden görevleri listeler.
- `/gorev-al gorev` — uygun bir görevi başlatır.
- `/npc` — bulunduğun bölgedeki NPC'leri ve hizmetlerini gösterir.
- `/npc-konus npc` — bulunduğun bölgedeki NPC ile etkileşir ve uygun görev hedeflerini ilerletir.
- `/npc-pazar islem esya adet` — tüccardan eşya alır veya NPC’ye eşya satar. Satış fiyatı taban fiyatın %50’sidir; nadir stoklar sınırlı ve 24 saatte yenilenir.

## Meslek, tarif ve eşya
- `/tarifler meslek` — mesleğin tariflerini, seviye/ustalık/uzmanlık gereksinimlerini listeler.
- `/uret tarif adet` — öğrenilmiş tarifle üretim yapar. Malzemeler tüketilir; kalite ve meslek ilerlemesi hesaplanır.
- `/envanter` — RPG envanterini ve eşya örnek kimliklerini gösterir.
- `/kusak esya` — kuşanılabilir ekipman örneğini kuşanır. Pet ekipmanı için aktif pet seçili olmalıdır.
- `/ekipman-cikar yuva tur` — oyuncu veya aktif pet ekipman yuvasını boşaltır.
- `/pazar-ilan esya adet fiyat` — oyuncu pazarında ilan açar.
- `/pazar` — aktif oyuncu pazarı ilanlarını listeler.
- `/pazar-al ilan` — ilanı satın alır. Satıştan %5 pazar vergisi kesilir.
- `/pazar-iptal ilan` — kendi ilanını iptal edip eşyayı geri alır.

## Savaş ve bosslar
- `/yaratik-izle yaratik eylem` — bulunduğun bölgedeki yaratığın izini sürer, gözlem biriktirir veya araştırmasını tamamlar. Tam araştırma %10 savaş hasarı ve ganimet şansı bonusu sağlar.
- `/avla yaratik` — bulunduğun bölgedeki yaratıkla savaş başlatır.
- `/savas-hamle hamle` — saldırır, savunur veya savaştan kaçar.
- `/meslek-boss meslek` — meslek seviyene ve ustalığına uygun kademeli meslek bossunu çağırır.
- `/meslek-boss-hamle hamle` — meslek bossuna karşı hamle yapar.
- `/bosslar` — dünya bosslarını ve çağırma gereksinimlerini gösterir.
- `/boss-cagir boss` — grup lideri, uygun dört kişilik grubuyla dünya bossunu çağırır.
- `/boss-vur boss` — katıldığın aktif dünya bossuna saldırır.
- `/yaralanmalar` — aktif savaş yaralanmalarını ve tedavi gereksinimlerini gösterir.
- `/tedavi yaralanma esya` — uygun tedavi eşyasıyla yaralanmayı giderir.

## Petler
- `/petler` — sahip olunan petleri ve tür kataloğunu gösterir.
- `/pet-edin tur isim` — uygun sunu eşyasını tüketerek pet edinir. Nadirlik yükseldikçe gereken eşya miktarı/türü artar.
- `/pet-aktif pet` — aktif yoldaşını seçer.
- `/pet-besle pet yiyecek` — pet kategorisindeki yiyecekle peti besler.
- `/pet-sefer pet bolge` — peti keşif seferine gönderir.
- `/pet-sefer-al sefer` — tamamlanan seferin ganimetini alır.

## Grup ve ortak macera
- `/grup-kur` — en fazla dört kişilik geçici grup kurar.
- `/grup-davet hedef` — grup lideri olarak oyuncu davet eder. Davet iki dakika geçerlidir.
- `/grup-kabul grup` — daveti kabul eder.
- `/gruptan-ayril` — gruptan ayrılır; lider ayrılırsa liderlik devredilir.

## Ekonomi
- `/daily` — günlük giriş serisi ödülünü alır. Seri yedi günlük döngüyle büyüyen ödül ve yedinci gün bonusu verir.
- `/ekonomi`, `/balance`, `/deposit`, `/withdraw`, `/pay` — genel Nexus ekonomisi.
- `/coinflip`, `/dice`, `/slots`, `/blackjack` — güvenli bahis oyunları. Haftalık ödül komutu kaldırılmıştır.

## Slash yerine prefix ile kullanılabilen eski yardımcı komutlar
Discord'un 100 slash komut sınırını aşmamak için bazı daha az kullanılan yardımcı komutlar prefix üzerinden korunmuştur: `serverstats`, `leaderboard`, `zar`, `welcome`, `leave-message`, `nickname`, `rr`, `embed`, `role-info`, `channel-info`, `oda`, `custom`, `unban`, `unwarn`, `warnings`, `nowplaying`, `volume`, `loop`, `shuffle`, `remove`, `join`, `leave`, `avatar`, `say`.

## İçerik kataloğu
- 11 meslek, 33 uzmanlaşma dalı ve 66 üretim tarifi
- 207 eşya, 26 yaratık ve 9 bölge
- 12 görev, 21 NPC, 8 ana hikâye bölümü
- 11 meslek bossu, 5 dünya bossu ve 8 kadim güç
- 7 kadim kültür ve 8 pet türü

## Veri güvenliği
RPG ilerlemesi `UserData.rpg` alanında; grup, oyuncu pazarı ve dünya boss karşılaşmaları guild RPG alanında saklanır. İlk RPG şema geçişi eski RPG profillerini bir defa sıfırlar; cüzdan, banka, Discord XP/seviye ve bahis kayıtlarını korur. `data/database.json` bu teslim paketine dahil edilmez.
