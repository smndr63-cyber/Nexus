# NEXUS 1.0.19 — Yeni/Düzeltilen Komutlar

## Profil
- `/profil` — kendi profilin.
- `/profil @kullanıcı` — hedef kullanıcının profilini gösterir.
- Profil kartındaki İstatistikler / Sıralama / Ekonomi butonları artık kartın hedef kullanıcısına bağlıdır.

## Ekonomi oyunları
- `/coinflip miktar` — Yazı/Tura butonlarından seçim yap.
- `/dice miktar` — bahisli zar; ilk komuttan sonra **Zar At** butonu.
- `/zar` — bahis yok. `sides` ile yüz sayısı, `count` ile zar adedi; `user` ile başka üyeyle karşılaştırma.
- `/slots miktar` — makaraları kısa animasyonla çevirir.
- `/blackjack miktar` — klasik kartlarla oynanır; **Kart Çek** / **Pas** butonları.

## Ses
- `/join` — botu ses kanalına getirir.
- `/play sorgu` — müzik çalar/kuyruğa ekler.
- `/queue`, `/pause`, `/resume`, `/skip`, `/stop`
- `/leave` — botu ses kanalından çıkarır.
- `/leave-message` — sunucudan ayrılan üyeler için mesaj ayarı.

## Diğer
- `/afk not` — AFK notu kaydeder ve ismin başına `[AFK]` ekler.
- `/custom name response` — özel prefix komutu; `{user}`, `{userTag}`, `{server}`, `{channel}`, `{memberCount}` değişkenleri kullanılabilir. Yanıt boş bırakılırsa komut silinir.
- Kanal kilidi `Budun` rolüne uygulanır.
- AutoMod 1.0.19'den kaldırılmıştır.

