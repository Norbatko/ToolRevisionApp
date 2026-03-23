/**
 * Grant or revoke access for a user.
 *
 * - If the user has already signed in: sets/clears the `allowed` custom claim directly.
 * - If the user has never signed in: adds/removes their email from the Firestore
 *   `allowlist` collection so they get the claim automatically on first sign-in.
 *
 * Prerequisites:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *
 * Usage:
 *   npx tsx scripts/grant-access.ts someone@gmail.com         # grant
 *   npx tsx scripts/grant-access.ts someone@gmail.com revoke  # revoke
 */

import * as admin from "firebase-admin";

const [email, action] = process.argv.slice(2);
const revoking = action === "revoke";

if (!email) {
  console.error("Usage: npx tsx scripts/grant-access.ts <email> [revoke]");
  process.exit(1);
}

admin.initializeApp();

async function main() {
  // Try to find an existing Firebase Auth user
  let user: admin.auth.UserRecord | null = null;
  try {
    user = await admin.auth().getUserByEmail(email);
  } catch (err: any) {
    if (err.code !== "auth/user-not-found") throw err;
  }

  if (user) {
    // User exists — set/clear claim directly
    await admin.auth().setCustomUserClaims(user.uid, revoking ? {} : { allowed: true });
    console.log(revoking ? `Claim removed for ${email}` : `Claim granted to ${email}`);
  }

  // Also update Firestore allowlist (covers the "never signed in" case)
  const ref = admin.firestore().collection("allowlist").doc(email);
  if (revoking) {
    await ref.delete();
    console.log(`Removed ${email} from allowlist`);
  } else {
    await ref.set({ grantedAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log(`Added ${email} to allowlist`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err.message); process.exit(1); });
