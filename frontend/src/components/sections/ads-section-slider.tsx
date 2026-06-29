"use client";

import { useCallback, useEffect, useState } from "react";

const ADS = [
  { src: "/ads-section/ad-services-trust.jpg", alt: "لماذا تختار خدمات Growfolo" },
  { src: "/ads-section/ad-vscode-steps.jpg", alt: "خطوات الربط في VS Code" },
  { src: "/ads-section/ad-claude-lifetime-details.jpg", alt: "تفاصيل Claude Opus Lifetime" },
  { src: "/ads-section/ad-claude-cloud-lifetime.jpg", alt: "Claude Cloud Lifetime Access" },
  { src: "/ads-section/ad-license-certificate.jpg", alt: "شهادة ترخيص Growfolo الدولية" },
  { src: "/ads-section/ad-uae-license.jpg", alt: "رخصة تجارية دولية Growfolo" },
];

const AUTO_MS = 5000;

export function AdsSectionSlider() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((value) => (value + 1) % ADS.length), []);

  useEffect(() => {
    const timer = setInterval(next, AUTO_MS);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="mt-10 text-right">
      <div className="mb-5">
        <h3 className="text-2xl font-black text-white">قسم الإعلانات</h3>
      </div>

      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-[0_28px_90px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.95)] sm:p-4"
        aria-label="سلايدر قسم الإعلانات"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_30%_0%,rgba(132,204,22,0.16),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(235,255,239,0.72))]" />
        <div
          className="relative flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(${current * 100}%)` }}
        >
          {ADS.map((ad) => (
            <div key={ad.src} className="w-full shrink-0 px-0">
              <div className="ad-slide-card relative overflow-hidden rounded-3xl border border-black/5 bg-white p-2">
                <img
                  src={ad.src}
                  alt={ad.alt}
                  className="relative h-auto max-h-[520px] w-full select-none rounded-2xl object-contain"
                  draggable={false}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {ADS.map((ad, index) => (
          <span
            key={ad.src}
            className={`rounded-full transition-all duration-300 ${current === index ? "h-2.5 w-8 bg-lime-400" : "size-2.5 bg-white/25"}`}
          />
        ))}
      </div>

      <div className="mt-7 text-center">
        <a href="/services" className="neon-button inline-flex rounded-2xl px-9 py-4 font-black text-black transition-transform hover:scale-[1.03]">
          عرض جميع الخدمات
        </a>
      </div>
    </section>
  );
}
