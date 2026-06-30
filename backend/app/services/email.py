from __future__ import annotations

import resend
from app.core.config import settings

resend.api_key = settings.resend_api_key


def _html(title: str, body: str) -> str:
    return f"""<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"/>
<style>
body{{font-family:Arial,sans-serif;background:#050508;color:#fff;margin:0;padding:0}}
.wrap{{max-width:580px;margin:40px auto;background:#0d0b14;border:1px solid rgba(168,85,247,.22);border-radius:24px;overflow:hidden}}
.hdr{{background:linear-gradient(135deg,rgba(124,58,237,.7),rgba(59,130,246,.4));padding:32px;text-align:center}}
.logo{{font-family:monospace;font-size:26px;font-weight:900}}
.logo .p{{color:#a855f7}}.logo .g{{color:#84cc16}}
.hdr h1{{margin:14px 0 0;font-size:18px;color:#fff}}
.bd{{padding:28px 32px}}
.card{{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:18px;margin-bottom:16px}}
.row{{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06)}}
.row:last-child{{border-bottom:none}}
.lbl{{color:rgba(255,255,255,.5);font-size:13px}}
.val{{color:#fff;font-size:13px;font-weight:700}}
.badge{{display:inline-block;padding:3px 12px;border-radius:99px;font-size:12px;font-weight:800}}
.ok{{background:rgba(132,204,22,.15);color:#84cc16;border:1px solid rgba(132,204,22,.3)}}
.pend{{background:rgba(245,158,11,.15);color:#f59e0b;border:1px solid rgba(245,158,11,.3)}}
.no{{background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3)}}
.btn{{display:block;text-align:center;background:linear-gradient(90deg,#84cc16,#a855f7);color:#000;font-weight:900;padding:14px;border-radius:14px;text-decoration:none;margin-top:20px;font-size:15px}}
.ft{{text-align:center;padding:18px;color:rgba(255,255,255,.3);font-size:12px;border-top:1px solid rgba(255,255,255,.06)}}
</style></head>
<body><div class="wrap">
<div class="hdr"><div class="logo"><span class="p">GROW</span><span class="g">FOLO</span></div><h1>{title}</h1></div>
<div class="bd">{body}</div>
<div class="ft">© 2026 Growfolo.io — للدعم: support@growfolo.io</div>
</div></body></html>"""


def send_order_received(order: dict) -> None:
    if not settings.resend_api_key:
        return
    ref = order["id"][:8].upper()
    body = f"""
    <p style="color:rgba(255,255,255,.7);margin-bottom:18px">مرحباً <strong style="color:#fff">{order['customer_name']}</strong>،<br/>
    تم استلام طلبك وسيقوم فريق Growfolo بمراجعة إثبات الدفع وتفعيل طلبك قريباً.</p>
    <div class="card">
      <div class="row"><span class="lbl">رقم الطلب</span><span class="val">#{ref}</span></div>
      <div class="row"><span class="lbl">المنتج</span><span class="val">{order['product_name']}</span></div>
      <div class="row"><span class="lbl">السعر</span><span class="val">{order['product_price']}$</span></div>
      <div class="row"><span class="lbl">طريقة الدفع</span><span class="val">{order.get('payment_method','—')}</span></div>
      <div class="row"><span class="lbl">الحالة</span><span class="val"><span class="badge pend">قيد المعالجة</span></span></div>
    </div>
    <a href="https://growfolo.io" class="btn">العودة إلى Growfolo</a>"""
    try:
        resend.Emails.send({"from": settings.email_from, "to": [order["customer_email"]],
                            "subject": f"✅ تم استلام طلبك #{ref} — Growfolo", "html": _html("تم استلام طلبك", body)})
    except Exception:
        pass


def send_order_activated(order: dict) -> None:
    if not settings.resend_api_key:
        return
    ref = order["id"][:8].upper()
    note = f'<div class="card"><p style="color:#84cc16;font-size:14px">{order["admin_notes"]}</p></div>' if order.get("admin_notes") else ""
    body = f"""
    <p style="color:rgba(255,255,255,.7);margin-bottom:18px">مرحباً <strong style="color:#fff">{order['customer_name']}</strong>،<br/>
    تهانينا! تم تأكيد دفعك وتفعيل اشتراكك بنجاح.</p>
    <div class="card">
      <div class="row"><span class="lbl">رقم الطلب</span><span class="val">#{ref}</span></div>
      <div class="row"><span class="lbl">المنتج</span><span class="val">{order['product_name']}</span></div>
      <div class="row"><span class="lbl">الحالة</span><span class="val"><span class="badge ok">✓ تم التفعيل</span></span></div>
    </div>{note}
    <a href="https://growfolo.io" class="btn">استمتع باشتراكك الآن 🎉</a>"""
    try:
        resend.Emails.send({"from": settings.email_from, "to": [order["customer_email"]],
                            "subject": f"🎉 تم تفعيل {order['product_name']} — Growfolo", "html": _html("تم تفعيل اشتراكك!", body)})
    except Exception:
        pass


def send_order_rejected(order: dict) -> None:
    if not settings.resend_api_key:
        return
    ref = order["id"][:8].upper()
    reason = order.get("admin_notes") or "لم يتم التحقق من إثبات الدفع"
    body = f"""
    <p style="color:rgba(255,255,255,.7);margin-bottom:18px">مرحباً <strong style="color:#fff">{order['customer_name']}</strong>،<br/>
    للأسف لم نتمكن من تأكيد طلبك.</p>
    <div class="card">
      <div class="row"><span class="lbl">رقم الطلب</span><span class="val">#{ref}</span></div>
      <div class="row"><span class="lbl">السبب</span><span class="val">{reason}</span></div>
      <div class="row"><span class="lbl">الحالة</span><span class="val"><span class="badge no">مرفوض</span></span></div>
    </div>
    <a href="https://growfolo.io" class="btn">تواصل مع الدعم</a>"""
    try:
        resend.Emails.send({"from": settings.email_from, "to": [order["customer_email"]],
                            "subject": f"ℹ️ تحديث طلبك #{ref} — Growfolo", "html": _html("تحديث حالة الطلب", body)})
    except Exception:
        pass


# Legacy compatibility
def send_order_confirmation(to_email: str, order_id: str) -> None:
    send_order_received({"id": order_id, "customer_name": "عميلنا العزيز",
                         "customer_email": to_email, "product_name": "منتج Growfolo",
                         "product_price": 0, "payment_method": "—"})


# ── Auth emails ──────────────────────────────────────────────────────────────

import random
import string


def generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def send_otp_email(email: str, name: str, otp: str) -> None:
    """Send 6-digit OTP for email verification."""
    print(f"[AUTH] OTP for {email}: {otp}")  # always log for debugging
    if not settings.resend_api_key:
        return
    body = f"""
    <p style="color:rgba(255,255,255,.75);margin-bottom:24px;line-height:1.7">
      مرحباً <strong style="color:#fff">{name}</strong>،<br/>
      شكراً لتسجيلك في <strong style="color:#a855f7">Growfolo</strong>.
      استخدم الرمز التالي لتأكيد بريدك الإلكتروني:
    </p>
    <div style="text-align:center;margin:28px 0">
      <div style="display:inline-block;background:rgba(168,85,247,.12);
                  border:2px solid rgba(168,85,247,.45);border-radius:18px;padding:20px 44px">
        <span style="font-size:42px;font-weight:900;letter-spacing:12px;
                     color:#a855f7;font-family:monospace">{otp}</span>
      </div>
    </div>
    <p style="color:rgba(255,255,255,.4);font-size:13px;text-align:center;line-height:1.6">
      ⏱ صالح لمدة <strong style="color:#fff">15 دقيقة</strong> فقط<br/>
      🔒 لا تشارك هذا الرمز مع أي شخص
    </p>"""
    try:
        resend.Emails.send({
            "from": settings.email_from,
            "to": [email],
            "subject": "🔐 رمز تحقق Growfolo — تأكيد البريد الإلكتروني",
            "html": _html("رمز التحقق من البريد الإلكتروني", body),
        })
    except Exception as exc:
        print(f"[WARN] send_otp_email failed: {exc}")


def send_welcome_email(email: str, name: str) -> None:
    """Send welcome email after successful OTP verification."""
    if not settings.resend_api_key:
        return
    body = f"""
    <p style="color:rgba(255,255,255,.75);margin-bottom:18px;line-height:1.7">
      مرحباً <strong style="color:#fff">{name}</strong>،<br/>
      يسعدنا الترحيب بك في عائلة <strong style="color:#a855f7">Growfolo</strong>! 🎉
    </p>
    <div class="card" style="text-align:center;padding:28px 20px;margin-bottom:20px">
      <div style="font-size:36px;margin-bottom:12px">🎊</div>
      <p style="font-size:17px;font-weight:900;color:#84cc16;margin:0 0 8px">
        مبروك، تم تسجيل حسابك بنجاح!
      </p>
      <p style="color:rgba(255,255,255,.5);font-size:13px;margin:0">
        يمكنك الآن الاستمتاع بجميع خدمات Growfolo الرقمية
      </p>
    </div>
    <div class="card" style="margin-bottom:20px">
      <div class="row"><span class="lbl">الاسم</span><span class="val">{name}</span></div>
      <div class="row"><span class="lbl">البريد</span><span class="val">{email}</span></div>
      <div class="row" style="border:none"><span class="lbl">الحالة</span>
        <span class="val"><span class="badge ok">✓ حساب موثّق</span></span></div>
    </div>
    <a href="https://growol.store/dashboard" class="btn">انتقل إلى لوحة حسابك ←</a>"""
    try:
        resend.Emails.send({
            "from": settings.email_from,
            "to": [email],
            "subject": "🎉 مبروك، تم تسجيل حسابك في Growfolo!",
            "html": _html("أهلاً وسهلاً بك في Growfolo", body),
        })
    except Exception as exc:
        print(f"[WARN] send_welcome_email failed: {exc}")
