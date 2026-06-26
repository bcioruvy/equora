import { useState } from 'react';
import { MailWarning } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resendVerificationEmail } from '../../firebase/auth';
import { useToast } from '../ui/Toast';
import './VerificationBanner.css';

export function VerificationBanner() {
  const { user, isVerified } = useAuth();
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { showToast } = useToast();

  if (!user || isVerified || dismissed) return null;

  async function handleResend() {
    setSending(true);
    try {
      await resendVerificationEmail();
      showToast('Verification email sent.', { tone: 'success' });
    } catch {
      showToast('Could not send email. Try again shortly.', { tone: 'error' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="eq-verify-banner" role="alert">
      <MailWarning size={16} />
      <span>Please verify your email address to secure your account.</span>
      <button onClick={handleResend} disabled={sending}>
        {sending ? 'Sending…' : 'Resend email'}
      </button>
      <button className="eq-verify-banner__dismiss" onClick={() => setDismissed(true)} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
