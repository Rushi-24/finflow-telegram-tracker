
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiHome, 
  FiBarChart2, 
  FiDollarSign, 
  FiSettings, 
  FiLogOut,
  FiMessageCircle
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Transactions', path: '/transactions', icon: FiDollarSign },
    { name: 'Analytics', path: '/analytics', icon: FiBarChart2 },
    { name: 'Telegram Bot', path: '/telegram-bot', icon: FiMessageCircle },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  return (
    <div className="h-screen flex flex-col bg-card border-r border-border p-4 w-64">
      <div className="mb-8 mt-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold">FinFlow</h1>
        </Link>
      </div>
      
      <nav className="space-y-1 flex-1">
        {navItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path}
          >
            <Button
              variant={isActive(item.path) ? "default" : "ghost"}
              className={`w-full justify-start ${isActive(item.path) ? '' : 'hover:bg-muted'}`}
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>
      
      <div className="pt-4 border-t border-border mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:bg-muted"
          onClick={() => logout()}
        >
          <FiLogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
