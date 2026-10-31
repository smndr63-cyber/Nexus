# NEXUS Bot — Kurulum ve veri güvenliği

## Gereksinimler
- Node.js 22+
- Discord Developer Portal'da oluşturulmuş uygulama/bot
- Message Content Intent ve Server Members Intent

## Yerel kurulum
1. `.env.example` dosyasını `.env` olarak kopyalayın.
2. `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `PREFIX` alanlarını doldurun. Token'ı kimseyle paylaşmayın.
3. Çalıştırın:
   ```bash
   npm ci
   npm run build
   npm start
   ```

## RPG komutları
`/meslek`, `/work`, `/envanter`, `/market`, `/pazar`, `/uretim`, `/silahlar`, `/kusan`, `/gelistir`, `/parcala`, `/savas`, `/boss`.

## Veritabanı
Yerel kurulumda veriler `DATA_DIR` değişkeniyle belirlenen dizindeki `database.json` dosyasında tutulur (varsayılan `./data/database.json`). RPG geçişi eski kullanıcı verilerini silmeden yalnızca eksik alanları ekler. JSON dosyası okunamazsa bot boş veritabanıyla devam etmek yerine başlatmayı durdurur.

## Northflank canlı güncellemesi
Bu paket `data/database.json` içermez. Docker ortamı `/app/data` konumunda kalıcı volume ve mevcut canlı `database.json` dosyası bekler. `REQUIRE_EXISTING_DATABASE=true` koruması nedeniyle dosya yoksa veya boşsa bot başlamaz. Canlı veritabanını yedekleyip volume'a taşımadan dağıtmayın; ayrıntılar `UPGRADE-SAFETY.md` dosyasında.
