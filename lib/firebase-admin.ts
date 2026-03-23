import * as admin from "firebase-admin";

function initializeAdmin() {
  if (admin.apps.length > 0) return admin.app();

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountKey, "base64").toString("utf-8")
    );
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  // Fallback: use GOOGLE_APPLICATION_CREDENTIALS env var (local dev)
  return admin.initializeApp();
}

const app = initializeAdmin();
export const adminAuth = admin.auth(app);
export const adminDb = admin.firestore(app);
