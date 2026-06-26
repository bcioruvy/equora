import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCategoryById } from './constants';
import { formatMoney } from './format';

function rowsFromTransactions(transactions, accounts) {
  return transactions.map((t) => ({
    Date: t.date,
    Type: t.type === 'income' ? 'Income' : 'Expense',
    Category: getCategoryById(t.category).label,
    Amount: Number(t.amount).toFixed(2),
    Account: accounts.find((a) => a.id === t.accountId)?.name || '',
    'Payment Method': t.paymentMethod || '',
    Notes: t.notes || '',
    Tags: (t.tags || []).join(', '),
  }));
}

export function exportTransactionsToCSV(transactions, accounts, filename = 'equora-transactions.csv') {
  const rows = rowsFromTransactions(transactions, accounts);
  const csv = Papa.unparse(rows);
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

export function exportTransactionsToExcel(transactions, accounts, filename = 'equora-transactions.xlsx') {
  const rows = rowsFromTransactions(transactions, accounts);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, filename);
}

export function exportTransactionsToPDF(transactions, accounts, currency = 'USD', filename = 'equora-transactions.pdf') {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Equora — Transactions', 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [['Date', 'Type', 'Category', 'Amount', 'Account', 'Notes']],
    body: transactions.map((t) => [
      t.date,
      t.type === 'income' ? 'Income' : 'Expense',
      getCategoryById(t.category).label,
      formatMoney(t.amount, currency),
      accounts.find((a) => a.id === t.accountId)?.name || '',
      t.notes || '',
    ]),
    headStyles: { fillColor: [31, 111, 92] },
    styles: { fontSize: 9 },
  });

  doc.save(filename);
}

export function exportReportToPDF({ title, sections }, filename = 'equora-report.pdf') {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Equora — ${title}`, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, 14, 24);

  let cursorY = 32;
  sections.forEach((section) => {
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(section.heading, 14, cursorY);
    autoTable(doc, {
      startY: cursorY + 4,
      head: [section.columns],
      body: section.rows,
      headStyles: { fillColor: [31, 111, 92] },
      styles: { fontSize: 9 },
    });
    cursorY = doc.lastAutoTable.finalY + 14;
  });

  doc.save(filename);
}

// ---------- Named report builders ----------
// Each builder returns { columns, rows } shaped for both
// table display and the generic exportReportToPDF() helper.

export function buildMonthlySummaryReport(monthsTrend, currency) {
  const columns = ['Month', 'Income', 'Expense', 'Net Savings'];
  const rows = monthsTrend.map((m) => [m.month, formatMoney(m.income, currency), formatMoney(m.expense, currency), formatMoney(m.savings, currency, { signed: true })]);
  return { heading: 'Monthly Summary', columns, rows };
}

export function buildIncomeReport(transactions, accounts, currency) {
  const incomeTx = transactions.filter((t) => t.type === 'income');
  const columns = ['Date', 'Category', 'Amount', 'Account', 'Notes'];
  const rows = incomeTx.map((t) => [
    t.date,
    getCategoryById(t.category).label,
    formatMoney(t.amount, currency),
    accounts.find((a) => a.id === t.accountId)?.name || '',
    t.notes || '',
  ]);
  return { heading: 'Income Report', columns, rows };
}

export function buildExpenseReport(transactions, accounts, currency) {
  const expenseTx = transactions.filter((t) => t.type === 'expense');
  const columns = ['Date', 'Category', 'Amount', 'Account', 'Notes'];
  const rows = expenseTx.map((t) => [
    t.date,
    getCategoryById(t.category).label,
    formatMoney(t.amount, currency),
    accounts.find((a) => a.id === t.accountId)?.name || '',
    t.notes || '',
  ]);
  return { heading: 'Expense Report', columns, rows };
}

export function buildBudgetReport(budgets, currency) {
  const columns = ['Budget', 'Type', 'Limit', 'Spent', 'Remaining', 'Used %'];
  const rows = budgets.map((b) => [
    b.name,
    b.type,
    formatMoney(b.limit, currency),
    formatMoney(b.spent, currency),
    formatMoney(b.remaining, currency),
    `${b.percentUsed.toFixed(0)}%`,
  ]);
  return { heading: 'Budget Report', columns, rows };
}

export function buildSavingsReport(goals, currency) {
  const columns = ['Goal', 'Target', 'Current', 'Progress %', 'Deadline'];
  const rows = goals.map((g) => [
    g.name,
    formatMoney(g.targetAmount, currency),
    formatMoney(g.currentAmount || 0, currency),
    `${Math.min(100, ((g.currentAmount || 0) / Math.max(1, g.targetAmount)) * 100).toFixed(0)}%`,
    g.deadline || '—',
  ]);
  return { heading: 'Savings Report', columns, rows };
}

export function reportToRowsForTable(rows) {
  return rows;
}

export function exportRowsToCSV(columns, rows, filename) {
  const data = rows.map((row) => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
  const csv = Papa.unparse(data);
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

export function exportRowsToExcel(columns, rows, sheetName, filename) {
  const data = rows.map((row) => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
