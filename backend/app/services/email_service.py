"""
Email notification service.
Sends via SMTP (configure via env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM).
Falls back to console logging when SMTP is not configured — safe for local dev.
"""
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

_SMTP_HOST = os.getenv("SMTP_HOST", "")
_SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
_SMTP_USER = os.getenv("SMTP_USER", "")
_SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
_EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@dclawspace.com")
_APP_URL = os.getenv("APP_URL", "http://localhost:3058")


def _send(to: str, subject: str, html: str, text: str) -> None:
    if not _SMTP_HOST:
        logger.info("EMAIL (no SMTP configured) → %s | %s", to, subject)
        return
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = _EMAIL_FROM
    msg["To"] = to
    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(_SMTP_HOST, _SMTP_PORT) as server:
            server.starttls()
            if _SMTP_USER:
                server.login(_SMTP_USER, _SMTP_PASSWORD)
            server.sendmail(_EMAIL_FROM, [to], msg.as_string())
    except Exception as exc:
        logger.error("Email send failed to %s: %s", to, exc)


def send_visitor_arrival(host_email: str, host_name: str, visitor_name: str, visitor_company: str | None) -> None:
    company_str = f" from {visitor_company}" if visitor_company else ""
    subject = f"Your visitor {visitor_name} has arrived"
    text = f"Hi {host_name},\n\n{visitor_name}{company_str} has checked in at reception.\n\nDClaw Space"
    html = f"""
    <div style="font-family:Poppins,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#7660A8">Visitor Arrived</h2>
      <p>Hi {host_name},</p>
      <p><strong>{visitor_name}</strong>{company_str} has checked in at reception and is on their way up.</p>
      <a href="{_APP_URL}/visitors" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#7660A8;color:white;text-decoration:none;border-radius:999px;font-size:14px">View Visitor Log</a>
      <p style="color:#8888A0;font-size:12px;margin-top:32px">DClaw Space — AI-native workplace OS</p>
    </div>"""
    _send(host_email, subject, html, text)


def send_desk_booking_confirmation(user_email: str, user_name: str, desk_label: str, date: str) -> None:
    subject = f"Desk {desk_label} booked for {date}"
    text = f"Hi {user_name},\n\nYour desk {desk_label} is confirmed for {date}.\n\nDClaw Space"
    html = f"""
    <div style="font-family:Poppins,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#7660A8">Desk Booking Confirmed</h2>
      <p>Hi {user_name},</p>
      <p>Your desk <strong>{desk_label}</strong> is confirmed for <strong>{date}</strong>.</p>
      <p style="color:#8888A0;font-size:13px">Don't forget to check in when you arrive. Desks are auto-released after 15 minutes if not checked in.</p>
      <a href="{_APP_URL}/bookings" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#7660A8;color:white;text-decoration:none;border-radius:999px;font-size:14px">View My Bookings</a>
      <p style="color:#8888A0;font-size:12px;margin-top:32px">DClaw Space</p>
    </div>"""
    _send(user_email, subject, html, text)


def send_room_booking_confirmation(user_email: str, user_name: str, room_name: str, title: str, start_dt: str, end_dt: str) -> None:
    subject = f'Room "{room_name}" booked: {title}'
    text = f"Hi {user_name},\n\nRoom {room_name} is confirmed for {title} from {start_dt} to {end_dt}.\n\nDClaw Space"
    html = f"""
    <div style="font-family:Poppins,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#7660A8">Room Booking Confirmed</h2>
      <p>Hi {user_name},</p>
      <p>Room <strong>{room_name}</strong> is confirmed for <strong>{title}</strong>.</p>
      <p><strong>{start_dt}</strong> → <strong>{end_dt}</strong></p>
      <a href="{_APP_URL}/bookings" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#7660A8;color:white;text-decoration:none;border-radius:999px;font-size:14px">View My Bookings</a>
      <p style="color:#8888A0;font-size:12px;margin-top:32px">DClaw Space</p>
    </div>"""
    _send(user_email, subject, html, text)


def send_booking_reminder(user_email: str, user_name: str, booking_type: str, location: str, date: str) -> None:
    subject = f"Reminder: {booking_type} tomorrow — {location}"
    text = f"Hi {user_name},\n\nReminder: your {booking_type} at {location} is tomorrow ({date}).\n\nDClaw Space"
    html = f"""
    <div style="font-family:Poppins,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#7660A8">Booking Reminder</h2>
      <p>Hi {user_name},</p>
      <p>Your <strong>{booking_type}</strong> at <strong>{location}</strong> is <strong>tomorrow ({date})</strong>.</p>
      <a href="{_APP_URL}/bookings" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#7660A8;color:white;text-decoration:none;border-radius:999px;font-size:14px">View Bookings</a>
      <p style="color:#8888A0;font-size:12px;margin-top:32px">DClaw Space</p>
    </div>"""
    _send(user_email, subject, html, text)
