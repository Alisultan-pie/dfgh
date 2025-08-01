import { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { PetUpload } from './components/PetUpload';
import { BlockchainTracker } from './components/BlockchainTracker';
import { DataVerification } from './components/DataVerification';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { WelcomeOnboarding } from './components/WelcomeOnboarding';
import { AuthProvider, useAuth } from './components/AuthContext';
import { BlockchainIntegration } from './components/BlockchainIntegration';
import { Heart, FileCheck, Shield, Settings, PawPrint, LogOut, Wifi, WifiOff, Info, Github, BookOpen, AlertTriangle, CheckCircle, Users, Star, Cloud } from 'lucide-react';
import { apiClient } from './utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface DashboardStats {
  totalPets: number;
  totalTransactions: number;
  confirmedTransactions: number;
  pendingTransactions: number;
  totalVerifications: number;
  validVerifications: number;
  successRate: number;
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [isOnline, setIsOnline] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPets: 0,
    totalTransactions: 0,
    confirmedTransactions: 0,
    pendingTransactions: 0,
    totalVerifications: 0,
    validVerifications: 0,
    successRate: 0
  });

  // Use refs to track previous connectivity state to avoid stale closures
  const prevIsOnlineRef = useRef(true);
  const hasShownOfflineToastRef = useRef(false);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingStats(true);
    try {
      // This will never throw an error now - it always returns valid stats
      const { stats: fetchedStats } = await apiClient.getStats();
      setStats(fetchedStats);
      
      // Show onboarding for new users (no pets uploaded yet)
      if (fetchedStats.totalPets === 0) {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      // This should rarely happen now, but just in case
      console.error('Unexpected stats error:', error);
      
      // Show onboarding for new users even if stats fail
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    } finally {
      setIsLoadingStats(false);
    }
  }, [user]);

  const checkConnectivity = useCallback(async () => {
    try {
      const online = await apiClient.isOnline();
      const prevIsOnline = prevIsOnlineRef.current;
      
      setIsOnline(online);
      setIsOfflineMode(!online);
      prevIsOnlineRef.current = online;
      
      // Show notifications for connectivity changes
      if (!online && prevIsOnline && !hasShownOfflineToastRef.current) {
        // Going offline
        toast.info('Working offline', {
          description: 'Pet data will be uploaded to IPFS & blockchain when reconnected'
        });
        hasShownOfflineToastRef.current = true;
      } else if (online && !prevIsOnline) {
        // Coming back online
        toast.success('Back online', {
          description: 'Now syncing with IPFS and blockchain network'
        });
        hasShownOfflineToastRef.current = false; // Reset so we can show offline toast again
      }
    } catch (error) {
      console.log('Connectivity check failed');
      setIsOnline(false);
      setIsOfflineMode(true);
      prevIsOnlineRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // Initial data fetch and connectivity check
    fetchStats();
    checkConnectivity();
    
    // Set up periodic checks - less frequent to avoid spam
    const interval = setInterval(() => {
      checkConnectivity();
      // Only fetch stats if we're online to avoid unnecessary processing
      if (isOnline) {
        fetchStats();
      }
    }, 60000); // Check every 60 seconds instead of 30
    
    return () => clearInterval(interval);
  }, [user, fetchStats, checkConnectivity, isOnline]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('See you next time! 👋');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  const refreshStats = async () => {
    setIsLoadingStats(true);
    try {
      // Always fetch stats first
      const { stats: fetchedStats } = await apiClient.getStats();
      setStats(fetchedStats);
      
      // Then check connectivity
      await checkConnectivity();
      
      if (isOnline) {
        toast.success('Connected successfully');
      } else {
        toast.info('Still offline', {
          description: 'Using local cache - will sync with IPFS when online'
        });
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
      setIsOnline(false);
      setIsOfflineMode(true);
      prevIsOnlineRef.current = false;
      toast.error('Connection failed', {
        description: 'Continuing in offline mode'
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleStartUpload = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
    setActiveTab('upload');
  };

  const handleRefreshWithCallback = useCallback(() => {
    refreshStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-medium text-cyan-500">Pet Pet Club</h1>
                  <p className="text-sm text-muted-foreground">Digital Pet ID & Community</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-cyan-200 text-cyan-700">
                  <Users className="h-3 w-3 mr-1" />
                  Smart Care
                </Badge>
                <Badge variant="outline" className="text-xs border-cyan-200 text-cyan-700">
                  <Shield className="h-3 w-3 mr-1" />
                  Blockchain Secured
                </Badge>
                <Badge variant="outline" className="text-xs border-cyan-200 text-cyan-700">
                  <Cloud className="h-3 w-3 mr-1" />
                  IPFS Storage
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowOnboarding(true)}>
                  <Info className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://petpetclub.com.hk/" target="_blank" rel="noopener noreferrer">
                    <Heart className="h-4 w-4 mr-2" />
                    Visit Pet Pet Club
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://github.com/Alisultan-pie/PPC_Blockchain.git" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    Tech Details
                  </a>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" title="Online - Connected to IPFS & Blockchain" />
                ) : (
                  <WifiOff className="h-4 w-4 text-orange-500" title="Offline - Will sync to IPFS when connected" />
                )}
                <div className="text-sm text-muted-foreground">
                  {user?.user_metadata?.name || user?.email}
                </div>
              </div>
              
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>Pet Pet Club Digital ID System</span>
                <span>•</span>
                <span>Care made smart. Love made strong.</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
                  {isOnline ? 'IPFS & Blockchain Connected' : 'Local Cache Mode'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>{stats.totalPets} Beloved Pet{stats.totalPets !== 1 ? 's' : ''}</span>
                <span>{stats.totalTransactions} Blockchain Records</span>
                <span>{stats.successRate}% Happy Members</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Beloved Pets</CardTitle>
              <PawPrint className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats.totalPets}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPets === 0 ? 'Add your first family member!' : 'in your pet family'}
              </p>
              {stats.totalPets > 0 && (
                <Badge variant="outline" className="mt-2 text-xs border-cyan-200 text-cyan-700">
                  Smart care enabled 💙
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">IPFS Storage</CardTitle>
              <Cloud className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats.totalPets}
              </div>
              <p className="text-xs text-muted-foreground">files on decentralized network</p>
              {stats.totalPets > 0 && (
                <Badge variant="outline" className="mt-2 text-xs border-blue-200 text-blue-700">
                  {isOfflineMode ? 'Pending IPFS upload' : 'Stored on IPFS'}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blockchain Records</CardTitle>
              <FileCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats.totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground">transactions on Polygon</p>
              {stats.totalTransactions > 0 && (
                <Badge variant="outline" className="mt-2 text-xs border-green-200 text-green-700">
                  {stats.confirmedTransactions} confirmed on chain
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Care Quality</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : `${stats.successRate}%`}
              </div>
              <p className="text-xs text-muted-foreground">smart care score</p>
              {stats.totalVerifications > 0 && (
                <Badge variant="outline" className="mt-2 text-xs border-yellow-200 text-yellow-700">
                  {stats.validVerifications} perfect verifications
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Offline Mode Notice */}
        {isOfflineMode && !isLoadingStats && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                      Working Offline - Using Local Cache
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Your pet's information is temporarily stored locally with AES-256 encryption. 
                      When you reconnect to the internet, everything will be automatically uploaded to 
                      IPFS (decentralized storage) and logged on the Polygon blockchain for permanent, 
                      tamper-proof protection. All features continue to work perfectly!
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        onClick={refreshStats}
                        variant="outline"
                        disabled={isLoadingStats}
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        <Wifi className="h-4 w-4 mr-2" />
                        {isLoadingStats ? 'Checking...' : 'Reconnect to IPFS'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('upload')}
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        <PawPrint className="h-4 w-4 mr-2" />
                        Continue Adding Pets
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New User Welcome Message */}
        {stats.totalPets === 0 && !showOnboarding && !isLoadingStats && (
          <div className="mb-6">
            <Card className="border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-cyan-600 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-cyan-800 dark:text-cyan-200">
                      Welcome to Pet Pet Club! 🐾
                    </h3>
                    <p className="text-sm text-cyan-700 dark:text-cyan-300">
                      Care made smart. Love made strong. Join our community where we use advanced blockchain 
                      technology and IPFS decentralized storage to keep your pet's information secure forever. 
                      Create encrypted digital memories with military-grade AES-256 security and permanent 
                      blockchain records on the Polygon network.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        onClick={() => setActiveTab('upload')}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        <PawPrint className="h-4 w-4 mr-2" />
                        Add My First Pet
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowOnboarding(true)}
                        className="border-cyan-300 text-cyan-700 hover:bg-cyan-100"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Learn About Blockchain Storage
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <PawPrint className="h-4 w-4" />
              Add Pet
            </TabsTrigger>
            <TabsTrigger value="blockchain-integration" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Blockchain
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Records
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Verify Pet
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              My Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <PetUpload onUploadComplete={handleRefreshWithCallback} />
          </TabsContent>

          <TabsContent value="blockchain-integration">
            <BlockchainIntegration onUploadComplete={handleRefreshWithCallback} />
          </TabsContent>

          <TabsContent value="blockchain">
            <BlockchainTracker />
          </TabsContent>

          <TabsContent value="verification">
            <DataVerification />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </main>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <WelcomeOnboarding 
          onClose={handleCloseOnboarding}
          onStartUpload={handleStartUpload}
        />
      )}
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="h-12 w-12 text-cyan-500 mx-auto mb-4 animate-pulse" />
          <div className="space-y-2">
            <p className="text-muted-foreground">Loading Pet Pet Club...</p>
            <p className="text-xs text-muted-foreground">Care made smart. Love made strong. 💙</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}