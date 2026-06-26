// ============================================================
// EQUORA — Firestore data access layer
// Collections are nested under users/{uid}/... so security
// rules can isolate every user's data with one owner check.
// ============================================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

function userCollection(uid, name) {
  return collection(db, 'users', uid, name);
}

// ---------- Generic CRUD ----------

export function subscribeToCollection(uid, name, callback, orderField = 'date', direction = 'desc') {
  const q = query(userCollection(uid, name), orderBy(orderField, direction));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items, null);
    },
    (error) => callback([], error)
  );
}

export async function addItem(uid, name, data) {
  return addDoc(userCollection(uid, name), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateItem(uid, name, id, data) {
  return updateDoc(doc(db, 'users', uid, name, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteItem(uid, name, id) {
  return deleteDoc(doc(db, 'users', uid, name, id));
}

// ---------- User profile / settings ----------

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function setUserProfile(uid, data) {
  return setDoc(
    doc(db, 'users', uid),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export function subscribeToUserProfile(uid, callback) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

// ---------- Transactions ----------

export function subscribeToTransactions(uid, callback) {
  return subscribeToCollection(uid, 'transactions', callback, 'date', 'desc');
}

export const addTransaction = (uid, data) => addItem(uid, 'transactions', data);
export const updateTransaction = (uid, id, data) => updateItem(uid, 'transactions', id, data);
export const deleteTransaction = (uid, id) => deleteItem(uid, 'transactions', id);

// ---------- Accounts ----------

export function subscribeToAccounts(uid, callback) {
  return subscribeToCollection(uid, 'accounts', callback, 'createdAt', 'asc');
}

export const addAccount = (uid, data) => addItem(uid, 'accounts', data);
export const updateAccount = (uid, id, data) => updateItem(uid, 'accounts', id, data);
export const deleteAccount = (uid, id) => deleteItem(uid, 'accounts', id);

// ---------- Budgets ----------

export function subscribeToBudgets(uid, callback) {
  return subscribeToCollection(uid, 'budgets', callback, 'createdAt', 'desc');
}

export const addBudget = (uid, data) => addItem(uid, 'budgets', data);
export const updateBudget = (uid, id, data) => updateItem(uid, 'budgets', id, data);
export const deleteBudget = (uid, id) => deleteItem(uid, 'budgets', id);

// ---------- Goals ----------

export function subscribeToGoals(uid, callback) {
  return subscribeToCollection(uid, 'goals', callback, 'createdAt', 'desc');
}

export const addGoal = (uid, data) => addItem(uid, 'goals', data);
export const updateGoal = (uid, id, data) => updateItem(uid, 'goals', id, data);
export const deleteGoal = (uid, id) => deleteItem(uid, 'goals', id);

// ---------- Notifications ----------

export function subscribeToNotifications(uid, callback) {
  return subscribeToCollection(uid, 'notifications', callback, 'createdAt', 'desc');
}

export const addNotification = (uid, data) => addItem(uid, 'notifications', data);
export const markNotificationRead = (uid, id) => updateItem(uid, 'notifications', id, { read: true });
export const deleteNotification = (uid, id) => deleteItem(uid, 'notifications', id);
