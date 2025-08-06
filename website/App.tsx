import { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
// import { PetUpload } from './components/PetUpload';
// import { BlockchainTracker } from './components/BlockchainTracker';
// import { DataVerification } from './components/DataVerification';
// import { AdminPanel } from './components/AdminPanel';
// import { AuthModal } from './components/AuthModal';
// import { WelcomeOnboarding } from './components/WelcomeOnboarding';
// import { AuthProvider, useAuth } from './components/AuthContext';
// import { BlockchainIntegration } from './components/BlockchainIntegration';
import { Heart, FileCheck, Shield, Settings, LogOut, Wifi, WifiOff, Info, Github, BookOpen, AlertTriangle, CheckCircle, Users, Star, Cloud, Circle } from 'lucide-react';
// import { apiClient } from './utils/supabase/client';
// import { toast } from 'sonner';

// Temporary toast function for demo
const toast = {
  info: (message: string, options?: any) => console.log('TOAST INFO:', message, options),
  success: (message: string, options?: any) => console.log('TOAST SUCCESS:', message, options),
  error: (message: string, options?: any) => console.log('TOAST ERROR:', message, options)
};

// Temporary mock data
const mockStats = {
  totalPets: 24,
  totalTransactions: 24,
  confirmedTransactions: 22,
  pendingTransactions: 2,
  totalVerifications: 20,
  validVerifications: 18,
  successRate: 90
};

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
  const [activeTab, setActiveTab] = useState('upload');
  const [isOnline, setIsOnline] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [stats, setStats] = useState<DashboardStats>(mockStats);

  const handleSignOut = async () => {
    console.log('Sign out clicked');
  };

  const handleRefreshWithCallback = () => {
    console.log('Refresh stats');
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  const handleStartUpload = () => {
    setActiveTab('upload');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-cyan-600" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">Pet Pet Club</h1>
                  <p className="text-xs text-muted-foreground">Digital ID System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-orange-500" />
                )}
                <div className="text-sm text-muted-foreground">
                  Demo User
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
              <Circle className="h-4 w-4 text-cyan-500" />
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
              <CardTitle className="text-sm font-medium">Data Verification</CardTitle>
              <Shield className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats.totalVerifications}
              </div>
              <p className="text-xs text-muted-foreground">integrity checks completed</p>
              {stats.totalVerifications > 0 && (
                <Badge variant="outline" className="mt-2 text-xs border-purple-200 text-purple-700">
                  {stats.validVerifications} verified successfully
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
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
            <Card>
              <CardHeader>
                <CardTitle>Pet Upload System</CardTitle>
                <CardDescription>
                  Upload your pet's biometric data with AES-256 encryption and IPFS storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Circle className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Pet Upload Feature</h3>
                  <p className="text-muted-foreground mb-4">
                    This feature allows you to upload pet photos with military-grade encryption
                    and store them on the decentralized IPFS network with blockchain verification.
                  </p>
                  <Button>
                    <Circle className="h-4 w-4 mr-2" />
                    Upload Pet Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blockchain-integration">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Integration</CardTitle>
                <CardDescription>
                  Real-time blockchain transaction monitoring and IPFS integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Blockchain Integration</h3>
                  <p className="text-muted-foreground mb-4">
                    Monitor real-time blockchain transactions on Polygon network
                    and track IPFS storage with decentralized verification.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">24</div>
                      <div className="text-muted-foreground">Total Transactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">22</div>
                      <div className="text-muted-foreground">Confirmed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">2</div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blockchain">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Records</CardTitle>
                <CardDescription>
                  View all blockchain transactions and IPFS storage records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileCheck className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Transaction Records</h3>
                  <p className="text-muted-foreground mb-4">
                    View detailed blockchain transaction history with IPFS CID references
                    and verification status for all uploaded pet data.
                  </p>
                  <div className="space-y-2 text-left">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">PET001</span>
                        <Badge variant="outline" className="text-green-600">Confirmed</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        CID: QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Data Verification</CardTitle>
                <CardDescription>
                  Verify data integrity and hash verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Data Verification</h3>
                  <p className="text-muted-foreground mb-4">
                    Verify the integrity of stored pet data using SHA-256 hashing
                    and blockchain verification to ensure data authenticity.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">20</div>
                      <div className="text-muted-foreground">Total Verifications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">18</div>
                      <div className="text-muted-foreground">Valid</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>
                  System configuration and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Admin Panel</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure system settings, monitor error logs, and manage
                    access controls for the pet biometric storage system.
                  </p>
                  <div className="space-y-2 text-left">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">System Status</span>
                        <Badge variant="outline" className="text-green-600">Online</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        All systems operational - Blockchain and IPFS connected
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function AppContent() {
  return <Dashboard />;
}

export default function App() {
  return (
    <AppContent />
  );
}