/**
 * List all Firebase users who have the `allowed` custom claim.
 *
 * Prerequisites: same as grant-access.ts
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json npx ts-node scripts/list-access.ts
 */

import * as admin from "firebase-admin";

admin.initializeApp();

async function main() {
  const allowed: { email: string; uid: string }[] = [];
  let pageToken: string | undefined;

  do {
    const result = await admin.auth().listUsers(1000, pageToken);
    for (const user of result.users) {
      if (user.customClaims?.allowed === true) {
        allowed.push({ email: user.email ?? "(no email)", uid: user.uid });
      }
    }
    pageToken = result.pageToken;
  } while (pageToken);

  if (allowed.length === 0) {
    console.log("No users have access.");
  } else {
    console.log("Users with access:");
    for (const u of allowed) {
      console.log(`  ${u.email}  (uid: ${u.uid})`);
    }
  }
}

main().then(() => process.exit(0)).catch((err) => { console.error(err.message); process.exit(1); });
