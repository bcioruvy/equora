// ============================================================
// EQUORA — Shared domain constants
// ============================================================

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: 'Wallet' },
  { id: 'bonus', label: 'Bonus', icon: 'Gift' },
  { id: 'overtime', label: 'Overtime', icon: 'Clock' },
  { id: 'freelance', label: 'Freelance', icon: 'Laptop' },
  { id: 'investment_returns', label: 'Investment Returns', icon: 'TrendingUp' },
  { id: 'rental_income', label: 'Rental Income', icon: 'Home' },
  { id: 'gift_received', label: 'Gift Received', icon: 'Gift' },
  { id: 'refund', label: 'Refund', icon: 'RotateCcw' },
  { id: 'other_income', label: 'Other Income', icon: 'Plus' },
];

export const EXPENSE_CATEGORIES = [
  { id: 'food_dining', label: 'Food & Dining', icon: 'UtensilsCrossed' },
  { id: 'groceries', label: 'Groceries', icon: 'ShoppingBasket' },
  { id: 'transportation', label: 'Transportation', icon: 'Bus' },
  { id: 'fuel', label: 'Fuel', icon: 'Fuel' },
  { id: 'utilities', label: 'Utilities', icon: 'Plug' },
  { id: 'internet', label: 'Internet', icon: 'Wifi' },
  { id: 'mobile_package', label: 'Mobile Package', icon: 'Smartphone' },
  { id: 'rent', label: 'Rent', icon: 'Building2' },
  { id: 'mortgage', label: 'Mortgage', icon: 'Landmark' },
  { id: 'healthcare', label: 'Healthcare', icon: 'HeartPulse' },
  { id: 'insurance', label: 'Insurance', icon: 'ShieldCheck' },
  { id: 'education', label: 'Education', icon: 'GraduationCap' },
  { id: 'clothing', label: 'Clothing', icon: 'Shirt' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Clapperboard' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'RefreshCcw' },
  { id: 'travel', label: 'Travel', icon: 'Plane' },
  { id: 'family_support', label: 'Family Support', icon: 'Users' },
  { id: 'charity', label: 'Charity', icon: 'HandHeart' },
  { id: 'personal_care', label: 'Personal Care', icon: 'Sparkles' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { id: 'fitness', label: 'Fitness', icon: 'Dumbbell' },
  { id: 'emergency', label: 'Emergency', icon: 'AlertTriangle' },
  { id: 'miscellaneous', label: 'Miscellaneous', icon: 'MoreHorizontal' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function getCategoryById(id) {
  return ALL_CATEGORIES.find((c) => c.id === id) || { id, label: id, icon: 'Circle' };
}

export const ACCOUNT_TYPES = [
  { id: 'cash', label: 'Cash', icon: 'Banknote' },
  { id: 'bank', label: 'Bank Account', icon: 'Landmark' },
  { id: 'savings', label: 'Savings Account', icon: 'PiggyBank' },
  { id: 'wallet', label: 'Wallet', icon: 'Wallet' },
  { id: 'credit_card', label: 'Credit Card', icon: 'CreditCard' },
];

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'mobile_wallet', label: 'Mobile Wallet' },
  { id: 'cheque', label: 'Cheque' },
  { id: 'other', label: 'Other' },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'PKR', symbol: '₨', label: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', label: 'Saudi Riyal' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
];

export const DATE_FORMATS = [
  { id: 'MMM_D_YYYY', label: 'Jan 5, 2026', pattern: 'MMM d, yyyy' },
  { id: 'DD_MM_YYYY', label: '05/01/2026', pattern: 'dd/MM/yyyy' },
  { id: 'MM_DD_YYYY', label: '01/05/2026', pattern: 'MM/dd/yyyy' },
  { id: 'YYYY_MM_DD', label: '2026-01-05', pattern: 'yyyy-MM-dd' },
];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'ur', label: 'اردو' },
];

export const GOAL_TEMPLATES = [
  { id: 'emergency_fund', label: 'Emergency Fund', icon: 'ShieldAlert' },
  { id: 'new_phone', label: 'New Phone', icon: 'Smartphone' },
  { id: 'car', label: 'Car', icon: 'Car' },
  { id: 'house_deposit', label: 'House Deposit', icon: 'Home' },
  { id: 'travel_fund', label: 'Travel Fund', icon: 'Plane' },
  { id: 'education_fund', label: 'Education Fund', icon: 'GraduationCap' },
  { id: 'custom', label: 'Custom Goal', icon: 'Target' },
];

export const BUDGET_TYPES = [
  { id: 'monthly', label: 'Monthly Budget' },
  { id: 'category', label: 'Category Budget' },
  { id: 'savings', label: 'Savings Budget' },
];

export const RECURRENCE_OPTIONS = [
  { id: 'none', label: 'One-time' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];
