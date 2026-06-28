import resend

from app.core.config import settings


def send_order_confirmation(to_email: str, order_id: str) -> None:
    if not settings.resend_api_key:
        return

    resend.api_key = settings.resend_api_key
    resend.Emails.send(
        {
            "from": settings.email_from,
            "to": [to_email],
            "subject": f"Growfolo order {order_id}",
            "html": f"<p>Your order was created. Reference: <strong>{order_id}</strong></p>",
        }
    )

