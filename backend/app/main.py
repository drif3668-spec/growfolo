import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import Base, engine, SessionLocal
import app.models  # noqa: F401

Base.metadata.create_all(bind=engine)


# ── Migrate: add new columns to existing tables ──────────────────────────────
def _migrate_add_columns() -> None:
    """Idempotently add OTP + verification columns (safe for existing DBs)."""
    from sqlalchemy import text

    db = SessionLocal()
    pg_stmts = [
        # users
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP",
        "UPDATE users SET created_at = NOW() WHERE created_at IS NULL",
        # products — rich fields
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT ''",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS logo TEXT DEFAULT '📦'",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS full_description TEXT",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS usage_details TEXT",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS requirements TEXT",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS benefits TEXT",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price NUMERIC(10,2) DEFAULT 0",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS discount TEXT DEFAULT ''",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS buyers TEXT DEFAULT ''",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#a855f7'",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS logo_color TEXT DEFAULT 'from-purple-500 to-purple-900'",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'AI'",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 4.9",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS partners_json TEXT",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS features_json TEXT",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS specs_json TEXT",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS faq_json TEXT",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0",
    ]
    try:
        if settings.is_postgres:
            for stmt in pg_stmts:
                db.execute(text(stmt))
            db.commit()
        else:
            # SQLite: no IF NOT EXISTS for ADD COLUMN — run each statement separately
            sqlite_stmts = [s for s in pg_stmts if s.startswith("ALTER TABLE")]
            for stmt in sqlite_stmts:
                # Convert PG-specific syntax to SQLite
                stmt_sq = stmt.replace(" IF NOT EXISTS", "").replace("NOT NULL DEFAULT FALSE", "DEFAULT 0")
                try:
                    db.execute(text(stmt_sq))
                    db.commit()
                except Exception:
                    db.rollback()  # Column already exists — safe to ignore
    except Exception as exc:
        db.rollback()
        print(f"[WARN] Migration outer: {exc}")
    finally:
        db.close()


_migrate_add_columns()


# ── Seed admin user if not present ──────────────────────────────────────
def _seed_admin() -> None:
    from sqlalchemy import select
    from app.core.security import hash_password
    from app.models.user import User

    db = SessionLocal()
    try:
        existing = db.scalar(select(User).where(User.email == "admin@growfolo.io"))
        if existing:
            # Ensure admin is always marked verified (survives column migration)
            if not existing.is_verified:
                existing.is_verified = True
                db.commit()
            return
        admin = User(
            email="admin@growfolo.io",
            username="admin",
            full_name="Growfolo Admin",
            hashed_password=hash_password("Admin@2026"),
            is_admin=True,
            is_verified=True,
        )
        db.add(admin)
        db.commit()
    except Exception as exc:
        db.rollback()
        print(f"[WARN] Could not seed admin user: {exc}")
    finally:
        db.close()

_seed_admin()


# ── Seed products from static data ──────────────────────────────────────
def _seed_products() -> None:
    import json as _json
    from sqlalchemy import select
    from app.models.product import Product

    STATIC = [
        {"id": "claude-opus-48-lifetime", "name": "Claude Opus 4.8", "slug": "claude-opus-48-lifetime",
         "subtitle": "Lifetime Cloud Access", "logo": "✳", "price": 150, "old_price": 499, "discount": "-70%",
         "buyers": "18K", "accent_color": "#22c55e", "logo_color": "from-green-600 via-emerald-700 to-green-900",
         "category": "AI", "badge": "LIFETIME DEAL", "rating": 4.9, "reviews_count": 234,
         "description": "امتلك أقوى بيئة برمجة سحابية مدى الحياة. ادفع مرة واحدة واستخدم Claude Opus 4.8 للأبد بدون رسوم شهرية.",
         "full_description": "Claude Opus 4.8 هو أحدث وأقوى نماذج Anthropic للذكاء الاصطناعي. يتميز بنافذة سياق ضخمة تصل إلى مليون رمز، مما يتيح لك العمل مع ملفات ضخمة وقواعد كود كاملة في محادثة واحدة. مع هذا الاشتراك مدى الحياة، تدفع مرة واحدة فقط وتحصل على وصول دائم بدون رسوم شهرية.",
         "usage_details": "يمكن استخدامه عبر متصفح الويب أو عبر API مباشرة. يدعم VS Code بالكامل مع إضافة Continue، ويعمل على جميع أنظمة التشغيل.",
         "requirements": "حساب Anthropic نشط — يتم التسليم خلال 24 ساعة من تأكيد الدفع.",
         "benefits": "توفير ضخم مدى الحياة — بدلاً من $499/سنة تدفع $150 مرة واحدة فقط. تحديثات مجانية مستمرة.",
         "partners": _json.dumps(["Anthropic", "OpenRouter"], ensure_ascii=False),
         "features": _json.dumps(["أحدث نموذج Claude Opus 4.8 من Anthropic","1,000,000 Context Window","2 TB مساحة سحابية خاصة","ربط عبر API KEY خاص","بيئة برمجة متكاملة داخل VS Code","دعم إضافة Continue بالكامل","سرعة واستقرار لا مثيل لهما","تحديثات مستمرة مجانية للأبد"], ensure_ascii=False),
         "specs": _json.dumps([{"label":"Context Window","value":"1,000,000"},{"label":"Cloud Storage","value":"2 TB"},{"label":"API Access","value":"Private KEY"},{"label":"Performance","value":"Ultra Fast"},{"label":"Privacy","value":"100% Private"},{"label":"Access","value":"Lifetime ∞"}], ensure_ascii=False),
         "faq": _json.dumps([{"question":"هل الوصول مدى الحياة فعلاً؟","answer":"نعم، تدفع مرة واحدة وتحصل على الوصول للأبد بدون أي رسوم إضافية."},{"question":"كيف يتم التسليم؟","answer":"خلال 24 ساعة من تأكيد الدفع، تتلقى بيانات الوصول عبر البريد الإلكتروني."},{"question":"هل هناك ضمان استرجاع؟","answer":"نعم، ضمان استرجاع كامل خلال 30 يوماً في حال عدم الرضا."}], ensure_ascii=False),
         "sort_order": 1},
        {"id": "chatgpt-plus", "name": "ChatGPT Plus", "slug": "chatgpt-plus",
         "subtitle": "GPT-4o Monthly Access", "logo": "◎", "price": 5.99, "old_price": 9.99, "discount": "-40%",
         "buyers": "12K", "accent_color": "#10b981", "logo_color": "from-emerald-400 to-teal-600",
         "category": "AI", "badge": "الأكثر مبيعاً", "rating": 4.8, "reviews_count": 1240,
         "description": "اشترك في ChatGPT Plus واستمتع بوصول كامل لنموذج GPT-4o مع سرعة أعلى وإمكانيات حصرية.",
         "features": _json.dumps(["وصول كامل لنموذج GPT-4o","سرعة استجابة أعلى بـ 3x","إنشاء الصور بـ DALL-E 3","تحميل الملفات والتحليل","بحث ذكي على الإنترنت","تشغيل الكود Python","إنشاء GPTs مخصصة"], ensure_ascii=False),
         "specs": _json.dumps([{"label":"النموذج","value":"GPT-4o"},{"label":"الرسائل","value":"غير محدودة"},{"label":"إنشاء صور","value":"DALL-E 3"},{"label":"البحث","value":"ويب + ملفات"}], ensure_ascii=False),
         "faq": _json.dumps([{"question":"هل الاشتراك شهري أم سنوي؟","answer":"الاشتراك شهري ويمكن تجديده أو إلغاؤه في أي وقت."},{"question":"ما الفرق بين GPT-4o و GPT-3.5؟","answer":"GPT-4o أذكى بكثير، يدعم الصور والملفات، وأسرع في الاستجابة."}], ensure_ascii=False),
         "sort_order": 2},
        {"id": "cursor-pro", "name": "Cursor Pro", "slug": "cursor-pro",
         "subtitle": "AI-Powered Code Editor", "logo": "⚡", "price": 8.99, "old_price": 19.99, "discount": "-55%",
         "buyers": "6K", "accent_color": "#6366f1", "logo_color": "from-blue-500 to-violet-700",
         "category": "AI", "badge": "🔥 HOT", "rating": 4.9, "reviews_count": 892,
         "description": "محرر الكود الذكي الذي يفهم مشروعك بالكامل ويكتب الكود معك في الوقت الفعلي.",
         "features": _json.dumps(["مساعد AI متكامل في المحرر","فهم كامل لسياق المشروع","إكمال تلقائي ذكي متعدد الأسطر","تصحيح الأخطاء بالذكاء الاصطناعي","دعم جميع لغات البرمجة","تكامل كامل مع Git","دعم Claude + GPT-4 + Gemini"], ensure_ascii=False),
         "specs": _json.dumps([{"label":"نماذج AI","value":"Claude/GPT/Gemini"},{"label":"اللغات","value":"جميع اللغات"},{"label":"التكامل","value":"VS Code مشابه"},{"label":"الخصوصية","value":"100% محلي"}], ensure_ascii=False),
         "faq": _json.dumps([{"question":"هل يعمل بدون إنترنت؟","answer":"لا، بعض المميزات تتطلب اتصالاً بالإنترنت لاستخدام نماذج AI السحابية."},{"question":"هل يدعم اللغة العربية؟","answer":"نعم، يمكنك الكتابة بالعربية والحصول على ردود بالعربية."}], ensure_ascii=False),
         "sort_order": 3},
        {"id": "claude-pro-yearly", "name": "Claude Pro", "slug": "claude-pro-yearly",
         "subtitle": "Annual AI Productivity Plan", "logo": "⭐", "price": 19, "old_price": 240, "discount": "-92%",
         "buyers": "9K", "accent_color": "#8b5cf6", "logo_color": "from-slate-950 via-purple-950 to-slate-900",
         "category": "AI", "badge": "⭐ Claude Pro", "rating": 4.9, "reviews_count": 918,
         "description": "باقة Claude Pro السنوية للاستخدام اليومي والإنتاجية الاحترافية، مع محادثات متقدمة ودعم مستمر.",
         "partners": _json.dumps(["Anthropic", "Claude"], ensure_ascii=False),
         "features": _json.dumps(["للاستخدام اليومي والإنتاجية الاحترافية","محادثات متقدمة ومتواصلة","كتابة المحتوى والترجمة طوال العام","دعم فني متواصل"], ensure_ascii=False),
         "specs": _json.dumps([{"label":"الخطة","value":"سنوية"},{"label":"التوفير","value":"$221 (92%)"},{"label":"الاستخدام","value":"يومي واحترافي"},{"label":"الدعم","value":"متواصل"}], ensure_ascii=False),
         "faq": _json.dumps([{"question":"ما الفرق بين Claude Pro و Claude Max؟","answer":"Claude Pro مخصص للاستخدام اليومي بينما Claude Max للمشاريع الثقيلة والمكثفة."}], ensure_ascii=False),
         "sort_order": 4},
        {"id": "claude-max-5x-yearly", "name": "Claude Max 5x", "slug": "claude-max-5x-yearly",
         "subtitle": "Advanced Annual AI Plan", "logo": "🔥", "price": 25, "old_price": 1200, "discount": "-98%",
         "buyers": "7K", "accent_color": "#a855f7", "logo_color": "from-slate-950 via-purple-950 to-violet-900",
         "category": "AI", "badge": "الأكثر توفيراً", "rating": 4.9, "reviews_count": 760,
         "description": "باقة Claude Max 5x السنوية للمشاريع المتقدمة والمعقدة، مناسبة للبرمجة الاحترافية وتحليل البيانات.",
         "partners": _json.dumps(["Anthropic", "Claude Max"], ensure_ascii=False),
         "features": _json.dumps(["للمشاريع المتقدمة والمعقدة","برمجة احترافية بلا انقطاع","تحليل بيانات متواصل","سرعة وأداء احترافي طوال العام"], ensure_ascii=False),
         "specs": _json.dumps([{"label":"الخطة","value":"سنوية"},{"label":"التوفير","value":"$1175 (98%)"},{"label":"الأداء","value":"Max 5x"},{"label":"الاستخدام","value":"مشاريع متقدمة"}], ensure_ascii=False),
         "faq": _json.dumps([{"question":"ما المقصود بـ Max 5x؟","answer":"يعني أن لديك 5 أضعاف حد الاستخدام مقارنة بخطة Pro العادية."}], ensure_ascii=False),
         "sort_order": 5},
        {"id": "claude-max-20x-yearly", "name": "Claude Max 20x", "slug": "claude-max-20x-yearly",
         "subtitle": "Professional Annual AI Plan", "logo": "👑", "price": 50, "old_price": 2400, "discount": "-98%",
         "buyers": "5K", "accent_color": "#f97316", "logo_color": "from-slate-950 via-orange-950 to-stone-900",
         "category": "AI", "badge": "للمحترفين", "rating": 5, "reviews_count": 540,
         "description": "أقوى خطة Claude Max 20x السنوية للمحترفين والشركات وسير العمل المكثف.",
         "full_description": (
             "👑  الخطة الأقوى للمحترفين\n"
             "🔥 أقصى أداء للمستخدمين المحترفين والشركات\n\n"
             "✅ 25 مليون توكن APL سنة  50 مليون توكن ⭐\n"
             "✅ تجديد تلقائي لرصيد APL كل 6 أشهر ⚡\n"
             "✅ أولوية قصوى في سرعة الاستجابة\n"
             "✅ استخدام مكثف بدون قيود كبيرة\n"
             "✅ إنشاء وتحليل المشاريع الضخمة\n"
             "✅ كتابة وبرمجة وشرح متقدم باحترافية عالية\n"
             "✅ مناسبة للشركات والمطورين والمسوقين المحترفين\n"
             "✅ دعم فني وأولوية معالجة الطلبات\n"
             "✅ أفضل أداء واستقرار على مدار السنة"
         ),
         "partners": _json.dumps(["Anthropic", "Claude Max"], ensure_ascii=False),
         "features": _json.dumps(["لأقوى الاستخدامات وسير العمل المكثف","استخدام مكثف بدون قيود كبيرة","مناسبة للشركات والمطورين المحترفين","أعلى أولوية أداء طوال العام"], ensure_ascii=False),
         "specs": _json.dumps([{"label":"الخطة","value":"سنوية"},{"label":"التوفير","value":"$2350 (98%)"},{"label":"الأداء","value":"Max 20x"},{"label":"الفئة","value":"محترفين وشركات"}], ensure_ascii=False),
         "faq": _json.dumps([{"question":"هل مناسبة للشركات؟","answer":"نعم، هذه الخطة مصممة خصيصاً للشركات والمطورين المحترفين الذين يحتاجون إلى استخدام مكثف."}], ensure_ascii=False),
         "sort_order": 6},
    ]

    db = SessionLocal()
    try:
        for p in STATIC:
            existing = db.get(Product, p["id"])
            fields = dict(
                name=p["name"], slug=p["slug"],
                subtitle=p.get("subtitle", ""), logo=p.get("logo", "📦"),
                description=p.get("description", ""),
                full_description=p.get("full_description"),
                usage_details=p.get("usage_details"),
                requirements=p.get("requirements"),
                benefits=p.get("benefits"),
                price=p["price"], old_price=p.get("old_price", 0),
                discount=p.get("discount", ""), buyers=p.get("buyers", ""),
                accent_color=p.get("accent_color", "#a855f7"),
                logo_color=p.get("logo_color", "from-purple-500 to-purple-900"),
                category=p.get("category", "AI"),
                badge=p.get("badge"),
                rating=p.get("rating", 4.9),
                reviews_count=p.get("reviews_count", 0),
                partners_json=p.get("partners"),
                features_json=p.get("features"),
                specs_json=p.get("specs"),
                faq_json=p.get("faq"),
                is_published=True,
                sort_order=p.get("sort_order", 0),
            )
            if existing:
                for k, v in fields.items():
                    setattr(existing, k, v)
            else:
                db.add(Product(id=p["id"], **fields))
        db.commit()
    except Exception as exc:
        db.rollback()
        print(f"[WARN] Product seed: {exc}")
    finally:
        db.close()


_seed_products()


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

# Serve uploaded files. upload_path already falls back to /tmp/uploads on
# read-only filesystems (Vercel). StaticFiles raises RuntimeError when the
# directory is empty on cold starts; mount once it exists and is non-empty,
# falling back to an always-succeed approach via a custom route.
_upload_dir = settings.upload_path
_upload_dir.mkdir(parents=True, exist_ok=True)
try:
    app.mount("/uploads", StaticFiles(directory=str(_upload_dir), check_dir=False), name="uploads")
except Exception:
    # Last-resort: serve files manually so the route always works
    from fastapi.responses import FileResponse
    @app.get("/uploads/{filename:path}")
    def serve_upload(filename: str):
        from fastapi import HTTPException as _HTTPException
        import mimetypes
        target = _upload_dir / filename
        if not target.exists():
            raise _HTTPException(status_code=404, detail="File not found")
        mime, _ = mimetypes.guess_type(str(target))
        return FileResponse(str(target), media_type=mime or "application/octet-stream")

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
