# NEXUS 1.0.27

Türkçe, embed ağırlıklı Discord sunucu yönetim botu ve başlangıç RPG sistemi.

## Özellikler
- Moderasyon: warn/unwarn, warnings, timeout/untimeout, kick, ban/unban, purge/sil, lock/unlock, slowmode
- Özel NEXUS yetkileri, ticket, loglar, geçici ses odaları, welcome/leave, reaction roles ve çekilişler
- Seviye/istatistik: profil, seviye-top, mesaj-top, ses-top ve sıralamalar
- Ekonomi: bakiye, günlük/haftalık ödül, banka, transfer ve ekonomi oyunları
- RPG meslekleri: Ormancı, Madenci, Avcı, Simyacı, Zanaatkâr; mesleğe göre kazanç, bekleme ve malzeme
- RPG ekipmanı: kılıç, yay, balta, hançer, asa, mızrak; zırh, kalkan, başlık ve çizme
- NPC marketi, oyuncu malzeme pazarı, üretim, silah kuşanma, +15'e kadar geliştirme ve parçalama
- PvE savaşları ve ortak sunucu bossu
- Müzik: YouTube/Spotify arama ve bağlantı, yt-dlp + FFmpeg, kuyruk ve oynatma kontrolleri
- Prefix (`!`) ve slash komutları

## Kurulum
1. `.env.example` dosyasını `.env` olarak kopyalayın.
2. `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID` değerlerini ayarlayın.
3. `npm ci`
4. `npm run build`
5. `npm start`

## RPG komutları
- `/meslek` — meslekleri görüntüle veya bir meslek seç.
- `/work` — mesleğe göre para ve malzeme kazan.
- `/envanter`, `/silahlar` — kaynak ve ekipmanlarını görüntüle.
- `/market` — NPC marketi; ürünleri satın al veya malzeme/silah sat.
- `/pazar` — oyuncu malzeme ilanları oluştur, satın al veya iptal et.
- `/uretim` — tariflerle silah veya zırh üret.
- `/kusan` — silah/zırh kuşan.
- `/gelistir` — silahı +15'e kadar yükselt; nadirlik yükseltmeyi engellemez.
- `/parcala` — silahı geliştirme malzemelerine ayır.
- `/savas` — PvE karşılaşması.
- `/boss` — ortak sunucu bossu başlat, durumunu gör veya saldır.

## Canlı veri güvenliği — okumadan dağıtmayın
Bu ZIP, canlı `data/database.json` dosyasını özellikle içermez. Northflank için Docker imajı `DATA_DIR=/app/data` ve `REQUIRE_EXISTING_DATABASE=true` kullanır. Mevcut canlı veritabanı kalıcı bir volume üzerinde `/app/data/database.json` konumunda bulunmazsa bot **boş veritabanıyla başlamayı reddeder**. Bu, oyuncu istatistiklerinin sessizce sıfırlanmasını önlemek için bilinçli bir korumadır.

Canlı güncellemeden önce `UPGRADE-SAFETY.md` adımlarını izleyin. Eski servisin veritabanı yedeğini almadan ve kalıcı depolamaya taşımadan yeni sürümü dağıtmayın.
