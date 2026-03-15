import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  runDailyCheck,
  gmailAppPassword,
  gmailUser,
  notificationEmail1,
  notificationEmail2,
} from "./emailNotifications";

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Daily revision reminder — runs every day at 08:00 Prague time.
 * Checks for tools with upcoming or overdue revisions and sends email notifications.
 */
export const scheduledRevisionReminder = onSchedule(
  {
    schedule: "0 8 * * *",
    timeZone: "Europe/Prague",
    secrets: [gmailAppPassword, gmailUser, notificationEmail1, notificationEmail2],
  },
  async () => {
    await runDailyCheck();
  }
);
