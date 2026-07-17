import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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
import { setUserProfile } from '../firebase/firestore';

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
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithPopup(auth, googleProvider);
  const profile = await import('../firebase/firestore').then((m) => m.getUserProfile(credential.user.uid));
  if (!profile) {
    await setUserProfile(credential.user.uid, {
      fullName: credential.user.displayName || '',
      email: credential.user.email,
      currency: 'USD',
      language: 'en',
      dateFormat: 'MMM_D_YYYY',
      theme: 'light',
      createdAt: new Date().toISOString(),
    });
  }
  return credential.user;
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
  return map[code] || `Something went wrong (${code || 'no error code'}). Please try again.`;
}
