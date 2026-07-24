import { useState } from 'react';
import { Wallet, Plus, Pencil, Trash2, Landmark, PiggyBank, CreditCard, Banknote } from 'lucide-react';
import { PageShell } from '../layout/PageShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { IconButton, EmptyState } from '../ui/Misc';
import { AccountFormModal } from '../settings/AccountFormModal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../ui/Toast';
import { deleteAccount as deleteFinanceAccountRecord } from '../../firebase/firestore';
import { ACCOUNT_TYPES } from '../../lib/constants';
import { formatMoney } from '../../lib/format';
import './AccountsPage.css';

const ACCOUNT_ICONS = { cash: Banknote, bank: Landmark, savings: PiggyBank, wallet: Wallet, credit_card: CreditCard };

export function AccountsPage() {
  const { user, profile } = useAuth();
  const { accountsWithBalance } = useData();
  const { showToast } = useToast();
  const currency = profile?.currency || 'USD';

  const [accountModal, setAccountModal] = useState({ open: false, account: null });

  const total = accountsWithBalance.reduce((sum, a) => sum + a.balance, 0);

  async function handleDelete(id) {
    if (!window.confirm('Delete this account? Transactions linked to it will remain but show no account.')) return;
    try {
      await deleteFinanceAccountRecord(user.uid, id);
      showToast('Account removed', { tone: 'success' });
    } catch {
      showToast('Could not remove account.', { tone: 'error' });
    }
  }

  return (
    <PageShell
      title="Accounts"
      subtitle="Every account's balance here updates automatically as you record transactions and transfers."
      actions={
        <Button icon={<Plus size={16} />} onClick={() => setAccountModal({ open: true, account: null })}>
          Add Account
        </Button>
      }
    >
      <Card>
        <div className="eq-accounts-total">
          <span className="eq-accounts-total__label">Total across all accounts</span>
          <span className="eq-accounts-total__value mono-num">{formatMoney(total, currency)}</span>
        </div>
      </Card>

      {accountsWithBalance.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <Card>
            <EmptyState
              icon={<Wallet size={28} />}
              title="No accounts yet"
              description="Add your bank account, mobile wallet, or cash on hand to start tracking real balances."
              action={
                <Button icon={<Plus size={16} />} onClick={() => setAccountModal({ open: true, account: null })}>
                  Add Account
                </Button>
              }
            />
          </Card>
        </div>
      ) : (
        <div className="eq-grid eq-grid--three" style={{ marginTop: 24 }}>
          {accountsWithBalance.map((a) => {
            const Icon = ACCOUNT_ICONS[a.type] || Wallet;
            const isNegative = a.balance < 0;
            return (
              <Card key={a.id}>
                <div className="eq-account-card">
                  <div className="eq-account-card__top">
                    <span className="eq-account-card__icon"><Icon size={18} /></span>
                    <div className="eq-account-card__actions">
                      <IconButton icon={<Pencil size={14} />} label="Edit account" onClick={() => setAccountModal({ open: true, account: a })} />
                      <IconButton icon={<Trash2 size={14} />} label="Delete account" tone="danger" onClick={() => handleDelete(a.id)} />
                    </div>
                  </div>
                  <div className="eq-account-card__name">{a.name}</div>
                  <div className="eq-account-card__type">{ACCOUNT_TYPES.find((t) => t.id === a.type)?.label}</div>
                  <div className={`eq-account-card__balance mono-num ${isNegative ? 'eq-account-card__balance--negative' : ''}`}>
                    {formatMoney(a.balance, currency)}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AccountFormModal
        isOpen={accountModal.open}
        editingAccount={accountModal.account}
        onClose={() => setAccountModal({ open: false, account: null })}
      />
    </PageShell>
  );
}
