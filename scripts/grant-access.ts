/**
 * Grant or revoke the `allowed` custom claim on a Firebase user.
 *
 * Prerequisites:
 *   1. Install firebase-admin: npm install -D firebase-admin ts-node
 *   2. Download a service account key from Firebase Console →
 *      Project Settings → Service Accounts → Generate new private key
 *   3. Set env var: GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *
 * Usage:
 *   npx ts-node scripts/grant-access.ts someone@gmail.com         # grant
 *   npx ts-node scripts/grant-access.ts someone@gmail.com revoke  # revoke
 */

import * as admin from "firebase-admin";

const [email, action] = process.argv.slice(2);

if (!email) {
  console.error("Usage: npx ts-node scripts/grant-access.ts <email> [revoke]");
  process.exit(1);
}

admin.initializeApp();

async function main() {
  const user = await admin.auth().getUserByEmail(email);
  const claims = action === "revoke" ? {} : { allowed: true };
  await admin.auth().setCustomUserClaims(user.uid, claims);

  console.log(
    action === "revoke"
      ? `Access revoked for ${email}`
      : `Access granted to ${email}`
  );
}

main().then(() => process.exit(0)).catch((err) => { console.error(err.message); process.exit(1); });
