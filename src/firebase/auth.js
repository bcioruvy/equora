import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { setUserProfile, getUserProfile } from '../firebase/firestore';

export async function signUpWithEmail({ fullName, email, password }) {
  await setPersistence(auth, browserLocalPersistence);
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: fullName });
  await sendEmailVerification(credential.user);
  await setUserProfile(credential.user.uid, {
    fullName,
    email,
    currency: 'USD',
    language: 'en',
    dateFormat: 'MMM_D_YYYY',
    theme: 'light',
    createdAt: new Date().toISOString(),
  });
  return credential.user;
}

export async function signInWithEmail({ email, password, rememberMe }) {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle() {
  // Safari (especially on iPad) frequently blocks signInWithPopup, so we use
  // a full-page redirect instead — this navigates away and back, and the
  // result is picked up by completeGoogleRedirectSignIn() on return.
  sessionStorage.setItem('eq-google-redirect-pending', '1');
  await setPersistence(auth, browserLocalPersistence);
  await signInWithRedirect(auth, googleProvider);
}

export async function completeGoogleRedirectSignIn() {
  const result = await getRedirectResult(auth);
  if (!result?.user) return null;
  const profile = await getUserProfile(result.user.uid);
  if (!profile) {
    await setUserProfile(result.user.uid, {
      fullName: result.user.displayName || '',
      email: result.user.email,
      currency: 'USD',
      language: 'en',
      dateFormat: 'MMM_D_YYYY',
      theme: 'light',
      createdAt: new Date().toISOString(),
    });
  }
  return result.user;
}

export async function logout() {
  return signOut(auth);
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export async function resendVerificationEmail() {
  if (auth.currentUser) {
    return sendEmailVerification(auth.currentUser);
  }
}

export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function deleteAccountPermanently(currentPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  if (currentPassword) {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
  }
  await deleteUser(user);
}

export function mapAuthError(error) {
  const code = error?.code || '';
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
