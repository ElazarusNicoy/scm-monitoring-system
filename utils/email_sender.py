import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

SMTP_HOST     = os.getenv('SMTP_HOST',     'smtp.gmail.com')
SMTP_PORT     = int(os.getenv('SMTP_PORT', 587))
SMTP_USER     = os.getenv('SMTP_USER')      # sender email
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')  # sender app password
SENDER_NAME   = os.getenv('SENDER_NAME',   'SCM Monitoring System')


def send_escalation_email(to_email, cc_email, subject, transaction_name,
                           transaction_type, aging_days, aging_level,
                           current_pic, requestor, sharepoint_link):
    """
    Send escalation follow-up email to Current PIC with CC to Requestor.
    """
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From']    = f"{SENDER_NAME} <{SMTP_USER}>"
        msg['To']      = to_email
        msg['Cc']      = cc_email

        # ✅ Aging badge color
        badge_color = '#ef4444' if aging_level.lower() == 'critical' else '#f59e0b'
        badge_label = aging_level.upper()

        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #1f2937; background-color: #f9fafb; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">

                <!-- Header -->
                <div style="background-color: #1e3a5f; padding: 24px 32px;">
                    <h2 style="color: white; margin: 0; font-size: 1.2rem;">
                        ⚠️ SCM Monitoring System — Escalation Notice
                    </h2>
                </div>

                <!-- Body -->
                <div style="padding: 28px 32px;">
                    <p style="font-size: 0.95rem; margin-bottom: 1rem;">
                        Dear <strong>{current_pic}</strong>,
                    </p>
                    <p style="font-size: 0.95rem; color: #4b5563;">
                        This is a follow-up notice for a transaction that requires your immediate attention.
                    </p>

                    <!-- Transaction Details Box -->
                    <div style="background: #f3f4f6; border-left: 4px solid {badge_color};
                                border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
                        <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 6px 0; color: #6b7280; width: 40%;">Transaction Name</td>
                                <td style="padding: 6px 0; font-weight: 600;">{transaction_name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #6b7280;">Transaction Type</td>
                                <td style="padding: 6px 0;">{transaction_type}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #6b7280;">Requestor</td>
                                <td style="padding: 6px 0;">{requestor}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #6b7280;">Aging</td>
                                <td style="padding: 6px 0;">
                                    <strong>{aging_days} days</strong>
                                    <span style="background: {badge_color}; color: white;
                                                 padding: 2px 10px; border-radius: 12px;
                                                 font-size: 0.78rem; margin-left: 8px;">
                                        {badge_label}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- SharePoint Link Button -->
                    <div style="text-align: center; margin: 24px 0;">
                        <a href="{sharepoint_link}"
                           style="background-color: #2563eb; color: white; padding: 12px 28px;
                                  border-radius: 8px; text-decoration: none; font-weight: 600;
                                  font-size: 0.95rem; display: inline-block;">
                            🔗 View Transaction
                        </a>
                    </div>

                    <p style="font-size: 0.85rem; color: #9ca3af; text-align: center;">
                        Please take the necessary action at your earliest convenience.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #f3f4f6; padding: 16px 32px; text-align: center;
                            font-size: 0.8rem; color: #9ca3af;">
                    This is an automated notification from the SCM Monitoring System.<br>
                    Please do not reply to this email.
                </div>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html_body, 'html'))

        recipients = [to_email]
        if cc_email:
            recipients.append(cc_email)

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, recipients, msg.as_string())

        print(f"✅ Escalation email sent → {to_email} (CC: {cc_email})")
        return True

    except Exception as e:
        print(f"❌ Email send failed: {e}")
        return False