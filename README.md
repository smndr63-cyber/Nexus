# NEXUS 1.0.21

Türkçe, embed ağırlıklı Discord sunucu yönetim botu.

## Öne çıkan sistemler
- Moderasyon: warn/unwarn, warnings, timeout/untimeout, kick, ban/unban, purge/sil, lock/unlock, slowmode
- Özel NEXUS yetkileri: kullanıcıya veya role komut erişimi verme/alma; mevcut ve verilebilecek yetkileri ayrı ayrı görme
- Ticket: destek/şikayet için ayrı roller, aynı kategori, sahiplenme/bırakma, transcript arşivi
- Loglar: mesaj, üye, rol, kanal, moderasyon, sunucu, ses, komut, ekonomi, ticket, reaction
- Özel ses odası: kapasite, görünürlük, kilit, üye erişimi, isim ve sahiplik yönetimi
- Seviye/istatistik: profil, seviye-top, mesaj-top, ses-top, genel sıralamalar
- Ekonomi: bakiye, günlük/haftalık ödül, çalışma, banka, transfer, coinflip, zar, slot, blackjack, zenginler
- Müzik: YouTube/Spotify arama ve link, yt-dlp + FFmpeg oynatma, kuyruk, nowplaying, pause/resume, skip, volume, loop, shuffle, remove, leave
- Reaction Roles, Welcome/Leave, çekiliş, özel komutlar, anket, öneri, hatırlatıcı, AFK
- Prefix (`!`) ve slash komutları

## Kurulum
1. `.env.example` dosyasını `.env` olarak kopyalayın.
2. `DISCORD_TOKEN`, `CLIENT_ID` ve yeni sunucu için `GUILD_ID` değerlerini girin.
3. `npm install`
4. `npm start`

Windows + Node 24 ortamında Discord TLS bağlantı kararlılığı için start script'i TLS 1.2 ile sınırlandırılmıştır.

## Önemli
- Bot rolünü yönetilecek rollerin üzerine taşıyın.
- Moderasyon komutları için Discord tarafındaki gerekli izinler ayrıca gereklidir.
- `/yetki` ile verilen NEXUS yetkileri Discord rol izinlerini değiştirmez; yalnızca NEXUS komut erişimini genişletir.
- Prefix `!purge 3` ve `!sil 3`, komut mesajı dahil olduğu için 3 kullanıcı mesajını temizlemek üzere bir mesaj fazlasını hedefler.

