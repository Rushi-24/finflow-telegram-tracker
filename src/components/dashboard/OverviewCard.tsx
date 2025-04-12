
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface OverviewCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactNode;
}

const OverviewCard = ({ title, value, change, icon }: OverviewCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-5 w-5 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs flex items-center mt-1">
            {change.trend === 'up' ? (
              <ArrowUpIcon className="h-3 w-3 text-finance-income mr-1" />
            ) : change.trend === 'down' ? (
              <ArrowDownIcon className="h-3 w-3 text-finance-expense mr-1" />
            ) : null}
            <span className={
              change.trend === 'up' 
                ? 'text-finance-income' 
                : change.trend === 'down' 
                  ? 'text-finance-expense' 
                  : 'text-muted-foreground'
            }>
              {change.value}
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
