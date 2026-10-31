# NEXUS 1.0.27 — RPG komutları

## Meslek ve çalışma
- `/meslek action:bilgi` — meslekleri ve mevcut uzmanlığı gösterir.
- `/meslek action:sec job:madenci` — ana mesleği seçer. Meslek değiştirme 7 günde bir; daha erken değil, değişim başına 500 ◈.
- `/work` — mesleğe özel cooldown, para ve malzeme ödülü.

Meslekler: `ormanci`, `madenci`, `avci`, `simyaci`, `zanaatkar`.

## Envanter ve pazar
- `/envanter` — malzeme, silah ve kuşanılmış ekipman.
- `/market action:liste` — NPC market listesi.
- `/market action:al item:demir_cevheri amount:2` — satın al.
- `/market action:sat item:demir_cevheri amount:2` — malzeme satışı; NPC fiyatının yarısı.
- `/pazar action:liste` — oyuncu ilanları.
- `/pazar action:ilan item:demir_cevheri amount:2 price:100` — malzeme ilanı.
- `/pazar action:al id:ILAN_ID` — ilanı satın al.
- `/pazar action:iptal id:ILAN_ID` — kendi ilanını iptal et.

## Ekipman ve savaş
- `/uretim item:demir_kilic` — malzemelerle silah üretir.
- `/silahlar` — silah ID'lerini gösterir.
- `/kusan id:SILAH_ID` — silah kuşanır; zırh için eşya kodu girilir.
- `/gelistir id:SILAH_ID` — silahı +15'e kadar geliştirir. Üst seviyeler farklı meslek malzemeleri ve boss özleri ister.
- `/parcala id:SILAH_ID` — silahı geliştirme malzemelerine ayırır.
- `/savas` — PvE savaşı.
- `/boss action:baslat`, `/boss action:durum`, `/boss action:saldir` — ortak boss karşılaşması.

## Önemli sınırlamalar
Bu, RPG altyapısının ilk oynanabilir sürümüdür. Doğrudan oyuncudan oyuncuya takas onay akışı, kapsamlı tur tabanlı PvP ve daha gelişmiş boss yetenekleri henüz dahil değildir; oyuncu malzeme pazarı ve ortak boss temel sürümde bulunur.
