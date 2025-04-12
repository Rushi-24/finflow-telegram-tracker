
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTransactions, Transaction } from '@/lib/firestore';
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F', '#EC7063'
];

const Analytics = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

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

  // Filter transactions based on selected time range
  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1month':
        startDate = subMonths(now, 1);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case '6months':
        startDate = subMonths(now, 6);
        break;
      case '12months':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 6);
    }
    
    return transactions.filter(t => {
      const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
      return transactionDate >= startDate && transactionDate <= now;
    });
  };

  // Prepare monthly income/expense data
  const getMonthlyData = () => {
    const filteredTransactions = getFilteredTransactions();
    const months = new Map();
    
    filteredTransactions.forEach(t => {
      const date = t.date instanceof Date ? t.date : new Date(t.date);
      const monthKey = format(date, 'MMM yy');
      
      if (!months.has(monthKey)) {
        months.set(monthKey, { name: monthKey, income: 0, expenses: 0 });
      }
      
      const monthData = months.get(monthKey);
      if (t.type === 'income') {
        monthData.income += t.amount;
      } else {
        monthData.expenses += Math.abs(t.amount);
      }
    });
    
    return Array.from(months.values()).sort((a, b) => {
      // Convert 'MMM yy' back to Date for sorting
      const dateA = new Date(a.name.replace('MMM', `${a.name.slice(0, 3)} 01,`).replace('yy', `20${a.name.slice(-2)}`));
      const dateB = new Date(b.name.replace('MMM', `${b.name.slice(0, 3)} 01,`).replace('yy', `20${b.name.slice(-2)}`));
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Prepare category data for pie chart
  const getCategoryData = () => {
    const filteredTransactions = getFilteredTransactions();
    const expenseCategories = new Map();
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!expenseCategories.has(t.category)) {
          expenseCategories.set(t.category, { name: t.category, value: 0 });
        }
        
        const categoryData = expenseCategories.get(t.category);
        categoryData.value += Math.abs(t.amount);
      });
    
    return Array.from(expenseCategories.values());
  };

  // Calculate savings trend
  const getSavingsTrend = () => {
    const filteredTransactions = getFilteredTransactions();
    const months = new Map();
    
    // Initialize all months in the range
    const now = new Date();
    let date = subMonths(now, parseInt(timeRange.replace('months', '')));
    
    while (date <= now) {
      const monthKey = format(date, 'MMM yy');
      months.set(monthKey, { 
        name: monthKey, 
        income: 0, 
        expenses: 0, 
        savings: 0,
        savingsRate: 0
      });
      date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    }
    
    // Fill with transaction data
    filteredTransactions.forEach(t => {
      const date = t.date instanceof Date ? t.date : new Date(t.date);
      const monthKey = format(date, 'MMM yy');
      
      if (months.has(monthKey)) {
        const monthData = months.get(monthKey);
        if (t.type === 'income') {
          monthData.income += t.amount;
        } else {
          monthData.expenses += Math.abs(t.amount);
        }
        
        monthData.savings = monthData.income - monthData.expenses;
        monthData.savingsRate = monthData.income > 0 
          ? (monthData.savings / monthData.income) * 100 
          : 0;
      }
    });
    
    return Array.from(months.values()).sort((a, b) => {
      // Convert 'MMM yy' back to Date for sorting
      const dateA = new Date(a.name.replace('MMM', `${a.name.slice(0, 3)} 01,`).replace('yy', `20${a.name.slice(-2)}`));
      const dateB = new Date(b.name.replace('MMM', `${b.name.slice(0, 3)} 01,`).replace('yy', `20${b.name.slice(-2)}`));
      return dateA.getTime() - dateB.getTime();
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Analyze your financial activity and trends</p>
          </div>
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="income-expense">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
              <TabsTrigger value="income-expense">Income & Expenses</TabsTrigger>
              <TabsTrigger value="categories">Spending Categories</TabsTrigger>
              <TabsTrigger value="savings">Savings Trend</TabsTrigger>
            </TabsList>
            
            <TabsContent value="income-expense">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Income vs Expenses</CardTitle>
                  <CardDescription>
                    Comparison of your monthly income and expenses over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getMonthlyData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [`$${value.toFixed(2)}`, '']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="income" 
                        name="Income" 
                        fill="#00E396" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        dataKey="expenses" 
                        name="Expenses" 
                        fill="#FF4757" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>
                    Breakdown of your spending across different categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="savings">
              <Card>
                <CardHeader>
                  <CardTitle>Savings Trend</CardTitle>
                  <CardDescription>
                    Your savings and savings rate over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getSavingsTrend()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        stroke="#0069FF"
                        label={{ value: 'Savings ($)', position: 'insideLeft', angle: -90 }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#00D68F"
                        label={{ value: 'Savings Rate (%)', position: 'insideRight', angle: 90 }}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          if (name === 'savings') return [`$${value.toFixed(2)}`, 'Savings'];
                          if (name === 'savingsRate') return [`${value.toFixed(1)}%`, 'Savings Rate'];
                          return [value, name];
                        }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="savings" 
                        name="Savings" 
                        stroke="#0069FF" 
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="savingsRate" 
                        name="Savings Rate" 
                        stroke="#00D68F"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
