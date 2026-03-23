import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const decoded = await adminAuth.verifyIdToken(idToken, true); // true = check revocation
    const { uid, email } = decoded;

    if (!email) return NextResponse.json({ error: "No email on account" }, { status: 400 });

    // Already has the claim — nothing to do
    if (decoded.allowed === true) return NextResponse.json({ granted: true });

    // Check pre-approved allowlist
    const doc = await adminDb.collection("allowlist").doc(email).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }

    // Grant the claim
    await adminAuth.setCustomUserClaims(uid, { allowed: true });
    return NextResponse.json({ granted: true });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
