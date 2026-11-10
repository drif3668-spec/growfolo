import Link from "next/link";

const columns = [
  {
    title: "المتجر",
    links: [
      { href: "/products", label: "كل المنتجات" },
      { href: "/services", label: "الخدمات" },
      { href: "/blog", label: "المدونة" },
      { href: "/certificates/company-registration-algeria", label: "الشهادات" },
    ],
  },
  {
    title: "المساعدة",
    links: [
      { href: "/faq", label: "الأسئلة الشائعة" },
      { href: "/track-order", label: "تتبّع الطلب" },
      { href: "/important-info", label: "معلومات مهمة" },
      { href: "/refund-policy", label: "سياسة الاسترجاع" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { href: "/privacy", label: "سياسة الخصوصية" },
      { href: "/refund-policy", label: "شروط الخدمة" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--gf-line)] bg-[var(--gf-surface)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gf-brand)] text-sm font-black text-[#052e1c]">
              G
            </span>
            <span className="text-lg font-black tracking-tight text-[var(--gf-text)]">Growfolo</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-[var(--gf-text-muted)]">
            متجر رقمي للاشتراكات والأدوات التقنية والذكاء الاصطناعي. تفعيل سريع، دعم عربي،
            وضمان واضح على كل عملية شراء.
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-4 text-sm font-bold text-[var(--gf-text)]">{col.title}</h2>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={`${col.title}-${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--gf-text-muted)] transition hover:text-[var(--gf-brand)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-[var(--gf-line)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-[var(--gf-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Growfolo. جميع الحقوق محفوظة.</p>
          <p>الأسعار تُحسب من كتالوج المتجر لحظة إتمام الطلب.</p>
        </div>
      </div>
    </footer>
  );
}
