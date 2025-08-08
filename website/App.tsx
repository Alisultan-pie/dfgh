import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Heart, FileCheck, Shield, Settings, LogOut, Wifi, WifiOff, Info, Github, BookOpen, AlertTriangle, CheckCircle, Users, Star, Cloud, Circle, Upload, Download, Search, Plus } from 'lucide-react';

// Mock data for demo
const mockPets: Pet[] = [
  { id: 'PET001', name: 'Max', species: 'Dog', breed: 'Golden Retriever', age: 3, cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', status: 'confirmed' as const },
  { id: 'PET002', name: 'Luna', species: 'Cat', breed: 'Persian', age: 2, cid: 'QmZ9tXpLm3K8vN2qR5sT7uW1xY4aB6cD9eF0gH2iJ3kL4mN', status: 'confirmed' as const },
  { id: 'PET003', name: 'Buddy', species: 'Dog', breed: 'Labrador', age: 5, cid: 'QmX8y7z6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3', status: 'pending' as const }
];

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  cid: string;
  status: 'confirmed' | 'pending';
}

function App() {
  const [user, setUser] = useState({ name: 'Demo User', email: 'demo@petpetclub.com' });
  const [isOnline, setIsOnline] = useState(true);
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    description: ''
  });

  const stats = {
    totalPets: pets.length,
    totalTransactions: pets.length,
    confirmedTransactions: pets.filter(p => p.status === 'confirmed').length,
    pendingTransactions: pets.filter(p => p.status === 'pending').length,
    totalVerifications: pets.length,
    validVerifications: pets.filter(p => p.status === 'confirmed').length,
    successRate: Math.round((pets.filter(p => p.status === 'confirmed').length / pets.length) * 100)
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLogin(false);
    // In real app, this would authenticate with backend
  };

  const handleUploadPet = (e: React.FormEvent) => {
    e.preventDefault();
    const pet: Pet = {
      id: `PET${String(pets.length + 1).padStart(3, '0')}`,
      name: newPet.name,
      species: newPet.species,
      breed: newPet.breed,
      age: parseInt(newPet.age),
      cid: `Qm${Math.random().toString(36).substring(2, 15)}`,
      status: 'confirmed'
    };
    setPets([...pets, pet]);
    setNewPet({ name: '', species: '', breed: '', age: '', description: '' });
    setShowUpload(false);
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-cyan-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to Pet Pet Club</CardTitle>
            <CardDescription>Sign in to access your pet's digital records</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" required />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                  {user.name}
                </div>
              </div>
              
              <Button variant="outline" onClick={() => setShowLogin(true)}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="mt-4 flex gap-2">
            <Button 
              variant={activeTab === 'dashboard' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant={activeTab === 'pets' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('pets')}
            >
              My Pets
            </Button>
            <Button 
              variant={activeTab === 'blockchain' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('blockchain')}
            >
              Blockchain
            </Button>
            <Button 
              variant={activeTab === 'upload' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('upload')}
            >
              Upload Pet
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Beloved Pets</CardTitle>
                  <Circle className="h-4 w-4 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPets}</div>
                  <p className="text-xs text-muted-foreground">in your pet family</p>
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
                  <div className="text-2xl font-bold">{stats.totalPets}</div>
                  <p className="text-xs text-muted-foreground">files on decentralized network</p>
                  {stats.totalPets > 0 && (
                    <Badge variant="outline" className="mt-2 text-xs border-blue-200 text-blue-700">
                      Stored on IPFS
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
                  <div className="text-2xl font-bold">{stats.totalTransactions}</div>
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
                  <div className="text-2xl font-bold">{stats.totalVerifications}</div>
                  <p className="text-xs text-muted-foreground">integrity checks completed</p>
                  {stats.totalVerifications > 0 && (
                    <Badge variant="outline" className="mt-2 text-xs border-purple-200 text-purple-700">
                      {stats.validVerifications} verified successfully
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your pet's digital records</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button onClick={() => setActiveTab('upload')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Pet
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('blockchain')}>
                  <FileCheck className="h-4 w-4 mr-2" />
                  View Blockchain
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('pets')}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Pets
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'pets' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Pets</h2>
              <Button onClick={() => setActiveTab('upload')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Pet
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pets.map((pet) => (
                <Card key={pet.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{pet.name}</CardTitle>
                        <CardDescription>{pet.breed} • {pet.age} years old</CardDescription>
                      </div>
                      <Badge variant={pet.status === 'confirmed' ? 'default' : 'secondary'}>
                        {pet.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><strong>Species:</strong> {pet.species}</div>
                      <div><strong>ID:</strong> {pet.id}</div>
                      <div><strong>IPFS CID:</strong> <code className="text-xs">{pet.cid.substring(0, 20)}...</code></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'blockchain' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Blockchain Transactions</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pets.map((pet) => (
                <Card key={pet.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5" />
                      {pet.name}
                    </CardTitle>
                    <CardDescription>Transaction Details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Pet ID:</strong> {pet.id}</div>
                    <div><strong>Status:</strong> 
                      <Badge variant={pet.status === 'confirmed' ? 'default' : 'secondary'} className="ml-2">
                        {pet.status}
                      </Badge>
                    </div>
                    <div><strong>IPFS CID:</strong> <code className="text-xs">{pet.cid}</code></div>
                    <div><strong>Block:</strong> 4,567,890</div>
                    <div><strong>Gas Used:</strong> 45,678</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Pet
                </CardTitle>
                <CardDescription>Add your pet's information to the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadPet} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Pet Name</Label>
                      <Input 
                        id="name" 
                        value={newPet.name}
                        onChange={(e) => setNewPet({...newPet, name: e.target.value})}
                        placeholder="Enter pet name" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="species">Species</Label>
                      <Input 
                        id="species" 
                        value={newPet.species}
                        onChange={(e) => setNewPet({...newPet, species: e.target.value})}
                        placeholder="Dog, Cat, etc." 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="breed">Breed</Label>
                      <Input 
                        id="breed" 
                        value={newPet.breed}
                        onChange={(e) => setNewPet({...newPet, breed: e.target.value})}
                        placeholder="Enter breed" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input 
                        id="age" 
                        type="number" 
                        value={newPet.age}
                        onChange={(e) => setNewPet({...newPet, age: e.target.value})}
                        placeholder="Age in years" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newPet.description}
                      onChange={(e) => setNewPet({...newPet, description: e.target.value})}
                      placeholder="Tell us about your pet..." 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="photo">Pet Photo</Label>
                    <Input id="photo" type="file" accept="image/*" />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload to Blockchain
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;