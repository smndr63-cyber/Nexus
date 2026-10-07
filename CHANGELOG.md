# Changelog

## 1.0.22
- Blackjack kart görselleri kaldırıldı; oyun metin/emoji görünümüne döndü.
- Coinflip cooldown düzeltildi ve tamamlanan oyun açık oyun olarak kalmıyor.
- Kick/ban DM bildirimleri kaldırıldı; botun kullanıcıya DM gönderme davranışı kapatıldı.
- Ekonomi bölümüne yalnızca `OWNER_IDS` içindeki bot sahibinin kullanabildiği `/paraekle` eklendi.
- `/bot` komutu kaldırıldı.

# NEXUS Changelog

## 1.0.21
- Eski çalışan Nexus müzik botunun yt-dlp + FFmpeg altyapısı NEXUS'a entegre edildi.
- `/play` YouTube araması/linki ve public Spotify tekli parça çözümlemesi kullanır.
- Müzik kuyruğu, nowplaying, pause/resume, skip, volume, loop, shuffle ve remove kontrolleri eklendi.
- yt-dlp Windows ikilisi pakete dahil edildi.
- `/afk` slash komutuna sebep alanı eklendi; mention yanıtı gerçek sebebi gösterir.
- Blackjack için 52 kartlık görsel deste ve kapalı krupiye kartı eklendi.
- Coinflip sonucundan sonra aynı bahisle yeni Yazı/Tura turu başlatan butonlar ve animasyonlu coin GIF'i eklendi.
- Mevcut temp voice, ticket claim/release ve diğer 1.0.19 davranışları korunmuştur.

## 1.0.23
- Coinflip replay buttons and command use now share a 5-second cooldown; completed games can be replayed from the buttons.
- `/paraekle` remains owner-only but now accepts a target user, so the owner can add currency to other users.

## 1.0.23
- Coinflip: completed rounds can be replayed from the result buttons after a 5-second cooldown; `/coinflip` also uses the same 5-second cooldown.
- `/paraekle` remains owner-only but now accepts a target user so the owner can add currency to other members.

