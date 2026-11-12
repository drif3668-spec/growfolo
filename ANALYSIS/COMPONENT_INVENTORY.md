# جرد المكونات — Growfolo

**الهدف:** قائمة المكوّنات المطلوبة لبناء تجربة المتجر، مع حالة كل مكوّن في المشروع الحالي.

**الرموز:** ✅ موجود ويعمل · 🟡 موجود ويحتاج تطويراً · ⬜ غير موجود

---

## 1. مكوّنات التخطيط (Layout)

| المكوّن | الحالة | الملف | ملاحظات |
|---|---|---|---|
| `SiteHeader` | ✅ | `components/layout/site-header.tsx` | شريط أبيض ثابت + بحث + عملة + سلة + حساب |
| `SidebarMenu` | 🟡 | `components/layout/sidebar-menu.tsx` | روابط موجودة، ينقصه focus trap وro`dialog` |
| `SiteFooter` | ✅ | `components/layout/site-footer.tsx` | 4 أعمدة + حقوق |
| `MobileTabBar` | ⬜ | — | شريط سفلي للهاتف (رئيسية/متجر/سلة/حساب) |
| `AnnouncementBar` | ⬜ | — | شريط إعلان قابل للإدارة |
| `SkipLink` | ⬜ | — | رابط تجاوز للمحتوى (وصولية) |

## 2. مكوّنات المنتجات

| المكوّن | الحالة | ملاحظات |
|---|---|---|
| `ProductCard` | 🟡 | صورة + شارات + سعر + تقييم. ينقص: أزرار إجراءات عند hover، صور متعددة، حالة نفاد |
| `ProductGrid` | ✅ | شبكة متجاوبة |
| `ProductRail` | ⬜ | شريط أفقي قابل للسحب + أسهم (مطلوب) |
| `ProductGallery` | ⬜ | معرض صور في صفحة المنتج |
| `PriceBlock` | ⬜ | سعر + قديم + نسبة (مكرّر في 3 أماكن حالياً) |
| `Badge` | ⬜ | شارة موحّدة (جديد/الأكثر مبيعاً/عرض محدود/خصم) |
| `StockBadge` | ⬜ | متوفر / كمية محدودة / نفد |
| `RatingStars` | ⬜ | نجوم + عدد التقييمات |
| `AddToCartButton` | ✅ | يعمل مع CartContext |
| `BuyNowButton` | ✅ | رابط مباشر للدفع |
| `WishlistButton` | ⬜ | لا يوجد زر إضافة للمفضلة إطلاقاً |
| `VariantSelector` | ⬜ | اختيار المدة/الخطة |

## 3. المتجر والفلترة

| المكوّن | الحالة |
|---|---|
| `SearchInput` | ✅ (GET form) |
| `CategoryFilter` | ✅ |
| `SortSelect` | ✅ (4 خيارات — المطلوب 6) |
| `PriceFilter` | ⬜ |
| `Pagination` | ⬜ |
| `ActiveFilterChips` | ⬜ |
| `EmptyState` | ✅ |

## 4. السلة والدفع

| المكوّن | الحالة |
|---|---|
| `CartSidebar` | 🟡 (يعمل، يحتاج RTL وa11y) |
| `CartLine` | 🟡 |
| `DiscountInput` | 🟡 (يطبّق محلياً فقط) |
| `CheckoutWizard` | 🟡 (منتج واحد لكل طلب) |
| `OrderSummary` | 🟡 |
| `PaymentMethodPicker` | ✅ (وسائل حقيقية فقط) |
| `ProofUpload` | ✅ |
| `OrderSuccess` | 🟡 |

## 5. تتبع الطلبات

| المكوّن | الحالة |
|---|---|
| `TrackForm` | ✅ (رقم + بريد) |
| `OrderTimeline` | ✅ 5 مراحل |
| `TrackResult` | 🟡 |

## 6. لوحة العميل

| المكوّن | الحالة |
|---|---|
| `DashboardShell` | 🟡 (ألوان فقط) |
| `ProfileSection` | ✅ |
| `OrdersSection` | ✅ |
| `DiscountsSection` | ✅ |
| `WishlistSection` | ⬜ (لا يوجد زر إضافة) |
| `NotificationsSection` | 🟡 (محلي فقط) |

## 7. لوحة الإدارة

| المكوّن | الحالة |
|---|---|
| `AdminShell` | 🟡 (بلا موبايل) |
| `OrdersAdmin` | ✅ |
| `ProductsAdmin` | ✅ |
| `BannersAdmin` | ✅ |
| `DiscountsAdmin` | ✅ |
| `BlogAdmin` | ✅ |
| `ChatAdmin` | ✅ |
| `CategoriesAdmin` | ⬜ |
| `ReviewsAdmin` | ⬜ |
| `SettingsAdmin` | ⬜ (تاب فارغ) |
| `StatsOverview` | ⬜ |

## 8. مكوّنات الحركة

| المكوّن | الحالة |
|---|---|
| `Reveal` (scroll) | ⬜ |
| `.gf-card` hover | ✅ |
| `.gf-reveal` | ✅ (دخول قسم) |
| `HorizontalRail` | ⬜ |
| `Modal` موحّد | ⬜ |

---

## 9. الفجوات ذات الأولوية

1. `ProductRail` + `ProductGallery` — مطلوبان نصاً في المراحل 3 و6.
2. `WishlistButton` — المفضلة موجودة كصفحة لكن لا يمكن الإضافة إليها.
3. `CategoriesAdmin` / `ReviewsAdmin` / `SettingsAdmin` — لوحة الإدارة ناقصة ثلاثة أقسام.
4. `Pagination` + `PriceFilter` + خيارا ترتيب (الأكثر مبيعاً، الأحدث).
5. `MobileTabBar` — تجربة الهاتف تنقصها تنقّل سفلي.
6. `StockBadge` + متغيرات المنتج.
