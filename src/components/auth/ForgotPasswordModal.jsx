import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { resetPassword, mapAuthError } from '../../firebase/auth';
import { isValidEmail } from '../../lib/validation';

export function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      showToast(mapAuthError(err), { tone: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSent(false);
    setEmail('');
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset your password" size="sm">
      {sent ? (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            If an account exists for <strong>{email}</strong>, a password reset link is on its way.
          </p>
          <Button fullWidth onClick={handleClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Enter the email address linked to your account and we'll send a link to reset your password.
          </p>
          <Input
            label="Email address"
            type="email"
            icon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            placeholder="you@example.com"
            required
          />
          <div style={{ marginTop: 20 }}>
            <Button type="submit" fullWidth loading={loading}>Send reset link</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
