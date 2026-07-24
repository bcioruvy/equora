import { useState } from 'react';
import {
  User, Mail, Globe, Palette, Calendar, DollarSign, Download, Trash2, Lock,
  ShieldCheck, ShieldAlert, Plus, Pencil, Landmark, Wallet, PiggyBank, CreditCard, Banknote,
} from 'lucide-react';
import { PageShell } from '../layout/PageShell';
import { SettingsSection } from './SettingsSection';
import { Input, Select } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { Avatar, IconButton, Badge } from '../ui/Misc';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { Modal } from '../ui/Modal';
import { AccountFormModal } from './AccountFormModal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../ui/Toast';
import { setUserProfile, deleteAccount as deleteFinanceAccountRecord } from '../../firebase/firestore';
import { resendVerificationEmail, changePassword, deleteAccountPermanently, mapAuthError } from '../../firebase/auth';
import { CURRENCIES, LANGUAGES, DATE_FORMATS, ACCOUNT_TYPES } from '../../lib/constants';
import { formatMoney } from '../../lib/format';
import { exportTransactionsToCSV } from '../../lib/exporters';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './SettingsSection.css';

const ACCOUNT_ICONS = { cash: Banknote, bank: Landmark, savings: PiggyBank, wallet: Wallet, credit_card: CreditCard };

export function SettingsPage() {
  const { user, profile, isVerified } = useAuth();
  const { theme, setTheme } = useTheme();
  const { transactions, accounts, accountsWithBalance } = useData();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(profile?.fullName || user?.displayName || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [accountModal, setAccountModal] = useState({ open: false, account: null });
  const [pwModal, setPwModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateFirebaseProfile(auth.currentUser, { displayName: fullName.trim() });
      await setUserProfile(user.uid, { fullName: fullName.trim() });
      showToast('Profile updated', { tone: 'success' });
    } catch {
      showToast('Could not update profile.', { tone: 'error' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function updatePreference(key, value) {
    try {
      await setUserProfile(user.uid, { [key]: value });
      showToast('Preference saved', { tone: 'success', duration: 2000 });
    } catch {
      showToast('Could not save preference.', { tone: 'error' });
    }
  }

  async function handleResendVerification() {
    try {
      await resendVerificationEmail();
      showToast('Verification email sent', { tone: 'success' });
    } catch {
      showToast('Could not send email. Try again shortly.', { tone: 'error' });
    }
  }

  function handleExportAllData() {
    exportTransactionsToCSV(transactions, accounts, 'equora-all-data.csv');
    showToast('Your data export is ready', { tone: 'success' });
  }

  function handleBackupData() {
    const backup = { exportedAt: new Date().toISOString(), profile, transactions, accounts };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Backup downloaded', { tone: 'success' });
  }

  async function handleDeleteFinanceAccount(id) {
    if (!window.confirm('Delete this account? Transactions linked to it will remain but show no account.')) return;
    try {
      await deleteFinanceAccountRecord(user.uid, id);
      showToast('Account removed', { tone: 'success' });
    } catch {
      showToast('Could not remove account.', { tone: 'error' });
    }
  }

  return (
    <PageShell title="Settings" subtitle="Manage your profile, preferences, and security.">
      <div className="eq-settings-grid">
        <SettingsSection title="Profile" subtitle="Your personal information" icon={<User size={16} />}>
          <div className="eq-photo-row">
            <Avatar name={fullName || user?.email} photoUrl={profile?.photoUrl} size={56} />
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Profile photos are set via your Google account when signing in with Google.
              </p>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Full name" icon={<User size={16} />} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Email address" icon={<Mail size={16} />} value={user?.email || ''} disabled hint="Your email address cannot be changed here." />
            <Button type="submit" loading={savingProfile} style={{ alignSelf: 'flex-start' }}>Save changes</Button>
          </form>
        </SettingsSection>

        <SettingsSection title="Security" subtitle="Keep your account safe" icon={<Lock size={16} />}>
          <div className="eq-settings-row">
            <div className="eq-settings-row__text">
              <span className="eq-settings-row__label">Email verification</span>
              <span className="eq-settings-row__desc">
                {isVerified ? 'Your email address is verified.' : 'Your email address is not yet verified.'}
              </span>
            </div>
            {isVerified ? (
              <Badge tone="positive" icon={<ShieldCheck size={12} />}>Verified</Badge>
            ) : (
              <Button size="sm" variant="secondary" icon={<ShieldAlert size={14} />} onClick={handleResendVerification}>Resend</Button>
            )}
          </div>
          <div className="eq-settings-row">
            <div className="eq-settings-row__text">
              <span className="eq-settings-row__label">Password</span>
              <span className="eq-settings-row__desc">Change your account password.</span>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setPwModal(true)}>Change password</Button>
          </div>
        </SettingsSection>

        <SettingsSection title="Preferences" subtitle="Customize your experience" icon={<Palette size={16} />}>
          <div className="eq-settings-row">
            <div className="eq-settings-row__text">
              <span className="eq-settings-row__label">Theme</span>
              <span className="eq-settings-row__desc">Switch between light and dark mode.</span>
            </div>
            <ToggleSwitch checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} label="Toggle dark mode" />
          </div>
          <Select
            label="Currency"
            icon={<DollarSign size={16} />}
            options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.label} (${c.symbol})` }))}
            value={profile?.currency || 'USD'}
            onChange={(e) => updatePreference('currency', e.target.value)}
          />
          <Select
            label="Language"
            icon={<Globe size={16} />}
            options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
            value={profile?.language || 'en'}
            onChange={(e) => updatePreference('language', e.target.value)}
          />
          <Select
            label="Date format"
            icon={<Calendar size={16} />}
            options={DATE_FORMATS.map((d) => ({ value: d.id, label: d.label }))}
            value={profile?.dateFormat || 'MMM_D_YYYY'}
            onChange={(e) => updatePreference('dateFormat', e.target.value)}
          />
        </SettingsSection>

        <SettingsSection title="Data Management" subtitle="Export, back up, or remove your data" icon={<Download size={16} />}>
          <div className="eq-settings-row">
            <div className="eq-settings-row__text">
              <span className="eq-settings-row__label">Export your data</span>
              <span className="eq-settings-row__desc">Download all transactions as a CSV file.</span>
            </div>
            <Button size="sm" variant="secondary" onClick={handleExportAllData}>Export CSV</Button>
          </div>
          <div className="eq-settings-row">
            <div className="eq-settings-row__text">
              <span className="eq-settings-row__label">Backup your data</span>
              <span className="eq-settings-row__desc">Download a full JSON backup of your account.</span>
            </div>
            <Button size="sm" variant="secondary" onClick={handleBackupData}>Download backup</Button>
          </div>
          <div className="eq-settings-row eq-danger-zone" style={{ padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <div className="eq-settings-row__text">
              <span className="eq-settings-row__label" style={{ color: 'var(--negative)' }}>Delete account</span>
              <span className="eq-settings-row__desc">Permanently delete your account and all associated data.</span>
            </div>
            <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => setDeleteModal(true)}>Delete</Button>
          </div>
        </SettingsSection>
      </div>

      <div style={{ marginTop: 16 }}>
        <SettingsSection
          title="Accounts"
          subtitle="Manage your cash, bank, savings, wallet, and credit card accounts"
          icon={<Wallet size={16} />}
        >
          {accounts.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No accounts yet — add one to start tracking balances.</p>
          ) : (
            accountsWithBalance.map((a) => {
              const Icon = ACCOUNT_ICONS[a.type] || Wallet;
              return (
                <div key={a.id} className="eq-account-list-item">
                  <span className="eq-account-list-item__icon"><Icon size={16} /></span>
                  <div className="eq-account-list-item__main">
                    <div className="eq-account-list-item__name">{a.name}</div>
                    <div className="eq-account-list-item__type">{ACCOUNT_TYPES.find((t) => t.id === a.type)?.label}</div>
                  </div>
                  <span className="eq-account-list-item__balance mono-num">{formatMoney(a.balance, profile?.currency || 'USD')}</span>
                  <div className="eq-account-list-item__actions">
                    <IconButton icon={<Pencil size={14} />} label="Edit account" onClick={() => setAccountModal({ open: true, account: a })} />
                    <IconButton icon={<Trash2 size={14} />} label="Delete account" tone="danger" onClick={() => handleDeleteFinanceAccount(a.id)} />
                  </div>
                </div>
              );
            })
          )}
          <Button
            variant="secondary"
            icon={<Plus size={15} />}
            onClick={() => setAccountModal({ open: true, account: null })}
            style={{ alignSelf: 'flex-start', marginTop: 4 }}
          >
            Add account
          </Button>
        </SettingsSection>
      </div>

      <AccountFormModal
        isOpen={accountModal.open}
        editingAccount={accountModal.account}
        onClose={() => setAccountModal({ open: false, account: null })}
      />
      <ChangePasswordModal isOpen={pwModal} onClose={() => setPwModal(false)} />
      <DeleteAccountModal isOpen={deleteModal} onClose={() => setDeleteModal(false)} />
    </PageShell>
  );
}

function ChangePasswordModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!form.current) newErrors.current = 'Enter your current password';
    if (!form.next || form.next.length < 8) newErrors.next = 'New password must be at least 8 characters';
    if (form.next !== form.confirm) newErrors.confirm = 'Passwords do not match';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSaving(true);
    try {
      await changePassword(form.current, form.next);
      showToast('Password changed successfully', { tone: 'success' });
      setForm({ current: '', next: '', confirm: '' });
      onClose();
    } catch (err) {
      showToast(mapAuthError(err), { tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change password"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>Update password</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Current password" type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} error={errors.current} required />
        <Input label="New password" type="password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} error={errors.next} required />
        <Input label="Confirm new password" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={errors.confirm} required />
      </form>
    </Modal>
  );
}

function DeleteAccountModal({ isOpen, onClose }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) {
      setError('Enter your password to confirm');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccountPermanently(password);
    } catch (err) {
      showToast(mapAuthError(err), { tone: 'error' });
      setDeleting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete your account"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleSubmit} loading={deleting}>Delete permanently</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          This will permanently delete your account. Your transactions, budgets, and goals will remain in the database but
          will no longer be accessible to you. This action cannot be undone.
        </p>
        <Input
          label="Confirm your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          required
        />
      </form>
    </Modal>
  );
}
