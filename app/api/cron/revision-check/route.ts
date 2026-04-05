import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { adminDb } from "@/lib/firebase-admin";
import { differenceInDays, format } from "date-fns";
import { cs } from "date-fns/locale";
import * as admin from "firebase-admin";

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
    return differenceInDays(today, lastSentDate) >= 1;
  }
  return false;
}

function buildEmailHtml(
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

export async function GET(req: NextRequest) {
  // Verify the request comes from Vercel Cron (or manual trigger with secret)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  const recipients = [
    process.env.NOTIFICATION_EMAIL_1,
    process.env.NOTIFICATION_EMAIL_2,
  ].filter(Boolean) as string[];

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No recipient emails configured" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://your-app.vercel.app";
  const resend = new Resend(resendApiKey);
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const toolsSnap = await adminDb
    .collection("tools")
    .where("nextRevisionDate", "<=", admin.firestore.Timestamp.fromDate(thirtyDaysFromNow))
    .get();

  if (toolsSnap.empty) {
    return NextResponse.json({ sent: 0, message: "No tools due for notification" });
  }

  let sentCount = 0;

  for (const toolDoc of toolsSnap.docs) {
    const tool = toolDoc.data();
    if (!tool.nextRevisionDate) continue;

    const nextRevDate: Date = tool.nextRevisionDate.toDate();
    const daysUntil = differenceInDays(nextRevDate, today);
    const notifType = getNotificationType(daysUntil);
    if (!notifType) continue;

    const lastSentAt = tool.lastNotificationSentAt?.[notifType] as
      | admin.firestore.Timestamp
      | undefined;
    if (!shouldSendNotification(notifType, lastSentAt, today)) continue;

    const subject =
      notifType === "overdue"
        ? `UPOZORNĚNÍ: Revize po termínu – ${tool.serialNumber}`
        : notifType === "due_soon_7"
        ? `Připomínka: Revize za 7 dní – ${tool.serialNumber}`
        : `Připomínka: Revize za 30 dní – ${tool.serialNumber}`;

    const html = buildEmailHtml(
      tool.model,
      tool.serialNumber,
      notifType,
      daysUntil,
      nextRevDate,
      toolDoc.id,
      appUrl
    );

    try {
      await resend.emails.send({
        from: "Revize nástrojů <onboarding@resend.dev>",
        to: recipients,
        subject,
        html,
      });

      await toolDoc.ref.update({
        [`lastNotificationSentAt.${notifType}`]: admin.firestore.FieldValue.serverTimestamp(),
        status: daysUntil < 0 ? "overdue" : "due_soon",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      sentCount++;
    } catch (err) {
      console.error(`Failed to send email for ${tool.serialNumber}:`, err);
    }
  }

  return NextResponse.json({ sent: sentCount });
}
