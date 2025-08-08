import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';

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
  Camera,
  MapPin,
  Activity,
  TrendingUp,
  Zap,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

// Enhanced mock data
const mockPets: Pet[] = [
  { 
    id: 'PET001', 
    name: 'Max', 
    species: 'Dog', 
    breed: 'Golden Retriever', 
    age: 3, 
    cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', 
    status: 'confirmed' as const,
    description: 'Friendly and energetic Golden Retriever who loves playing fetch and swimming.',
    location: 'New York, NY',
    microchipId: '985141123456789',
    lastUpdated: '2024-01-15T10:30:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop'
  },
  { 
    id: 'PET002', 
    name: 'Luna', 
    species: 'Cat', 
    breed: 'Persian', 
    age: 2, 
    cid: 'QmZ9tXpLm3K8vN2qR5sT7uW1xY4aB6cD9eF0gH2iJ3kL4mN', 
    status: 'confirmed' as const,
    description: 'Elegant Persian cat with a calm temperament and beautiful long fur.',
    location: 'Los Angeles, CA',
    microchipId: '985141987654321',
    lastUpdated: '2024-01-14T15:45:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop'
  },
  { 
    id: 'PET003', 
    name: 'Buddy', 
    species: 'Dog', 
    breed: 'Labrador', 
    age: 5, 
    cid: 'QmX8y7z6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3', 
    status: 'pending' as const,
    description: 'Loyal Labrador who is great with kids and loves outdoor activities.',
    location: 'Chicago, IL',
    microchipId: '985141456789123',
    lastUpdated: '2024-01-13T09:20:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&h=400&fit=crop'
  }
];

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

interface User {
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin';
  joinDate: string;
}

function App() {
  const [user] = useState<User>({ 
    name: 'Demo User', 
    email: 'demo@petpetclub.com',
    role: 'owner',
    joinDate: '2024-01-01'
  });
  const [isOnline] = useState(true);
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [_showUpload, setShowUpload] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [newPet, setNewPet] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    description: '',
    location: '',
    microchipId: ''
  });

  // Enhanced stats calculation
  const stats = {
    totalPets: pets.length,
    totalTransactions: pets.length,
    confirmedTransactions: pets.filter(p => p.status === 'confirmed').length,
    pendingTransactions: pets.filter(p => p.status === 'pending').length,
    totalVerifications: pets.length,
    validVerifications: pets.filter(p => p.status === 'confirmed').length,
    successRate: Math.round((pets.filter(p => p.status === 'confirmed').length / pets.length) * 100),
    totalStorage: pets.length * 2.5, // MB
    averageAge: Math.round(pets.reduce((sum, pet) => sum + pet.age, 0) / pets.length)
  };

  // Filter pets based on search and status
  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.species.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || pet.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLogin(false);
    toast.success('Welcome back! 🐾');
  };

  const handleUploadPet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPet.name || !newPet.species || !newPet.breed || !newPet.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Simulate upload process
    toast.loading('Uploading pet data to blockchain...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pet: Pet = {
      id: `PET${String(pets.length + 1).padStart(3, '0')}`,
      name: newPet.name,
      species: newPet.species,
      breed: newPet.breed,
      age: parseInt(newPet.age),
      cid: `Qm${Math.random().toString(36).substring(2, 15)}`,
      status: 'confirmed',
      description: newPet.description || 'No description provided',
      location: newPet.location || 'Location not specified',
      microchipId: newPet.microchipId || `MC${Math.random().toString(36).substring(2, 10)}`,
      lastUpdated: new Date().toISOString(),
      photoUrl: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&h=400&fit=crop'
    };
    
    setPets([...pets, pet]);
    setNewPet({ name: '', species: '', breed: '', age: '', description: '', location: '', microchipId: '' });
    setShowUpload(false);
    toast.success(`${pet.name} has been successfully added to the blockchain! 🎉`);
  };

  const handleDeletePet = (petId: string) => {
    setPets(pets.filter(pet => pet.id !== petId));
    toast.success('Pet removed from records');
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

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Pet Pet Club
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Secure Digital Pet Identity System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  className="h-12 text-base"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  className="h-12 text-base"
                  required 
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                Sign In to Pet Pet Club
              </Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
              <p>Don't have an account? <a href="#" className="text-cyan-600 hover:underline">Sign up</a></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowLogin(true)}
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
                Welcome back, {user.name}! 🐾
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
                      <Badge variant={pet.status === 'confirmed' ? 'default' : 'secondary'}>
                        {pet.status}
                      </Badge>
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
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Add New Pet
              </h2>
              <p className="text-muted-foreground mt-2">
                Securely upload your pet's information to the blockchain with military-grade encryption
              </p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-cyan-600" />
                  Pet Information
                </CardTitle>
                <CardDescription>
                  Fill in your pet's details. All data will be encrypted and stored securely on the blockchain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadPet} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Pet Name *</Label>
                      <Input 
                        id="name" 
                        value={newPet.name}
                        onChange={(e) => setNewPet({...newPet, name: e.target.value})}
                        placeholder="Enter pet name" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="species">Species *</Label>
                      <Input 
                        id="species" 
                        value={newPet.species}
                        onChange={(e) => setNewPet({...newPet, species: e.target.value})}
                        placeholder="Dog, Cat, Bird, etc." 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="breed">Breed *</Label>
                      <Input 
                        id="breed" 
                        value={newPet.breed}
                        onChange={(e) => setNewPet({...newPet, breed: e.target.value})}
                        placeholder="Enter breed" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age (years) *</Label>
                      <Input 
                        id="age" 
                        type="number" 
                        value={newPet.age}
                        onChange={(e) => setNewPet({...newPet, age: e.target.value})}
                        placeholder="Age in years" 
                        min="0"
                        max="30"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={newPet.location}
                        onChange={(e) => setNewPet({...newPet, location: e.target.value})}
                        placeholder="City, State" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="microchipId">Microchip ID</Label>
                      <Input 
                        id="microchipId" 
                        value={newPet.microchipId}
                        onChange={(e) => setNewPet({...newPet, microchipId: e.target.value})}
                        placeholder="Microchip identification number" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newPet.description}
                      onChange={(e) => setNewPet({...newPet, description: e.target.value})}
                      placeholder="Tell us about your pet's personality, health conditions, or special needs..." 
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="photo">Pet Photo</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 10MB
                      </p>
                      <Input 
                        id="photo" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                      />
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security Notice:</strong> All data will be encrypted with AES-256 encryption 
                      before being stored on IPFS and logged on the Polygon blockchain. Your pet's information 
                      is protected with military-grade security.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload to Blockchain
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab('dashboard')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}

export default App;