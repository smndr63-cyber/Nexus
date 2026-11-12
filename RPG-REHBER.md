# NEXUS RPG — Oyuncu Rehberi

## İlk adımlar
1. `/rpg-profil` ile karakterini görüntüle.
2. `/harita` ile açık bölgeleri incele.
3. `/kesif` ile başlangıç kaynaklarını topla.
4. `/gorevler` ile görevleri gör ve `/gorev-al` ile bir görev başlat.
5. `/tarifler meslek:ormanci` benzeri komutla meslek tariflerini incele.
6. Malzemelerin varsa `/uret` ile üretim yap.
7. `/yaratik-izle` ile yaratık izlerini araştır; ardından `/avla` ile meydan oku.

## Meslek ve uzmanlaşma
Her oyuncu 11 mesleğin tamamını geliştirebilir. Her meslekte üç uzmanlaşma dalı bulunur. Dalların başlangıç seviyesi 1/3'tür; yalnızca global olarak seçili ana uzmanlaşma 2/3 ve 3/3 seviyelerine ilerleyebilir. Meslek XP'si seçili dalın uzmanlaşma XP'sine de katkı sağlar. Ana dal değiştirildiğinde önceki dal 1/3'e döner; meslek seviyesi ve meslek XP'si korunur.

İlk ana uzmanlık seçimi ücretsizdir. Sonraki değişiklik ücretleri: 500, 1.000, 2.000, 3.500, 5.000, 7.500 ve yedinci değişiklikten itibaren 10.000 ◈.

## Karakter ve ustalık
Karakter seviyesi 1–100 arasındadır. Seviye atlamak özellik puanı verir; bunlar güç, dayanıklılık, çeviklik ve zekâ arasında `/istatistik-puan` ile dağıtılır. 100. seviyeden sonra karakter XP'si sınırsız ustalık XP'sine dönüşür. İlk 100 ustalık seviyesi ustalık puanı verir; sonraki seviyeler ağırlıklı olarak unvan ve kozmetik koleksiyon ödülleri sunar.

## Dünya ve hikâye
Dünya dokuz bölge ve dokuz yerleşimden oluşur ve tehdit seviyeleri 1–8 aralığındadır. Yeni bölgeler karakter seviyesi, görev ve ana hikâye kararlarıyla açılır. Bölgeler birbirine bağlı bir rota ağı oluşturur; doğrudan komşu olmayan yere atlayamazsın. Seyahat sonrası kaynak toplayabilir, yaratıklarla savaşabilir, NPC'lerle konuşabilir ve bölgesel görevleri ilerletebilirsin.

Ana hikâye sekiz bölümden oluşur ve 1, 5, 15, 25, 35, 45, 55 ve 65. seviyelerde sırayla açılır. Her bölümde yaptığın seçim kaydedilir; seçimler sonraki bölümlerin ve bölgelerin açılmasını etkiler. Bölge erişimi için ilgili görev zincirini de tamamlamalısın. Sekiz kadim güç, sekiz inanç geleneği ve yedi kadim kültür dünya tarihinin temelini oluşturur. `/kadim-bilgi`, `/inanc` ve `/kulturler` komutları bu bilgileri sunar.

## Savaş, yaralanma ve bosslar
Savaşta saldırı, savunma veya kaçış hamlesi seçilir. Silah ve zırh istatistikleri ile aktif pet desteği savaş sonucunu etkiler. Yenilgi geçici yaralanma oluşturabilir. `/yaralanmalar` ile yaralarını görüp gereken iksir/öz ile `/tedavi` kullanabilirsin.

Her mesleğin üç kademeli bossu vardır. Dünya bossları grup gerektirir; grup üst sınırı dört oyuncudur. Çağırma malzemeleri grup liderinin envanterinden tüketilir ve boss yenildiğinde katılımcılar ödül alır.

## Petler
Pet edinmek için türün nadirliğine uygun sunu eşyası gerekir. Petleri beslemek bağ ve açlık değerlerini etkiler; aynı zamanda sağlık ve enerji yeniler. Derici ve mücevherci tarifleriyle pet zırhı, tasması ve tılsımı üretilebilir; `/kusak` aktif pet ekipmanını da kuşandırır. Aktif pet savaşta destek verir. Petler keşif seferine gönderilebilir; sefer tamamlanınca ganimet alınır.

## Pazar ve grup
Tüccar NPC’lerden temel eşyaları alabilir, nadir stokları sınırlı miktarda bulabilirsin; NPC’ye satış taban fiyatın %50’sinden yapılır. Oyuncu pazarı ilanlarında eşya satabilir; satın alma işleminde %5 pazar vergisi uygulanır. Geçici gruplar ücretsizdir, en fazla dört kişidir ve davetler iki dakika geçerlidir. Davet kabul edilmeden gruba katılım olmaz.
