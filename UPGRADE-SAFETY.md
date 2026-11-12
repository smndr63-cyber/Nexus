# NEXUS 1.1.0 — canlı sunucu güncelleme güvenliği

## Canlıya dağıtmadan önce
Bu sürüm, onaylanan yeni RPG mimarisine geçiş yapar. Eski RPG karakter ilerlemesi ve eski guild RPG kayıtları bir defa sıfırlanır. Bu işlem bilinçlidir ve geri alınamaz; bu nedenle dağıtımdan önce tam veritabanı yedeği zorunludur.

1. Northflank üzerindeki mevcut `data/database.json` dosyasını dışarı aktarın ve ayrı bir yedek olarak saklayın.
2. Kalıcı volume mount path değerinin `/app/data` olduğunu doğrulayın.
3. Mevcut canlı veritabanını volume içindeki `database.json` dosyasına yerleştirin.
4. Dosyanın boş olmadığını ve sunucu ID'leri ile `users` kayıtlarını içerdiğini doğrulayın.
5. `DATA_DIR=/app/data` ve `REQUIRE_EXISTING_DATABASE=true` ortam değişkenlerini koruyun.
6. Yalnızca bundan sonra 1.1.0 sürümünü dağıtın. Veritabanı koruma hatası görülürse volume bağlantısını kontrol etmeden tekrar tekrar dağıtmayın.
7. İlk açılıştan sonra eski RPG alanlarının temizlendiğini; coins, bank, Discord XP/seviye, mesaj/ses sayıları, bahis kayıtları, moderasyon vakaları ve sunucu ayarlarının korunduğunu doğrulayın.

## Geçiş davranışı
`rpgSchemaVersion` işareti guild başına bir defa uygulanır. İlk geçişte her kullanıcının eski `rpg` profili ve eski guild `rpg` verisi temizlenir; genel `inventory` alanına dokunulmaz. Yeni profil, yeni RPG servisleri tarafından ilk kullanımda oluşturulur. Ekonomi ve Discord ilerleme alanları değiştirilmez.

## Yerel doğrulama
1. `.env` dosyanı kendi makinen üzerinde koru; token'ı ZIP'e ekleme.
2. `npm ci`
3. `npm test`
4. Canlı veritabanı üzerinde deneme yapma; testler izole örnek profiller kullanır.

## Veri güvenliği
Bu paket canlı `data/database.json` dosyasını içermez. Docker, `/app/data/database.json` yoksa boş veritabanı oluşturarak devam etmek yerine başlatmayı reddeder. Bu korumayı kaldırmayın.
