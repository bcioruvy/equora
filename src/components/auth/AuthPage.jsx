import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { Input, Checkbox } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  resetPassword,
  mapAuthError,
} from '../../firebase/auth';
import { isValidEmail, validatePassword, passwordStrength } from '../../lib/validation';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import './AuthPage.css';

const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

export function AuthPage() {
  const [tab, setTab] = useState('signin');
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const from = location.state?.from?.pathname || '/app/dashboard';

  return (
    <div className="eq-auth">
      <div className="eq-auth__panel eq-auth__brand-panel">
        <div className="eq-auth__brand-content">
          <div className="eq-auth__brand-mark">
            <img src="/equora-mark.svg" alt="" width={44} height={44} />
            <span>Equora</span>
          </div>
          <h1 className="eq-auth__brand-headline">Personal finance, balanced.</h1>
          <p className="eq-auth__brand-sub">
            Track income and expenses, build budgets that hold, and watch your savings goals tip in your favor.
          </p>
          <BeamIllustration />
        </div>
      </div>

      <div className="eq-auth__panel eq-auth__form-panel">
        <div className="eq-auth__form-wrap">
          <div className="eq-auth__tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'signin'}
              className={`eq-auth__tab ${tab === 'signin' ? 'eq-auth__tab--active' : ''}`}
              onClick={() => setTab('signin')}
            >
              Sign In
            </button>
            <button
              role="tab"
              aria-selected={tab === 'signup'}
              className={`eq-auth__tab ${tab === 'signup' ? 'eq-auth__tab--active' : ''}`}
              onClick={() => setTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {tab === 'signin' ? (
            <SignInForm onSuccess={() => navigate(from, { replace: true })} onForgot={() => setForgotOpen(true)} />
          ) : (
            <SignUpForm onSuccess={() => { showToast('Account created — check your inbox to verify your email.', { tone: 'success', duration: 6000 }); navigate(from, { replace: true }); }} />
          )}

          <div className="eq-auth__divider"><span>or continue with</span></div>

          <GoogleButton onSuccess={() => navigate(from, { replace: true })} />

          <p className="eq-auth__switch">
            {tab === 'signin' ? (
              <>Don't have an account? <button onClick={() => setTab('signup')}>Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setTab('signin')}>Sign in</button></>
            )}
          </p>
        </div>
      </div>

      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}

function SignInForm({ onSuccess, onForgot }) {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!isValidEmail(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.password) newErrors.password = 'Enter your password';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLoading(true);
    try {
      await signInWithEmail(form);
      showToast('Welcome back.', { tone: 'success' });
      onSuccess();
    } catch (err) {
      showToast(mapAuthError(err), { tone: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="eq-auth__form" onSubmit={handleSubmit} noValidate>
      <Input
        label="Email address"
        type="email"
        icon={<Mail size={16} />}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <Input
        label="Password"
        type="password"
        icon={<Lock size={16} />}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={errors.password}
        placeholder="Enter your password"
        autoComplete="current-password"
        required
      />
      <div className="eq-auth__row">
        <Checkbox
          label="Remember me"
          checked={form.rememberMe}
          onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
        />
        <button type="button" className="eq-auth__link" onClick={onForgot}>
          Forgot password?
        </button>
      </div>
      <Button type="submit" fullWidth size="lg" loading={loading}>
        Sign in
      </Button>
    </form>
  );
}

function SignUpForm({ onSuccess }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const strength = passwordStrength(form.password);

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Enter your full name';
    if (!isValidEmail(form.email)) newErrors.email = 'Enter a valid email address';
    const pwErrors = validatePassword(form.password);
    if (pwErrors.length) newErrors.password = `Password needs: ${pwErrors.join(', ').toLowerCase()}`;
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLoading(true);
    try {
      await signUpWithEmail(form);
      onSuccess();
    } catch (err) {
      showToast(mapAuthError(err), { tone: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="eq-auth__form" onSubmit={handleSubmit} noValidate>
      <Input
        label="Full name"
        icon={<User size={16} />}
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        error={errors.fullName}
        placeholder="Jordan Khan"
        autoComplete="name"
        required
      />
      <Input
        label="Email address"
        type="email"
        icon={<Mail size={16} />}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <div>
        <Input
          label="Password"
          type="password"
          icon={<Lock size={16} />}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          placeholder="Create a password"
          autoComplete="new-password"
          required
        />
        {form.password && (
          <div className="eq-auth__strength">
            <div className="eq-auth__strength-bars">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={i < strength ? 'eq-auth__strength-bar--filled' : 'eq-auth__strength-bar'} />
              ))}
            </div>
            <span className="eq-auth__strength-label">{STRENGTH_LABELS[strength]}</span>
          </div>
        )}
      </div>
      <Input
        label="Confirm password"
        type="password"
        icon={<Lock size={16} />}
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        error={errors.confirmPassword}
        placeholder="Re-enter your password"
        autoComplete="new-password"
        required
      />
      <Button type="submit" fullWidth size="lg" loading={loading}>
        Create account
      </Button>
      <p className="eq-auth__terms">
        By signing up, you agree to keep your own data accurate. Equora stores your financial records securely and never shares them.
      </p>
    </form>
  );
}

function GoogleButton({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleClick() {
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        showToast(mapAuthError(err), { tone: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="eq-auth__google-btn" onClick={handleClick} disabled={loading} type="button">
      {loading ? <Loader2 size={18} className="eq-spin" /> : <GoogleIcon />}
      Continue with Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.08-1.81 2.72v2.26h2.92c1.71-1.57 2.69-3.89 2.69-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.87-3.04.87-2.34 0-4.32-1.58-5.03-3.71H.96v2.33C2.44 15.98 5.48 18 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function BeamIllustration() {
  return (
    <svg viewBox="0 0 360 160" className="eq-auth__illustration" aria-hidden="true">
      <line x1="180" y1="20" x2="180" y2="62" stroke="rgba(250,248,244,0.35)" strokeWidth="2" />
      <g style={{ transform: 'rotate(-6deg)', transformOrigin: '180px 62px' }}>
        <line x1="40" y1="62" x2="320" y2="62" stroke="rgba(250,248,244,0.4)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="62" r="9" fill="#3ba88c" />
        <path d="M28 62 C28 78, 52 78, 52 62" stroke="rgba(250,248,244,0.4)" strokeWidth="2" fill="none" />
        <circle cx="320" cy="62" r="9" fill="#d97062" />
        <path d="M308 62 C308 74, 332 74, 332 62" stroke="rgba(250,248,244,0.4)" strokeWidth="2" fill="none" />
      </g>
      <polygon points="180,62 165,98 195,98" fill="rgba(250,248,244,0.3)" />
      <line x1="150" y1="100" x2="210" y2="100" stroke="rgba(250,248,244,0.4)" strokeWidth="3" strokeLinecap="round" />
      <text x="40" y="100" fill="rgba(250,248,244,0.6)" fontSize="11" fontFamily="Inter" textAnchor="middle">Income</text>
      <text x="320" y="100" fill="rgba(250,248,244,0.6)" fontSize="11" fontFamily="Inter" textAnchor="middle">Expense</text>
    </svg>
  );
}
