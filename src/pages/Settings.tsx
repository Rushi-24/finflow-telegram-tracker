
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserProfile, 
  updateUserProfile, 
  createUserProfile 
} from '@/lib/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const Settings = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    notificationSettings: {
      emailNotifications: true,
      telegramNotifications: true
    },
    currency: 'USD'
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          
          if (userProfile) {
            setProfile({
              ...profile,
              ...userProfile,
              displayName: userProfile.displayName || user.displayName || '',
              email: user.email || '',
            });
          } else {
            // If no profile exists, create one with defaults
            await createUserProfile(user.uid, {
              displayName: user.displayName || '',
              notificationSettings: {
                emailNotifications: true,
                telegramNotifications: true
              },
              currency: 'USD'
            });
            
            setProfile({
              ...profile,
              displayName: user.displayName || '',
              email: user.email || '',
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          toast({
            title: "Error",
            description: "Failed to fetch user profile",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      await updateUserProfile(user.uid, {
        displayName: profile.displayName,
        notificationSettings: profile.notificationSettings,
        currency: profile.currency
      });
      
      toast({
        title: "Profile updated",
        description: "Your settings have been saved successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirecting is handled by AuthContext
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    // In a real application, we would delete the user data and account here
    toast({
      title: "Account deletion requested",
      description: "This feature is not implemented in the demo",
    });
    setShowDeleteConfirm(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
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
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName" 
                    value={profile.displayName} 
                    onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile.email} 
                    disabled 
                  />
                  <p className="text-sm text-muted-foreground">
                    Your email address cannot be changed
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleProfileUpdate} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your FinFlow experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['USD', 'EUR', 'GBP'].map((currency) => (
                      <Button
                        key={currency}
                        type="button"
                        variant={profile.currency === currency ? "default" : "outline"}
                        onClick={() => setProfile({...profile, currency})}
                      >
                        {currency}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important updates
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={profile.notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setProfile({
                        ...profile, 
                        notificationSettings: {
                          ...profile.notificationSettings,
                          emailNotifications: checked
                        }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="telegramNotifications">Telegram Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via Telegram
                      </p>
                    </div>
                    <Switch
                      id="telegramNotifications"
                      checked={profile.notificationSettings.telegramNotifications}
                      onCheckedChange={(checked) => setProfile({
                        ...profile, 
                        notificationSettings: {
                          ...profile.notificationSettings,
                          telegramNotifications: checked
                        }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleProfileUpdate} disabled={saving}>
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Actions that can't be undone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Log out of your account on this device
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Account
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all your data
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Settings;
