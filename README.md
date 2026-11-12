# NEXUS 1.1.0

Türkçe Discord sunucu yönetim botu ve modüler RPG oyun sistemi.

## Genel özellikler
- Moderasyon, özel NEXUS yetkileri, ticket, loglar, geçici ses odaları, welcome/leave ve çekilişler
- Discord XP/seviye sistemi ve sıralamalar
- Nexus ekonomisi, banka, transfer, günlük giriş serisi ve güvenli bahis oyunları
- Müzik oynatma, kuyruk ve kontrol komutları
- Prefix (`!`) ve slash komutları; Discord'un 100 slash komut sınırına uygun kayıt

## RPG özellikleri
- 11 meslek, 33 uzmanlaşma dalı, 66 üretim tarifi ve artan uzmanlaşma değiştirme tarifesi
- 100 karakter seviyesi; sonrasında sınırsız ustalık, ilk 100 ustalık seviyesinde puanlar ve sonrasında kozmetik/unvan koleksiyonu
- 207 eşya, envanter, ekipman, kalite ve üretim
- 9 bölge ve 9 yerleşim, sekiz tehdit seviyesi, bağlı harita rotaları, keşif, seyahat ve bölgesel kaynaklar
- 26 yaratık, iz sürme/araştırma, yetenek tabanlı sıra tabanlı PvE, yaralanma ve tedavi
- 11 meslek bossu ve en fazla dört kişilik gruplarla beş dünya bossu
- 8 pet türü, besleme, aktif yoldaş ve keşif seferleri
- 12 görev, 8 bölümlük dallanan ana hikâye, 21 NPC, şehir/bölge kültürü, sekiz kadim güç, sekiz inanç geleneği ve yedi kadim kültür
- Dört oyuncuya kadar geçici gruplar, iki dakikalık davet, NPC tüccarları ve oyuncu pazarı

## Kurulum
1. `.env.example` dosyasını `.env` olarak kopyalayın.
2. `DISCORD_TOKEN`, `CLIENT_ID` ve isteğe bağlı `GUILD_ID` değerlerini ayarlayın.
3. `npm ci`
4. `npm test`
5. `npm start`

## Belgeler
- `COMMANDS.md` — komutların ve RPG kullanımının tam listesi
- `RPG-REHBER.md` — RPG sistemleri ve ilerleme rehberi
- `UPGRADE-SAFETY.md` — canlı veritabanı ve dağıtım güvenliği

## Canlı veri güvenliği
Bu ZIP canlı `data/database.json` dosyasını içermez. Docker yapılandırması `DATA_DIR=/app/data` ve `REQUIRE_EXISTING_DATABASE=true` kullanır. Canlı veritabanı kalıcı volume üzerinde `/app/data/database.json` konumunda değilse bot boş veritabanıyla başlamayı reddeder. Bu korumayı kaldırmayın. Canlı dağıtımdan önce veritabanı yedeği alın ve `UPGRADE-SAFETY.md` adımlarını uygulayın.

## Testler
`npm test` önce TypeScript derlemesini yapar, ardından RPG servis ve katalog bütünlüğü testlerini çalıştırır.
