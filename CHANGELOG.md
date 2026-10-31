# Changelog

## 1.0.27 — Nexus RPG başlangıç sürümü
- Meslek seçimi ve mesleğe göre farklı çalışma ödülü, cooldown ve malzeme düşürme eklendi.
- NPC marketi, oyuncu malzeme pazarı, üretim tarifleri ve güvenli ilan emanet sistemi eklendi.
- Silah, kalkan ve zırh kategorileri; silah kuşanma, +15'e kadar yükseltme ve parçalama eklendi.
- PvE savaşları ve sunucu çapında ortak boss canı/katılım ödülü eklendi.
- Mevcut veritabanı alanlarını silmeden RPG alanlarını ekleyen uyumlu geçiş eklendi.
- Veritabanı yazımı atomik geçici dosya + rename ile güçlendirildi; bozuk veritabanı bulunursa boş veritabanına düşmek yerine başlatma durduruluyor.
- Dağıtım paketinden `data/database.json` çıkarıldı. Canlı veriyi korumak için kalıcı depolama bağlanmadan botun başlaması engelleniyor.
- `/play` için interaction defer/editReply düzeltmesi geri eklendi.
- Docker imajına Python 3 eklendi; yt-dlp'nin Linux ortamında çalışması için.

## Veri güvenliği — önemli
Bu paket canlı veritabanını içermez ve canlı sunucudaki veriyi kendi kendine yedekleyemez. Güncellemeden önce Northflank üzerindeki mevcut `data/database.json` dosyasının yedeği alınmalı ve aynı dosya `/app/data` konumuna bağlanan kalıcı depolamaya taşınmalıdır. Kalıcı depolama doğrulanmadan bu sürüm canlı servise dağıtılmamalıdır.
