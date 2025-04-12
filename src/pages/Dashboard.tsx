
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OverviewCard from '@/components/dashboard/OverviewCard';
import SpendingChart from '@/components/dashboard/SpendingChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SpendingCategoryChart from '@/components/dashboard/SpendingCategoryChart';
import { getUserTransactions, Transaction } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, ArrowUpDown, CreditCard, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        try {
          const data = await getUserTransactions(user.uid);
          setTransactions(data);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTransactions();
  }, [user]);

  // Calculate total income
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate total expenses
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate balance
  const balance = totalIncome - totalExpenses;

  // Calculate savings rate
  const savingsRate = totalIncome > 0 
    ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) 
    : '0';

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your finances.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
              <OverviewCard 
                title="Total Balance" 
                value={`$${balance.toFixed(2)}`}
                icon={<DollarSign />}
              />
              <OverviewCard 
                title="Income" 
                value={`$${totalIncome.toFixed(2)}`}
                change={{ value: '+5.2%', trend: 'up' }}
                icon={<TrendingUp />}
              />
              <OverviewCard 
                title="Expenses" 
                value={`$${totalExpenses.toFixed(2)}`}
                change={{ value: '-3.1%', trend: 'down' }}
                icon={<CreditCard />}
              />
              <OverviewCard 
                title="Savings Rate" 
                value={`${savingsRate}%`}
                icon={<ArrowUpDown />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3 mt-6">
              <SpendingChart />
              {transactions.length > 0 ? (
                <RecentTransactions transactions={transactions.slice(0, 5)} />
              ) : (
                <RecentTransactions transactions={[]} />
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <SpendingCategoryChart />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
