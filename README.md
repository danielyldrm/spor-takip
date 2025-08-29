# SporTakip (Modern UI Sürümü)

Modern, cam (glass) görünümlü arayüz + koyu/açık tema ve 2 sabit kullanıcı ile haftalık spor planı.

## Özellikler
- 2 sabit kullanıcı (kod içinde): `danielyldrm / dani1` ve `mustafa / mustafa1`
- 7 günlük plan; her gün için egzersiz listesi
- Set / tekrar / not ekleme
- Egzersizleri liste içinde yukarı / aşağı taşıma
- Gün temizleme, gün kaydetme
- Modern arayüz (glass blur, gradyan, responsive)
- Dark / Light tema (localStorage + sistem tercihi)
- Mobilde yatay gün seçici; masaüstünde sol sidebar
- Tamamen vanilya JS (harici kütüphane yok)

## Kurulum
```bash
npm install
npm start
```
Tarayıcı: http://localhost:3000

## Yapı
- `server.js` Express + JWT
- `db.js` SQLite (sadece workout_days tablosu)
- `public/` statik dosyalar

## Kullanıcı Değiştirme
`server.js` içindeki `PLAIN_USERS` dizisini düzenle.

## Geliştirme Fikirleri
- Ağırlık / süre alanları
- Haftalar arası tarih (ör. isoWeek alanı ekle)
- JSON export / import
- İstatistik grafik (Chart.js)
- PWA (offline cache)
- PDF çıktı (print CSS)

İyi antrenmanlar! 💪