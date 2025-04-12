
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { getTelegramToken, saveTelegramToken } from '@/lib/firestore';
import { Copy, Check, AlertCircle, Bot, Zap } from 'lucide-react';

const TelegramBot = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [existingToken, setExistingToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const botUsername = "FinFlowBot";
  const userId = user?.uid || '';

  useEffect(() => {
    const fetchToken = async () => {
      if (user) {
        try {
          const token = await getTelegramToken(user.uid);
          if (token) {
            setExistingToken(token);
          }
        } catch (error) {
          console.error('Error fetching token:', error);
          toast({
            title: "Error",
            description: "Failed to retrieve your Telegram token",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchToken();
  }, [user, toast]);

  const handleSaveToken = async () => {
    if (!token.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid token",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save your token",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      await saveTelegramToken(user.uid, token);
      setExistingToken(token);
      setToken('');
      toast({
        title: "Success",
        description: "Your Telegram token has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving token:', error);
      toast({
        title: "Error",
        description: "Failed to save your Telegram token",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const commandExample = `/add expense 25.50 Food Lunch at restaurant`;

  const handleConnectBot = () => {
    window.open(`https://t.me/${botUsername}`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Telegram Bot</h1>
          <p className="text-muted-foreground">
            Connect and manage your FinFlow Telegram bot
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-6 w-6" />
                  Telegram Bot Setup
                </CardTitle>
                <CardDescription>
                  Connect your Telegram account to easily add transactions on the go
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    How it works
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Connect to our Telegram bot {@botUsername}</li>
                    <li>Use simple commands to add transactions</li>
                    <li>Your data syncs automatically with your FinFlow account</li>
                  </ol>
                </div>
                
                {existingToken ? (
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Bot Connected</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Your Telegram bot is successfully connected and ready to use
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Not Connected</AlertTitle>
                    <AlertDescription>
                      You haven't connected your Telegram bot yet
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your User ID</label>
                  <div className="flex">
                    <Input value={userId} readOnly className="rounded-r-none font-mono" />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-l-none"
                      onClick={() => copyToClipboard(userId)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You'll need this ID when connecting to the Telegram bot
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telegram Bot Token</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter your Telegram token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                    />
                    <Button onClick={handleSaveToken} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You'll receive this token when you connect to the bot
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div className="w-full">
                  <Button 
                    onClick={handleConnectBot} 
                    className="w-full"
                    variant={existingToken ? "outline" : "default"}
                  >
                    {existingToken ? "Reconnect to Telegram Bot" : "Connect to Telegram Bot"}
                  </Button>
                </div>
                
                <div className="space-y-2 w-full">
                  <h3 className="font-medium">Example Commands</h3>
                  <div className="bg-muted rounded-lg p-3 font-mono text-sm overflow-x-auto">
                    <p className="flex items-center gap-2">
                      <span>{commandExample}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(commandExample)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Type <code>/help</code> in the Telegram chat to see all available commands
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Command Reference</CardTitle>
                <CardDescription>
                  Quick reference for Telegram bot commands
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Add Transactions</h3>
                    <div className="grid gap-2">
                      <div className="bg-muted rounded-lg p-3">
                        <code className="text-sm">/add [type] [amount] [category] [description]</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: /add expense 12.50 Food Lunch with colleagues
                        </p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <code className="text-sm">/income [amount] [category] [description]</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: /income 1000 Salary March salary
                        </p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <code className="text-sm">/expense [amount] [category] [description]</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: /expense 50 Transport Gas for the week
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Get Information</h3>
                    <div className="grid gap-2">
                      <div className="bg-muted rounded-lg p-3">
                        <code className="text-sm">/balance</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Shows your current balance
                        </p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <code className="text-sm">/recent</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Shows your 5 most recent transactions
                        </p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <code className="text-sm">/help</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Shows all available commands
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TelegramBot;
