export type Certificate = {
  slug: string;
  buttonLabel: string;
  title: string;
  country: string;
  description: string;
  image: string;
  issueDate: string;
  accent: string;
};

export const CERTIFICATES: Certificate[] = [
  {
    slug: "company-registration-algeria",
    buttonLabel: "شهادة تسجيل الشركة - الجزائر",
    title: "شهادة تسجيل الشركة",
    country: "الجزائر",
    description: "شهادة تسجيل تجاري توضح بيانات شركة Growfolo ونشاطها في المنتجات الرقمية والحلول التقنية.",
    image: "/certificates/company-registration-algeria.jpg",
    issueDate: "15/04/2024",
    accent: "#22c55e",
  },
  {
    slug: "company-registration-saudi",
    buttonLabel: "شهادة تسجيل الشركة - السعودية",
    title: "شهادة تسجيل الشركة",
    country: "السعودية",
    description: "وثيقة تسجيل شركة Growfolo في المملكة العربية السعودية لعرض بيانات التسجيل والنشاط التجاري.",
    image: "/certificates/company-registration-saudi.jpg",
    issueDate: "15/05/2024",
    accent: "#10b981",
  },
  {
    slug: "tax-registration-saudi",
    buttonLabel: "السجل الضريبي - السعودية",
    title: "السجل الضريبي",
    country: "السعودية",
    description: "سجل ضريبي تعريفي يوضح بيانات التسجيل الضريبي والنشاط التجاري الخاص بـ Growfolo.",
    image: "/certificates/tax-registration-saudi.jpg",
    issueDate: "15/05/2024",
    accent: "#14b8a6",
  },
];

export function getCertificate(slug: string) {
  return CERTIFICATES.find((certificate) => certificate.slug === slug);
}
