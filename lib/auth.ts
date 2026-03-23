import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function isAllowedUser(user: User, forceRefresh = false): Promise<boolean> {
  const tokenResult = await user.getIdTokenResult(forceRefresh);
  return tokenResult.claims.allowed === true;
}

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
