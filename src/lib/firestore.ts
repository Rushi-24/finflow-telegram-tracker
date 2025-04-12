
import { db, FirestoreTimestamp } from '@/lib/firebase';
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

// Helper function to convert Firestore Timestamp to JavaScript Date
export const timestampToDate = (timestamp: Timestamp | Date | undefined): Date | undefined => {
  if (!timestamp) return undefined;
  return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
};

// Helper function to convert JavaScript Date to Firestore Timestamp
export const dateToTimestamp = (date: Date | Timestamp | undefined): Timestamp | undefined => {
  if (!date) return undefined;
  return date instanceof Date ? Timestamp.fromDate(date) : date;
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
    const date = timestampToDate(data.date as Timestamp);
    const createdAt = timestampToDate(data.createdAt as Timestamp);
    const updatedAt = timestampToDate(data.updatedAt as Timestamp);
    
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

// New function to parse and process Telegram messages
export const processTelegramMessage = async (userId: string, message: string) => {
  // Expected format: /command param1 param2 param3...
  const parts = message.trim().split(' ');
  const command = parts[0].toLowerCase();
  
  if (command === '/add' || command === '/expense' || command === '/income') {
    const isExpenseCmd = command === '/expense';
    const isIncomeCmd = command === '/income';
    
    let type: 'income' | 'expense';
    let amount: number;
    let category: string;
    let description: string;
    
    if (isExpenseCmd || isIncomeCmd) {
      // Format: /expense 50.00 Food Lunch with friends
      type = isIncomeCmd ? 'income' : 'expense';
      amount = parseFloat(parts[1]);
      category = parts[2];
      description = parts.slice(3).join(' ');
    } else {
      // Format: /add expense 50.00 Food Lunch with friends
      type = parts[1].toLowerCase() as 'income' | 'expense';
      amount = parseFloat(parts[2]);
      category = parts[3];
      description = parts.slice(4).join(' ');
    }
    
    if (isNaN(amount) || amount <= 0) {
      return { success: false, message: 'Invalid amount. Please provide a valid number.' };
    }
    
    if (!category) {
      return { success: false, message: 'Please provide a category.' };
    }
    
    try {
      const transaction = {
        userId,
        type,
        amount,
        category,
        description: description || '',
        date: Timestamp.now()
      };
      
      const transactionId = await addTransaction(transaction);
      return { 
        success: true, 
        message: `${type === 'income' ? 'Income' : 'Expense'} of ${amount} added successfully.`,
        transactionId 
      };
    } catch (error) {
      console.error('Error adding transaction from Telegram:', error);
      return { success: false, message: 'Failed to add transaction. Please try again.' };
    }
  } else if (command === '/balance') {
    try {
      const transactions = await getUserTransactions(userId);
      
      if (transactions.length === 0) {
        return { success: true, message: 'You have no transactions yet.' };
      }
      
      const total = transactions.reduce((acc, t) => {
        return acc + (t.type === 'income' ? t.amount : -t.amount);
      }, 0);
      
      return { 
        success: true, 
        message: `Current balance: ${total.toFixed(2)}` 
      };
    } catch (error) {
      console.error('Error getting balance from Telegram:', error);
      return { success: false, message: 'Failed to get balance. Please try again.' };
    }
  } else if (command === '/recent') {
    try {
      const transactions = await getUserTransactions(userId);
      
      if (transactions.length === 0) {
        return { success: true, message: 'You have no transactions yet.' };
      }
      
      const recent = transactions.slice(0, 5);
      let message = 'Recent transactions:\n\n';
      
      recent.forEach((t, i) => {
        const date = t.date instanceof Date ? t.date.toLocaleDateString() : 'Unknown date';
        message += `${i+1}. ${t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)} (${t.category}) - ${date}\n`;
      });
      
      return { success: true, message };
    } catch (error) {
      console.error('Error getting recent transactions from Telegram:', error);
      return { success: false, message: 'Failed to get recent transactions. Please try again.' };
    }
  } else if (command === '/help') {
    const helpMessage = `
Available commands:

/add [type] [amount] [category] [description]
Example: /add expense 25.50 Food Lunch at restaurant

/expense [amount] [category] [description]
Example: /expense 25.50 Food Lunch at restaurant

/income [amount] [category] [description]
Example: /income 1000 Salary Monthly salary

/balance - Shows your current balance

/recent - Shows your 5 most recent transactions

/help - Shows this help message
`;
    return { success: true, message: helpMessage };
  } else {
    return { 
      success: false, 
      message: `Unrecognized command. Type /help to see available commands.` 
    };
  }
};
