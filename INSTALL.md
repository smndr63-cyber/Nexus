# NEXUS Bot — Kurulum ve Discord Yetkileri

## 1) Gereksinimler
- Node.js 22+
- Discord Developer Portal'da Bot oluşturulmuş uygulama
- Message Content Intent
- Server Members Intent
- Presence Intent gerekmez; açılması şart değil.

## 2) Token
`.env.example` → `.env` yap.
- DISCORD_TOKEN: bot tokenı
- CLIENT_ID: application ID
- GUILD_ID: test sunucusu ID'si (önerilir; slash komutları anında gelir)
- PREFIX: ör. `!`
- AI_API_KEY: AI özelliği için
- AI_MODEL: kullanılacak model

## 3) Discord izinleri
Botun rolünü mümkün olduğunca işleyeceği rollerin üstüne koy. Önerilen izinler:
View Channels, Send Messages, Read Message History, Embed Links, Attach Files, Add Reactions, Manage Messages, Manage Channels, Manage Roles, Kick Members, Ban Members, Moderate Members, Move Members, Connect, Speak, Use Voice Activity, Manage Webhooks.

## 4) Çalıştırma
```bash
npm install
npm run build
npm start
```

İlk testte `GUILD_ID` kullanılması tavsiye edilir.

## 5) Prefix + slash
Her komut slash olarak kayıt edilir. Aynı komutların çoğu prefix ile de çalışır:
`!ping`, `!profil`, `!ban @üye`, `!play lo-fi`, vb.

## 6) Veri
Botun kalıcı verisi `data/database.json` içinde tutulur. Harici SQL sunucusu gerekmez.

## 7) AI
AI anahtarı verilmezse botun diğer özellikleri çalışır; yalnızca AI komutu devre dışı kalır.

## 8) Müzik
Müzik için `@discordjs/voice` ve `play-dl` kurulur. FFmpeg'in sistem PATH'inde bulunması tavsiye edilir.

## 1.0.6 notu
AI şimdilik kapalıdır; `.env` içinde `AI_ENABLED=false` bırakın. Test sunucusunda `/ticket` komutunu Administrator yetkisiyle çalıştırarak ticket panelini kurabilirsiniz.

