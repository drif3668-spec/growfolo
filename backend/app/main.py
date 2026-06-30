import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import Base, engine, SessionLocal
import app.models  # noqa: F401

Base.metadata.create_all(bind=engine)

# ── Seed admin user if not present ──────────────────────────────────────
def _seed_admin() -> None:
    from sqlalchemy import select
    from app.core.security import hash_password
    from app.models.user import User

    db = SessionLocal()
    try:
        if db.scalar(select(User).where(User.email == "admin@growfolo.io")):
            return
        admin = User(
            email="admin@growfolo.io",
            username="admin",
            full_name="Growfolo Admin",
            hashed_password=hash_password("Admin@2026"),
            is_admin=True,
        )
        db.add(admin)
        db.commit()
    except Exception as exc:
        db.rollback()
        print(f"[WARN] Could not seed admin user: {exc}")
    finally:
        db.close()

_seed_admin()

# ── Seed initial blog posts if table is empty ────────────────────────────
def _seed_blog() -> None:
    from sqlalchemy import select
    from app.models.blog_post import BlogPost
    db = SessionLocal()
    try:
        if db.scalar(select(BlogPost)):
            return
        posts = [
            BlogPost(slug="what-is-growfolo", title="ما هي منصة Growfolo؟ دليلك الشامل",
                excerpt="تعرّف على منصة Growfolo الرقمية وكيف تساعدك في الحصول على أفضل الخدمات الرقمية والاشتراكات الأصلية بأسعار تنافسية.",
                content="""<h2>مرحباً بك في Growfolo</h2>
<p>Growfolo منصة رقمية متكاملة تجمع بين أفضل الخدمات الرقمية العالمية تحت سقف واحد. نوفر اشتراكات أصلية في أدوات الذكاء الاصطناعي، والخدمات السحابية، والبرمجيات المتخصصة بأسعار تنافسية مع ضمان كامل.</p>
<h2>ماذا نقدم؟</h2>
<ul>
<li>اشتراكات في ChatGPT وClaude وGemini وغيرها</li>
<li>خدمات سحابية من AWS وAzure وGoogle Cloud</li>
<li>أدوات إبداعية مثل Adobe وCanva وMidjourney</li>
<li>خدمات ترفيهية مثل Netflix وSpotify</li>
</ul>
<h2>لماذا Growfolo؟</h2>
<p>نتميز بالتسليم الفوري، والدعم الفني على مدار الساعة، وضمان استرجاع الأموال حتى 35 يوماً. فريقنا متخصص في ضمان أفضل تجربة ممكنة لكل عميل.</p>""",
                author="فريق Growfolo", category="services",
                tags=json.dumps(["Growfolo", "الخدمات الرقمية"], ensure_ascii=False),
                published=True, featured=True),
            BlogPost(slug="chatgpt-vs-claude-2025", title="ChatGPT مقابل Claude 2025 — أيهما أفضل؟",
                excerpt="مقارنة شاملة ومحايدة بين أقوى نماذجي الذكاء الاصطناعي للمحادثة في عام 2025، مع نصائح حول اختيار الأنسب لاحتياجاتك.",
                content="""<h2>المقارنة الكبرى</h2>
<p>في عام 2025 أصبح الاختيار بين ChatGPT من OpenAI وClaude من Anthropic قراراً مصيرياً لكثير من المطورين والمبدعين. كلا النموذجين يقدمان قدرات استثنائية، لكن لكل منهما نقاط قوة مختلفة.</p>
<h2>ChatGPT</h2>
<p>ChatGPT يتميز بتكاملاته الواسعة، وإمكانية البحث على الإنترنت، ودعم الإضافات والصور. النموذج GPT-4o متعدد الوسائط ويدعم الصوت والصورة والنص في آنٍ واحد.</p>
<h2>Claude</h2>
<p>Claude من Anthropic يتميز بنافذة سياق أكبر (200,000 رمز)، وأسلوب كتابة أكثر طبيعية، وقدرات تحليل المستندات الطويلة. يُعدّ خياراً ممتازاً للمهام التحريرية والبرمجية المعقدة.</p>
<h2>التوصية</h2>
<p>للمهام الإبداعية والكتابة: Claude. للبحث والمهام متعددة الوسائط: ChatGPT. ويمكنك من Growfolo الحصول على اشتراكات في كليهما بأسعار مميزة.</p>""",
                author="أحمد التقني", category="ai",
                tags=json.dumps(["ChatGPT", "Claude", "ذكاء اصطناعي", "مقارنة"], ensure_ascii=False),
                published=True, featured=False),
            BlogPost(slug="ai-tools-guide-2025", title="أفضل 10 أدوات ذكاء اصطناعي يجب أن تعرفها في 2025",
                excerpt="دليل شامل بأقوى أدوات الذكاء الاصطناعي التي غيّرت طريقة العمل والإبداع في 2025، مع شرح لكيفية استخدام كل أداة.",
                content="""<h2>ثورة الذكاء الاصطناعي في 2025</h2>
<p>عام 2025 كان عام الانفجار الحقيقي لأدوات الذكاء الاصطناعي. من الكتابة إلى التصميم إلى البرمجة، أصبح AI مساعداً لا غنى عنه في كل مجال.</p>
<h2>أبرز الأدوات</h2>
<ol>
<li><strong>Claude 4 Opus</strong> — أقوى نموذج للتحليل والكتابة</li>
<li><strong>ChatGPT-4o</strong> — متعدد الوسائط، صوت وصورة ونص</li>
<li><strong>Midjourney v7</strong> — توليد صور بجودة احترافية</li>
<li><strong>Cursor AI</strong> — مساعد برمجة ذكي داخل محرر الكود</li>
<li><strong>ElevenLabs</strong> — توليد أصوات بشرية واقعية</li>
<li><strong>Perplexity AI</strong> — محرك بحث ذكي بإجابات مباشرة</li>
<li><strong>Gemini Advanced</strong> — نموذج Google المتكامل</li>
<li><strong>GitHub Copilot</strong> — الاكتمال الذكي للكود</li>
<li><strong>Canva AI</strong> — تصميم بالذكاء الاصطناعي للجميع</li>
<li><strong>Sora</strong> — توليد فيديوهات من نص</li>
</ol>
<p>جميع هذه الخدمات متاحة عبر Growfolo بأسعار تنافسية ودعم فني متميز.</p>""",
                author="فريق Growfolo", category="ai",
                tags=json.dumps(["ذكاء اصطناعي", "أدوات", "2025", "دليل"], ensure_ascii=False),
                published=True, featured=True),
            BlogPost(slug="how-to-connect-apis", title="كيف تربط خدمات الذكاء الاصطناعي بمشاريعك؟ دليل API",
                excerpt="تعلّم كيفية الربط بين خدمات الذكاء الاصطناعي المختلفة ومشاريعك البرمجية باستخدام واجهات API خطوة بخطوة.",
                content="""<h2>ما هي الـ API؟</h2>
<p>API (Application Programming Interface) هي جسر الاتصال بين تطبيقك وخدمات الذكاء الاصطناعي. بدلاً من استخدام واجهات المستخدم، تستطيع إرسال طلبات مباشرة وتلقي استجابات برمجياً.</p>
<h2>ربط OpenAI API</h2>
<pre><code>import openai
client = openai.OpenAI(api_key="YOUR_KEY")
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "مرحباً!"}]
)
print(response.choices[0].message.content)</code></pre>
<h2>ربط Claude API</h2>
<pre><code>import anthropic
client = anthropic.Anthropic(api_key="YOUR_KEY")
message = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[{"role": "user", "content": "مرحباً!"}]
)
print(message.content[0].text)</code></pre>
<h2>نصائح مهمة</h2>
<ul>
<li>احفظ مفاتيح API في متغيرات البيئة وليس في الكود</li>
<li>استخدم Rate Limiting لتجنب تجاوز الحصص</li>
<li>فعّل التخزين المؤقت (Caching) لتقليل التكاليف</li>
</ul>""",
                author="محمد المطور", category="tutorials",
                tags=json.dumps(["API", "برمجة", "ربط", "تطوير"], ensure_ascii=False),
                published=True, featured=False),
            BlogPost(slug="growfolo-news-june-2025", title="أخبار Growfolo — يونيو 2025",
                excerpt="آخر التحديثات والأخبار من منصة Growfolo: إضافة خدمات جديدة، تحسينات في المنصة، وعروض حصرية.",
                content="""<h2>مستجدات المنصة</h2>
<p>نسعد بإطلاق حزمة تحديثات شاملة لمنصة Growfolo خلال يونيو 2025، تشمل تحسينات في الأداء وإضافة خدمات جديدة.</p>
<h2>الجديد في يونيو</h2>
<ul>
<li>إضافة نظام تتبع الطلبات التفاعلي بـ 5 مراحل</li>
<li>نظام أكواد الخصم الجديد</li>
<li>قسم المدونة التفاعلي (هذه الصفحة!)</li>
<li>نظام المفضلة والإشعارات</li>
<li>واجهة شات محسّنة مع اختيار الوكيل</li>
</ul>
<h2>الخدمات الجديدة</h2>
<p>أضفنا باقات جديدة لـ Claude Max وخدمات GitHub Copilot وElevenLabs بأسعار تنافسية مع ضمان التفعيل الفوري.</p>
<h2>عروض حصرية</h2>
<p>للاستفادة من كود خصم 35% على طلبك الأول، تواصل مع فريقنا عبر الشات المباشر أو تابع صفحة تتبع الطلبات.</p>""",
                author="فريق Growfolo", category="news",
                tags=json.dumps(["أخبار", "تحديثات", "Growfolo", "2025"], ensure_ascii=False),
                published=True, featured=False),
        ]
        for p in posts:
            db.add(p)
        db.commit()
    finally:
        db.close()

_seed_blog()

app = FastAPI(title=settings.app_name)

# Development: allow all localhost ports. Production: allow configured frontend URL.
# On Vercel, frontend and API share the same domain, so CORS is same-origin and
# the middleware becomes a no-op — but we keep it for external clients.
if settings.app_env == "development":
    cors_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
else:
    cors_origins = [
        "https://growol.store",
        "https://www.growol.store",
        settings.frontend_url,
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(cors_origins)),  # deduplicate
    allow_origin_regex=r"https://.*\.vercel\.app",    # covers preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files. On Vercel the filesystem is read-only except /tmp,
# so the directory may land in /tmp/uploads — mount it gracefully.
try:
    app.mount("/uploads", StaticFiles(directory=str(settings.upload_path)), name="uploads")
except Exception:
    pass  # skip static mount in serverless environments

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
