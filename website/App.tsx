import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';

import { 
  Heart, 
  FileCheck, 
  Shield, 
  LogOut, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Star, 
  Cloud, 
  Upload, 
  Download, 
  Search, 
  Plus,
  Database,
  Eye,
  MapPin,
  Activity,
  TrendingUp,
  Zap,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './components/AuthContext';
import { PetUpload } from './components/PetUpload';
import { apiClient } from './utils/supabase/client';
import { isValidCid } from './utils/cid';
import { dedupeByPetId } from './utils/dedupe';
import { USE_MOCK } from './config';

// no mock list; fetch after login

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  cid: string;
  status: 'confirmed' | 'pending';
  description: string;
  location: string;
  microchipId: string;
  lastUpdated: string;
  photoUrl: string;
}

// user type provided by Supabase; we avoid redeclaring to prevent conflicts

function App() {
  const { user, loading, signOut } = useAuth();
  const [isOnline] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      return localStorage.getItem('ppc_active_tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending'>('all');
  // PetUpload handles uploads; remove unused local form state

  // Load pets once authenticated
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await apiClient.getPets();
        const list = response.pets || [];
        const mappedPets = list.map((p: any, idx: number) => ({
          id: p.id || p.pet_id || `PET${String(idx + 1).padStart(3, '0')}`,
          name: p.name || p.pet_id || 'Pet',
          species: p.species || 'Unknown',
          breed: p.breed || 'Unknown',
          age: Number(p.age || 0),
          cid: p.ipfsCid || p.ipfs_cid || '',
          status: (p.status as any) || 'confirmed',
          description: p.description || '',
          location: p.location || '',
          microchipId: p.microchipId || p.microchip_id || '',
          lastUpdated: p.updated_at || p.created_at || new Date().toISOString(),
          photoUrl: p.photoUrl || ''
        }));
        
        // Dedupe by petId/id and add IPFS status
        const merged = dedupeByPetId(mappedPets.filter(Boolean));
        const safe = merged.map((p: any) => ({
          ...p,
          ipfsStatus: isValidCid(p.cid) ? 'secure' : (p.cid ? 'invalid' : 'missing')
        }));
        setPets(safe);
      } catch {
        setPets([]);
      }
    };
    if (user) fetchPets();
  }, [user]);

  // Persist active tab across refreshes
  useEffect(() => {
    try {
      localStorage.setItem('ppc_active_tab', activeTab);
    } catch {}
  }, [activeTab]);

  // Enhanced stats calculation
  const total = pets.length || 0;
  const confirmed = pets.filter(p => (p.status === 'confirmed')).length;
  const pending = pets.filter(p => p.status === 'pending').length;
  const stats = {
    totalPets: total,
    totalTransactions: total,
    confirmedTransactions: confirmed,
    pendingTransactions: pending,
    totalVerifications: total,
    validVerifications: confirmed,
    successRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    totalStorage: total * 2.5, // MB
    averageAge: total > 0 ? Math.round(pets.reduce((sum, pet) => sum + (Number.isFinite(pet.age) ? pet.age : 0), 0) / total) : 0
  };

  // Filter pets based on search and status
  const filteredPets = pets.filter(pet => {
    const name = (pet.name || '').toString();
    const breed = (pet.breed || '').toString();
    const species = (pet.species || '').toString();
    const status = (pet.status || 'confirmed').toString();
    const term = searchTerm.toLowerCase();
    const matchesSearch = name.toLowerCase().includes(term) ||
                         breed.toLowerCase().includes(term) ||
                         species.toLowerCase().includes(term);
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // No inline login; use AuthModal instead

  // no local handleUploadPet; using PetUpload

  const handleDeletePet = async (petId: string) => {
    try {
      await apiClient.deletePet(petId);
      setPets(pets.filter(pet => pet.id !== petId));
      toast.success('Pet removed from records');
    } catch (e: any) {
      toast.error('Failed to delete pet', { description: e?.message });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return null;
  if (!user) return <AuthModal />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    Pet Pet Club
                  </h1>
                  <p className="text-xs text-muted-foreground">Blockchain-Powered Pet Identity</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                  {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm font-medium text-green-700">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(user.user_metadata?.name || user.email || 'U').toString().slice(0,2).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{(user.user_metadata?.name as string) || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={signOut}
                className="hidden md:flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          
          {/* Enhanced Navigation */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            <Button 
              variant={activeTab === 'dashboard' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              className="whitespace-nowrap bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant={activeTab === 'pets' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('pets')}
              className="whitespace-nowrap"
            >
              <Heart className="h-4 w-4 mr-2" />
              My Pets
            </Button>
            <Button 
              variant={activeTab === 'blockchain' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('blockchain')}
              className="whitespace-nowrap"
            >
              <Database className="h-4 w-4 mr-2" />
              Blockchain
            </Button>
            <Button 
              variant={activeTab === 'upload' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('upload')}
              className="whitespace-nowrap"
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Pet
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back, {(user.user_metadata?.name as string) || user.email}! 🐾
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your pets are safely stored on the blockchain with military-grade encryption. 
                Track their digital identities and manage their records securely.
              </p>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-600">{stats.totalPets}</div>
                  <p className="text-xs text-muted-foreground mt-1">in your digital family</p>
                  {stats.totalPets > 0 && (
                    <Badge variant="outline" className="mt-2 text-xs border-cyan-200 text-cyan-700 bg-cyan-50">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Smart care enabled
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">IPFS Storage</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Cloud className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.totalPets}</div>
                  <p className="text-xs text-muted-foreground mt-1">files on decentralized network</p>
                  {stats.totalPets > 0 && (
                    <Badge variant="outline" className="mt-2 text-xs border-blue-200 text-blue-700 bg-blue-50">
                      <Shield className="h-3 w-3 mr-1" />
                      Encrypted & Secure
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blockchain Records</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground mt-1">transactions on Polygon</p>
                  {stats.totalTransactions > 0 && (
                    <Badge variant="outline" className="mt-2 text-xs border-green-200 text-green-700 bg-green-50">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {stats.confirmedTransactions} confirmed
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{stats.successRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">verification success</p>
                  {stats.successRate > 90 && (
                    <Badge variant="outline" className="mt-2 text-xs border-purple-200 text-purple-700 bg-purple-50">
                      <Star className="h-3 w-3 mr-1" />
                      Excellent
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Manage your pet's digital records with ease</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => setActiveTab('upload')}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Pet
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('blockchain')}>
                  <Database className="h-4 w-4 mr-2" />
                  View Blockchain
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('pets')}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Pets
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates on your pet records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pets.slice(0, 3).map((pet) => (
                    <div key={pet.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{pet.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {pet.breed} • Updated {formatDate(pet.lastUpdated)}
                        </p>
                      </div>
                      <Badge variant={pet.status === 'confirmed' ? 'default' : 'secondary'}>
                        {pet.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'pets' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  My Pets
                </h2>
                <p className="text-muted-foreground mt-1">
                  Manage your pets' digital identities and records
                </p>
              </div>
              <Button 
                onClick={() => setActiveTab('upload')}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Pet
              </Button>
            </div>

            {/* Search and Filter */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search Pets</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name, breed, or species..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="md:w-48">
                    <Label htmlFor="status-filter" className="text-sm font-medium mb-2 block">Status</Label>
                    <select
                      id="status-filter"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPets.map((pet) => (
                <Card key={pet.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Heart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{pet.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {pet.location}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant={pet.status === 'confirmed' ? 'default' : 'secondary'}>
                          {pet.status}
                        </Badge>
                        {(pet as any).ipfsStatus === 'secure' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                            🔒 SECURE
                          </Badge>
                        )}
                        {(pet as any).ipfsStatus === 'invalid' && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                            ⚠️ INVALID CID
                          </Badge>
                        )}
                        {(pet as any).ipfsStatus === 'missing' && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 text-xs">
                            📝 NOT UPLOADED
                          </Badge>
                        )}
                        {USE_MOCK && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                            🧪 MOCK DATA
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Species:</span>
                        <p>{pet.species}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Breed:</span>
                        <p>{pet.breed}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Age:</span>
                        <p>{pet.age} years</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">ID:</span>
                        <p className="font-mono text-xs">{pet.id}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-muted-foreground text-sm">Description:</span>
                      <p className="text-sm mt-1">{pet.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Microchip ID:</span>
                        <code className="bg-muted px-2 py-1 rounded">{pet.microchipId}</code>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">IPFS CID:</span>
                        <code className="bg-muted px-2 py-1 rounded">{pet.cid.substring(0, 12)}...</code>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{formatDate(pet.lastUpdated)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePet(pet.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPets.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No pets found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Add your first pet to get started'
                    }
                  </p>
                  {!searchTerm && filterStatus === 'all' && (
                    <Button onClick={() => setActiveTab('upload')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Pet
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'blockchain' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Blockchain Transactions
              </h2>
              <p className="text-muted-foreground mt-1">
                View all blockchain transactions and verify data integrity
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pets.map((pet) => (
                <Card key={pet.id} className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-green-600" />
                      {pet.name}
                    </CardTitle>
                    <CardDescription>Blockchain Transaction Details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Pet ID:</span>
                        <p className="font-mono">{pet.id}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Status:</span>
                        <Badge variant={pet.status === 'confirmed' ? 'default' : 'secondary'} className="mt-1">
                          {pet.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IPFS CID:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">{pet.cid}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Block Number:</span>
                        <span>4,567,890</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gas Used:</span>
                        <span>45,678</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network:</span>
                        <span>Polygon Amoy</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View on Explorer
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Shield className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
                  🔒 SECURE UPLOAD SYSTEM ACTIVE
                </div>
                <p className="text-green-600 text-sm mt-1">
                  AES-256 Encryption • Real IPFS Storage • Blockchain Logging
                </p>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Add New Pet
              </h2>
              <p className="text-muted-foreground mt-2">
                Securely upload your pet's information to the blockchain with military-grade encryption
              </p>
            </div>
            <PetUpload onUploadComplete={async () => {
              try {
                const { pets } = await apiClient.getPets();
                setPets(Array.isArray(pets) ? pets : []);
              } catch (e) {
                setPets([]);
              }
              // Navigate to My Pets after upload
              setActiveTab('pets');
            }} />
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}

export default App;