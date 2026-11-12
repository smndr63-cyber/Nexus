# Changelog

## 1.1.0 — NEXUS RPG dünya ve ilerleme sürümü
- RPG karakter profili, 11 meslek ve 33 uzmanlaşma dalı için ilerleme servisleri tamamlandı.
- Uzmanlaşma XP'si ve dal seviyeleri eklendi; yalnızca global ana dal 3/3 seviyesine ilerleyebilir.
- 66 tarif, 207 eşya tanımı ve meslek/uzmanlık tarif kilitleri eklendi.
- Karakter seviyesi 100 sonrası sınırsız ustalık XP'si, ustalık puanları, unvanlar ve kozmetik ödüller eklendi.
- Özellik puanı dağıtımı, ekipman, envanter, üretim kalitesi ve eşya transferi servisleri eklendi.
- Dokuz bölge ve dokuz yerleşim, sekiz tehdit seviyesi, bağlı harita rotaları, sekiz bölümlük ana hikâye, sekiz kadim güç, sekiz inanç geleneği ve yedi kültür eklendi.
- 21 NPC ve on NPC rolü, NPC tüccar pazarı, görev ilerlemesi, 26 yaratık, iz sürme/araştırma, yetenek tabanlı PvE, yaralanma ve tedavi akışları eklendi.
- 11 meslek bossu, beş dünya bossu ve dört kişilik grup boss karşılaşmaları eklendi.
- Pet edinme, besleme, aktif yoldaş ve keşif seferleri eklendi.
- Dört kişilik geçici gruplar, iki dakikalık davet ve oyuncu pazarı komutları eklendi.
- Haftalık ödül kaldırıldı; yedi günlük döngü ve yedinci gün bonusu içeren günlük giriş serisi eklendi.
- Discord slash komutları 100 komut sınırını aşmayacak şekilde düzenlendi; eski yardımcı komutların bir bölümü prefix üzerinden korunuyor.
- RPG servisleri ve katalog referansları için otomatik test paketi eklendi.

## 1.0.27 — Nexus RPG başlangıç sürümü
- Meslek seçimi ve mesleğe göre farklı çalışma ödülü, cooldown ve malzeme düşürme eklendi.
- NPC marketi, oyuncu malzeme pazarı, üretim tarifleri ve güvenli ilan emanet sistemi eklendi.
- Silah, kalkan ve zırh kategorileri; silah kuşanma, +15'e kadar yükseltme ve parçalama eklendi.
- PvE savaşları ve sunucu çapında ortak boss canı/katılım ödülü eklendi.
- Veritabanı yazımı atomik geçici dosya + rename ile güçlendirildi; bozuk veritabanı bulunursa boş veritabanına düşmek yerine başlatma durduruluyor.
- Dağıtım paketinden `data/database.json` çıkarıldı. Canlı veriyi korumak için kalıcı depolama bağlanmadan botun başlaması engelleniyor.
- `/play` için interaction defer/editReply düzeltmesi geri eklendi.
- Docker imajına Python 3 eklendi; yt-dlp'nin Linux ortamında çalışması için.

## Veri güvenliği — önemli
Bu paket canlı veritabanını içermez. Eski RPG karakter ilerlemesi ve eski guild RPG kayıtları, onaylanan tek seferlik RPG yenileme geçişinde sıfırlanır. Cüzdan, banka, Discord XP/seviye, mesaj/ses istatistikleri, günlük ödül zamanları, bahis kayıtları ve RPG dışı sunucu verileri korunur. Canlı güncellemeden önce yine de eksiksiz veritabanı yedeği alınmalıdır.
