
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/firestore';
import { format } from 'date-fns';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  return (
    <Card className="col-span-3 lg:col-span-1">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
              >
                <div className="flex flex-col">
                  <span className="font-medium truncate max-w-[140px]">
                    {transaction.description}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(
                      transaction.date instanceof Date 
                        ? transaction.date 
                        : new Date(transaction.date), 
                      'MMM dd, yyyy'
                    )}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span 
                    className={
                      transaction.type === 'income' 
                        ? 'text-finance-income font-medium' 
                        : 'text-finance-expense font-medium'
                    }
                  >
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              No recent transactions
            </div>
          )}
          
          {transactions.length > 0 && (
            <div className="text-center mt-4">
              <a href="/transactions" className="text-primary text-sm hover:underline">
                View all transactions
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
