/**
 * List all users with access (either via custom claim or pre-approved allowlist).
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json npx tsx scripts/list-access.ts
 */

import * as admin from "firebase-admin";

admin.initializeApp();

async function main() {
  // 1. Users who have already signed in and have the claim
  const withClaim: { email: string; uid: string }[] = [];
  let pageToken: string | undefined;
  do {
    const result = await admin.auth().listUsers(1000, pageToken);
    for (const user of result.users) {
      if (user.customClaims?.allowed === true) {
        withClaim.push({ email: user.email ?? "(no email)", uid: user.uid });
      }
    }
    pageToken = result.pageToken;
  } while (pageToken);

  // 2. Pre-approved emails (haven't signed in yet)
  const allowlistSnap = await admin.firestore().collection("allowlist").get();
  const preApproved = allowlistSnap.docs
    .map((d) => d.id)
    .filter((email) => !withClaim.find((u) => u.email === email));

  console.log("\n── Active users (have signed in) ──────────────────");
  if (withClaim.length === 0) {
    console.log("  (none)");
  } else {
    for (const u of withClaim) console.log(`  ${u.email}  (uid: ${u.uid})`);
  }

  console.log("\n── Pre-approved (never signed in yet) ─────────────");
  if (preApproved.length === 0) {
    console.log("  (none)");
  } else {
    for (const email of preApproved) console.log(`  ${email}`);
  }

  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err.message); process.exit(1); });
