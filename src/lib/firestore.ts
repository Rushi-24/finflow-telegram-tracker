
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp,
  DocumentData,
  getDoc
} from 'firebase/firestore';

export type Transaction = {
  id?: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date | Timestamp;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
};

export type Category = {
  id?: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
};

// Transactions
export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const collectionRef = collection(db, 'transactions');
  const now = Timestamp.now();
  const docRef = await addDoc(collectionRef, {
    ...transaction,
    createdAt: now,
    updatedAt: now,
    // Convert JavaScript Date to Firestore Timestamp if needed
    date: transaction.date instanceof Date ? Timestamp.fromDate(transaction.date) : transaction.date
  });
  return docRef.id;
};

export const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
  const docRef = doc(db, 'transactions', id);
  const now = Timestamp.now();
  await updateDoc(docRef, {
    ...transaction,
    updatedAt: now,
    // Convert JavaScript Date to Firestore Timestamp if needed
    date: transaction.date instanceof Date ? Timestamp.fromDate(transaction.date) : transaction.date
  });
};

export const deleteTransaction = async (id: string) => {
  const docRef = doc(db, 'transactions', id);
  await deleteDoc(docRef);
};

export const getUserTransactions = async (userId: string) => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data() as Transaction;
    // Convert Firestore Timestamp to JavaScript Date
    const date = data.date instanceof Timestamp ? data.date.toDate() : data.date;
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;
    const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt;
    
    return {
      id: doc.id,
      ...data,
      date,
      createdAt,
      updatedAt
    };
  });
};

// Categories
export const addCategory = async (category: Omit<Category, 'id'>) => {
  const collectionRef = collection(db, 'categories');
  const docRef = await addDoc(collectionRef, category);
  return docRef.id;
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, category);
};

export const deleteCategory = async (id: string) => {
  const docRef = doc(db, 'categories', id);
  await deleteDoc(docRef);
};

export const getUserCategories = async (userId: string) => {
  const q = query(
    collection(db, 'categories'),
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Category[];
};

// User Profile
export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

export const createUserProfile = async (userId: string, data: any) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { ...data, createdAt: Timestamp.now() });
};

export const updateUserProfile = async (userId: string, data: any) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
};

// Telegram Bot Token
export const saveTelegramToken = async (userId: string, token: string) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { 
    telegramToken: token,
    updatedAt: Timestamp.now()
  });
};

export const getTelegramToken = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.telegramToken;
  } else {
    return null;
  }
};
