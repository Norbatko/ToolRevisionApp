import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { differenceInDays, format } from "date-fns";
import { cs } from "date-fns/locale";
import { defineSecret } from "firebase-functions/params";

export const gmailAppPassword = defineSecret("GMAIL_APP_PASSWORD");
export const gmailUser = defineSecret("GMAIL_USER");
export const notificationEmail1 = defineSecret("NOTIFICATION_EMAIL_1");
export const notificationEmail2 = defineSecret("NOTIFICATION_EMAIL_2");

type NotificationType = "overdue" | "due_soon_7" | "due_soon_30";

function formatDateCz(date: Date): string {
  return format(date, "d. M. yyyy", { locale: cs });
}

function getNotificationType(daysUntil: number): NotificationType | null {
  if (daysUntil < 0) return "overdue";
  if (daysUntil <= 7) return "due_soon_7";
  if (daysUntil <= 30) return "due_soon_30";
  return null;
}

function shouldSendNotification(
  notifType: NotificationType,
  lastSentAt: admin.firestore.Timestamp | undefined,
  today: Date
): boolean {
  if (!lastSentAt) return true;
  const lastSentDate = lastSentAt.toDate();

  if (notifType === "overdue") {
    // Send daily for overdue: resend if last sent was not today
    return differenceInDays(today, lastSentDate) >= 1;
  }
  // For due_soon_7 and due_soon_30: send once per cycle
  return false;
}

function buildEmailHtml(
  toolIdentifier: string,
  toolModel: string,
  toolSerial: string,
  notifType: NotificationType,
  daysUntil: number,
  nextRevisionDate: Date,
  toolId: string,
  appUrl: string
): string {
  const dateStr = formatDateCz(nextRevisionDate);
  const toolUrl = `${appUrl}/nastroje/${toolId}`;

  let urgencyText = "";
  if (notifType === "overdue") {
    urgencyText = `<span style="color:#dc2626;font-weight:bold;">REVIZE JE PO TERMÍNU o ${Math.abs(daysUntil)} dní</span>`;
  } else if (notifType === "due_soon_7") {
    urgencyText = `<span style="color:#d97706;font-weight:bold;">Revize za 7 dní</span>`;
  } else {
    urgencyText = `<span style="color:#2563eb;font-weight:bold;">Revize za 30 dní</span>`;
  }

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px;">
      <h2 style="margin-bottom:4px;">Revize nástrojů – připomínka</h2>
      <p style="color:#6b7280;font-size:14px;margin-top:0;">Automatické upozornění</p>

      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:600;">${toolIdentifier}</p>
        <p style="margin:0 0 4px;color:#374151;font-size:14px;">Model: ${toolModel}</p>
        <p style="margin:0 0 4px;color:#374151;font-size:14px;">Sériové číslo: ${toolSerial}</p>
        <p style="margin:0;color:#374151;font-size:14px;">Datum příští revize: <strong>${dateStr}</strong></p>
      </div>

      <p style="font-size:16px;">${urgencyText}</p>

      <a href="${toolUrl}"
         style="display:inline-block;background:#2563eb;color:white;padding:10px 20px;
                border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px;">
        Zobrazit nástroj
      </a>

      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
        Revize nástrojů – správa technických revizí záchranářských nástrojů
      </p>
    </div>
  `;
}

export async function runDailyCheck(): Promise<void> {
  const db = admin.firestore();
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // Get app URL from environment or use placeholder
  const appUrl = process.env.APP_URL ?? "https://your-app.vercel.app";

  // Query tools due within 30 days OR already overdue
  const toolsSnap = await db
    .collection("tools")
    .where("nextRevisionDate", "<=", admin.firestore.Timestamp.fromDate(thirtyDaysFromNow))
    .get();

  if (toolsSnap.empty) {
    console.log("No tools due for notification");
    return;
  }

  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser.value(),
      pass: gmailAppPassword.value(),
    },
  });

  const recipients = [notificationEmail1.value(), notificationEmail2.value()].filter(Boolean);

  let sentCount = 0;

  for (const toolDoc of toolsSnap.docs) {
    const tool = toolDoc.data();
    if (!tool.nextRevisionDate) continue;

    const nextRevDate: Date = tool.nextRevisionDate.toDate();
    const daysUntil = differenceInDays(nextRevDate, today);
    const notifType = getNotificationType(daysUntil);
    if (!notifType) continue;

    // Check throttle
    const lastSentAt = tool.lastNotificationSentAt?.[notifType] as admin.firestore.Timestamp | undefined;
    if (!shouldSendNotification(notifType, lastSentAt, today)) {
      console.log(`Skipping ${tool.identifier} (${notifType}) — already notified`);
      continue;
    }

    // Build email
    const subject =
      notifType === "overdue"
        ? `UPOZORNĚNÍ: Revize po termínu – ${tool.identifier}`
        : notifType === "due_soon_7"
        ? `Připomínka: Revize za 7 dní – ${tool.identifier}`
        : `Připomínka: Revize za 30 dní – ${tool.identifier}`;

    const html = buildEmailHtml(
      tool.identifier,
      tool.model,
      tool.serialNumber,
      notifType,
      daysUntil,
      nextRevDate,
      toolDoc.id,
      appUrl
    );

    try {
      await transporter.sendMail({
        from: `"Revize nástrojů" <${gmailUser.value()}>`,
        to: recipients.join(", "),
        subject,
        html,
      });

      // Update lastNotificationSentAt
      await toolDoc.ref.update({
        [`lastNotificationSentAt.${notifType}`]: admin.firestore.FieldValue.serverTimestamp(),
        // Also update status
        status: daysUntil < 0 ? "overdue" : "due_soon",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      sentCount++;
      console.log(`Sent ${notifType} notification for ${tool.identifier}`);
    } catch (err) {
      console.error(`Failed to send email for ${tool.identifier}:`, err);
    }
  }

  console.log(`Daily check complete: sent ${sentCount} notification emails`);
}
