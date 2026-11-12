# جرد الأصول — Growfolo

**تاريخ الفحص:** 10 نوفمبر 2026
**المصدر:** `frontend/public/` داخل المستودع (أصول المشروع نفسه)

---

## 1. صور منتجات حقيقية موجودة بالفعل ✅

| الملف | الحجم | يُستخدم لـ |
|---|---:|---|
| `exclusive-offers/claude-pro.jpg` | 158 KB | Claude Pro |
| `exclusive-offers/claude-max-5x.jpg` | 166 KB | Claude Max 5x |
| `exclusive-offers/claude-max-20x.jpg` | 205 KB | Claude Max 20x |
| `newsletter-strip/chatgpt.jpg` | 20 KB | ChatGPT Plus |
| `important-info/claude-cloud-lifetime.jpg` | 266 KB | Claude Opus 4.8 (Lifetime) |
| `ads-section/ad-claude-cloud-lifetime.jpg` | 74 KB | بانر إعلاني |

> **هذه أصول Growfolo الخاصة ولا تحتاج أي إذن خارجي.** استُخدمت مباشرة في الكتالوج.

## 2. أصول إضافية قابلة لإعادة الاستخدام

| المجلد | المحتوى | الاستخدام المقترح |
|---|---|---|
| `newsletter-strip/` | adobe, ai-cloud, claude, figma, gemini, grok, netflix, perplexity, spotify | شريط العلامات + تصنيفات مستقبلية |
| `payment-methods/` | baridimob, bnb, instapay, mobilis, redotpay, usdt, vodafone | شارات الدفع (تطابق وسائل الدفع الحقيقية) |
| `payment-guides/flexy/` | صور إرشادية للدفع | دليل الدفع داخل صفحة الطلب |
| `certificates/` | 3 شهادات (الجزائر، السعودية، ضريبة) | صفحة الشهادات |
| `team/` | صور فريق ودعم | قسم «من نحن» |
| `app-badges/` | App Store / Google Play | الفوتر |

## 3. أصول أصلية أنشأتها (Growfolo)

| الملف | لماذا |
|---|---|
| `products/claude-opus-48-lifetime.svg` | بديل احتياطي |
| `products/chatgpt-plus.svg` | بديل احتياطي |
| `products/cursor-pro.svg` | **الصورة الأساسية** — لا توجد صورة فوتوغرافية لـ Cursor Pro |
| `products/claude-pro-yearly.svg` | بديل احتياطي |
| `products/claude-max-5x-yearly.svg` | بديل احتياطي |
| `products/claude-max-20x-yearly.svg` | بديل احتياطي |

تصميمها: تدرّج لوني + حلقات + حرفان + كلمة GROWFOLO — بلا أي شعار طرف ثالث.

## 4. ترتيب الحل في الكود

`src/lib/product-media.ts`:

```
PHOTOS[slug]      → صورة فوتوغرافية من المشروع
COVERS[slug]      → رسم أصلي
image_url من API  → إن لم يكن /uploads (غير مخدوم على Vercel)
fallback          → بطاقة متدرّجة بالحرفين الأولين
```

## 5. ما لا يوجد ولا يمكن نسخه

| الأصل | الحالة |
|---|---|
| صور/شعارات AI PLANET | ❌ مملوكة لهم — لم تُنسخ |
| صور منتجات لـ Cursor Pro | ❌ غير موجودة → رسم أصلي |
| شعار Growfolo نهائي | 🟡 يوجد حرف `G` مؤقت؛ يحتاج شعاراً رسمياً منك |

## 6. توصيات

1. **رفع صور حقيقية** للمنتجات الناقصة عبر لوحة الإدارة بعد تفعيل التخزين (Vercel Blob / S3).
2. ضغط الصور الحالية (158–266 KB) إلى WebP — يوفّر ~60% من الحجم.
3. توحيد أبعاد أغلفة المنتجات (نسبة 16:10) لتجنّب القصّ.
4. إضافة `logo.svg` رسمي لـ Growfolo بدل الحرف المؤقت.
