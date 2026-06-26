export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password || '')) errors.push('One uppercase letter');
  if (!/[0-9]/.test(password || '')) errors.push('One number');
  return errors;
}

export function passwordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

export function isValidAmount(value) {
  const n = Number(value);
  return !Number.isNaN(n) && n > 0 && Number.isFinite(n);
}

export function sanitizeText(value, maxLength = 500) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export function validateTransactionForm(form) {
  const errors = {};
  if (!isValidAmount(form.amount)) errors.amount = 'Enter an amount greater than 0';
  if (!form.category) errors.category = 'Choose a category';
  if (!form.date) errors.date = 'Choose a date';
  if (!form.accountId) errors.accountId = 'Choose an account';
  if (form.notes && form.notes.length > 500) errors.notes = 'Notes must be under 500 characters';
  return errors;
}

export function validateBudgetForm(form) {
  const errors = {};
  if (!form.name || !form.name.trim()) errors.name = 'Give your budget a name';
  if (!isValidAmount(form.limit)) errors.limit = 'Enter a limit greater than 0';
  if (!form.period) errors.period = 'Choose a period';
  return errors;
}

export function validateGoalForm(form) {
  const errors = {};
  if (!form.name || !form.name.trim()) errors.name = 'Give your goal a name';
  if (!isValidAmount(form.targetAmount)) errors.targetAmount = 'Enter a target greater than 0';
  if (!form.deadline) errors.deadline = 'Choose a target date';
  return errors;
}
