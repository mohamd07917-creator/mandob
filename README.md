# مندوب — تطبيق إدارة الإيجارات 🏘️

تطبيق PWA احترافي لإدارة بيوت الإيجار والعمولات، مبني بـ Firebase Firestore.

## المميزات
- 🔥 مزامنة فورية مع Firebase Firestore
- 📱 PWA — يُثبَّت على الموبايل كتطبيق حقيقي
- 💰 تتبع العمولات تلقائياً
- 🏠 إضافة بيوت مع صور متعددة
- 📋 سجل التأجيرات (تأجيري + طرف ثالث)
- 🔍 بحث وفلترة متقدمة
- 🌙 واجهة داكنة أنيقة

## هيكل الملفات
```
mandob/
├── index.html      ← التطبيق الرئيسي
├── sw.js           ← Service Worker (PWA)
├── manifest.json   ← PWA Manifest
├── .nojekyll       ← GitHub Pages config
└── icons/          ← أيقونات التطبيق
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    └── icon-512.png
```

## Firebase Setup
الكونفج موجود مباشرة في index.html — Project: `mandob-e86e3`

## Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---
صُنع بـ ❤️ لمندوبتي الجميلة
