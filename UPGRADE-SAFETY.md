# NEXUS 1.0.27 — canlı sunucu güncelleme güvenliği

## Bu ZIP'i hemen canlıya dağıtmayın
Canlı veritabanı dosyası önceki konteynerin geçici dosya sisteminde bulunuyorsa, yeni konteyner bu dosyaya otomatik erişemez. Bu paket `data/database.json` içermez ve `REQUIRE_EXISTING_DATABASE=true` ile veritabanı bulunmaz/boşsa başlamayı reddeder. Bu davranış istatistikleri sessizce sıfırlamak yerine servisi durdurmak için tasarlanmıştır.

## Dağıtımdan önce zorunlu işlemler
1. Northflank üzerinde çalışan eski `nexus-bot` servisini durdurmadan önce mevcut canlı `data/database.json` dosyasını dışarı aktarın ve ayrı bir yedek olarak saklayın.
2. Northflank servisine kalıcı bir volume/disk bağlayın ve mount path olarak `/app/data` seçin.
3. Canlı veritabanı yedeğini bu volume içindeki `database.json` dosyasına kopyalayın.
4. Dosyanın boş olmadığını ve içinde sunucu ID'leri ile `users` kayıtlarının bulunduğunu doğrulayın.
5. Yalnızca bundan sonra 1.0.27 sürümünü dağıtın. Başlangıç loglarında veritabanı koruma hatası görünürse servisi tekrar tekrar dağıtmayın; volume bağlantısını ve dosyayı kontrol edin.
6. İlk açılıştan sonra bir oyuncunun eski XP, seviye, mesaj/ses sayıları, para, uyarılar ve sunucu ayarlarının durduğunu doğrulayın.

## Neler korunur?
Veri geçişi mevcut guild/user nesnelerini değiştirmez; yalnızca eksik RPG alanlarını ekler. XP, level, messages, voiceSeconds, coins, bank, warnings, lastDaily/lastWeekly, moderasyon vakaları, özel yetkiler ve sunucu ayarları korunur. Yine de yedek alınmadan canlı güncelleme yapılmamalıdır.

## Yerel test
1. `.env` dosyanı kendi makinen üzerinde koru; token'ı paylaşma.
2. `npm ci`
3. `npm run build`
4. Yerel testte mevcut `data/database.json` dosyasını ayrı bir yedekle koru. `REQUIRE_EXISTING_DATABASE` değişkeni yerel `.env` dosyasında tanımlı değilse yeni test veritabanı oluşturulabilir.
