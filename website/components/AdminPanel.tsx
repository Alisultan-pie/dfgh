import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Key, 
  Database, 
  Network, 
  Users, 
  FileWarning,
  RefreshCw,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SystemConfig {
  encryptionAlgorithm: string;
  keyLength: number;
  ipfsGateway: string;
  blockchainNetwork: string;
  contractAddress: string;
  gasLimit: string;
  backupEnabled: boolean;
  autoVerification: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  component: string;
  message: string;
  details?: string;
  resolved: boolean;
}

interface AccessControl {
  id: string;
  walletAddress: string;
  role: 'admin' | 'operator' | 'viewer';
  permissions: string[];
  lastAccess: string;
  active: boolean;
}

export function AdminPanel() {
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    encryptionAlgorithm: 'AES-256-CBC',
    keyLength: 256,
    ipfsGateway: 'https://gateway.web3.storage',
    blockchainNetwork: 'Polygon Amoy',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    gasLimit: '500000',
    backupEnabled: true,
    autoVerification: true,
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg']
  });

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [accessControls, setAccessControls] = useState<AccessControl[]>([]);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletRole, setNewWalletRole] = useState<'admin' | 'operator' | 'viewer'>('viewer');

  // Mock data initialization
  useEffect(() => {
    const mockErrorLogs: ErrorLog[] = [
      {
        id: '1',
        timestamp: '2025-01-30T10:30:00Z',
        level: 'error',
        component: 'Encryption',
        message: 'Invalid encryption key length detected',
        details: 'Key length must be exactly 32 bytes for AES-256',
        resolved: true
      },
      {
        id: '2',
        timestamp: '2025-01-30T09:15:00Z',
        level: 'warning',
        component: 'IPFS',
        message: 'Slow upload detected',
        details: 'Upload took 15.2 seconds, above threshold of 10 seconds',
        resolved: false
      },
      {
        id: '3',
        timestamp: '2025-01-30T08:45:00Z',
        level: 'error',
        component: 'Blockchain',
        message: 'Transaction failed due to insufficient gas',
        details: 'Gas limit: 300000, Required: 425000',
        resolved: true
      },
      {
        id: '4',
        timestamp: '2025-01-30T07:20:00Z',
        level: 'info',
        component: 'Verification',
        message: 'Batch verification completed',
        details: '24 files verified, 1 failed',
        resolved: true
      }
    ];

    const mockAccessControls: AccessControl[] = [
      {
        id: '1',
        walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin'],
        lastAccess: '2025-01-30T10:30:00Z',
        active: true
      },
      {
        id: '2',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        role: 'operator',
        permissions: ['read', 'write'],
        lastAccess: '2025-01-30T09:45:00Z',
        active: true
      },
      {
        id: '3',
        walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
        role: 'viewer',
        permissions: ['read'],
        lastAccess: '2025-01-29T16:20:00Z',
        active: false
      }
    ];

    setErrorLogs(mockErrorLogs);
    setAccessControls(mockAccessControls);
  }, []);

  const handleConfigUpdate = (key: keyof SystemConfig, value: any) => {
    setSystemConfig(prev => ({ ...prev, [key]: value }));
    toast.success('Configuration updated');
  };

  const handleSaveConfig = () => {
    // In a real app, this would save to backend
    toast.success('System configuration saved successfully');
  };

  const handleResolveError = (errorId: string) => {
    setErrorLogs(prev => prev.map(log => 
      log.id === errorId ? { ...log, resolved: true } : log
    ));
    toast.success('Error marked as resolved');
  };

  const handleClearErrorLogs = () => {
    setErrorLogs(prev => prev.filter(log => !log.resolved));
    toast.success('Resolved error logs cleared');
  };

  const handleAddWalletAccess = () => {
    if (!newWalletAddress.trim()) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    if (!newWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Invalid Ethereum wallet address format');
      return;
    }

    const permissions = newWalletRole === 'admin' 
      ? ['read', 'write', 'delete', 'admin']
      : newWalletRole === 'operator'
      ? ['read', 'write']
      : ['read'];

    const newAccess: AccessControl = {
      id: Date.now().toString(),
      walletAddress: newWalletAddress,
      role: newWalletRole,
      permissions,
      lastAccess: new Date().toISOString(),
      active: true
    };

    setAccessControls(prev => [newAccess, ...prev]);
    setNewWalletAddress('');
    setNewWalletRole('viewer');
    toast.success('Wallet access granted successfully');
  };

  const handleToggleWalletAccess = (walletId: string) => {
    setAccessControls(prev => prev.map(access => 
      access.id === walletId ? { ...access, active: !access.active } : access
    ));
    toast.success('Wallet access status updated');
  };

  const handleRemoveWalletAccess = (walletId: string) => {
    setAccessControls(prev => prev.filter(access => access.id !== walletId));
    toast.success('Wallet access removed');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getErrorIcon = (level: ErrorLog['level']) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRoleIcon = (role: AccessControl['role']) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'operator':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'viewer':
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errorLogs.filter(log => !log.resolved).length}
            </div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accessControls.filter(ac => ac.active).length}
            </div>
            <p className="text-xs text-muted-foreground">With system access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">System Configuration</TabsTrigger>
          <TabsTrigger value="errors">Error Handling</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Configure encryption, IPFS, blockchain, and validation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="encAlgo">Encryption Algorithm</Label>
                  <Select 
                    value={systemConfig.encryptionAlgorithm}
                    onValueChange={(value) => handleConfigUpdate('encryptionAlgorithm', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AES-256-CBC">AES-256-CBC</SelectItem>
                      <SelectItem value="AES-256-GCM">AES-256-GCM</SelectItem>
                      <SelectItem value="ChaCha20-Poly1305">ChaCha20-Poly1305</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyLength">Key Length (bits)</Label>
                  <Input
                    id="keyLength"
                    type="number"
                    value={systemConfig.keyLength}
                    onChange={(e) => handleConfigUpdate('keyLength', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipfsGateway">IPFS Gateway</Label>
                  <Input
                    id="ipfsGateway"
                    value={systemConfig.ipfsGateway}
                    onChange={(e) => handleConfigUpdate('ipfsGateway', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="network">Blockchain Network</Label>
                  <Select 
                    value={systemConfig.blockchainNetwork}
                    onValueChange={(value) => handleConfigUpdate('blockchainNetwork', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Polygon Amoy">Polygon Amoy (Testnet)</SelectItem>
                      <SelectItem value="Polygon Mainnet">Polygon Mainnet</SelectItem>
                      <SelectItem value="Ethereum Sepolia">Ethereum Sepolia</SelectItem>
                      <SelectItem value="Ethereum Mainnet">Ethereum Mainnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractAddr">Contract Address</Label>
                  <Input
                    id="contractAddr"
                    value={systemConfig.contractAddress}
                    onChange={(e) => handleConfigUpdate('contractAddress', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gasLimit">Gas Limit</Label>
                  <Input
                    id="gasLimit"
                    value={systemConfig.gasLimit}
                    onChange={(e) => handleConfigUpdate('gasLimit', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={systemConfig.maxFileSize / 1024 / 1024}
                    onChange={(e) => handleConfigUpdate('maxFileSize', parseInt(e.target.value) * 1024 * 1024)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileTypes">Allowed File Types</Label>
                  <Textarea
                    id="fileTypes"
                    value={systemConfig.allowedFileTypes.join(', ')}
                    onChange={(e) => handleConfigUpdate('allowedFileTypes', e.target.value.split(', '))}
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automatic backup of encryption keys and metadata
                    </p>
                  </div>
                  <Switch
                    checked={systemConfig.backupEnabled}
                    onCheckedChange={(checked) => handleConfigUpdate('backupEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically verify file integrity after upload
                    </p>
                  </div>
                  <Switch
                    checked={systemConfig.autoVerification}
                    onCheckedChange={(checked) => handleConfigUpdate('autoVerification', checked)}
                  />
                </div>
              </div>

              <Button onClick={handleSaveConfig} className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-5 w-5" />
                Error Handling & Monitoring
              </CardTitle>
              <CardDescription>
                Monitor system errors, warnings, and resolve issues
              </CardDescription>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClearErrorLogs}>
                  Clear Resolved
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getErrorIcon(log.level)}
                          <Badge
                            variant={
                              log.level === 'error' ? 'destructive' :
                              log.level === 'warning' ? 'secondary' : 'default'
                            }
                          >
                            {log.level}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.component}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.message}</div>
                          {log.details && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {log.details}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.resolved ? 'default' : 'destructive'}>
                          {log.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!log.resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolveError(log.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {errorLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No error logs found. System is running smoothly.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Access Control Management
              </CardTitle>
              <CardDescription>
                Manage wallet permissions and access levels for the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="newWallet">Wallet Address</Label>
                  <Input
                    id="newWallet"
                    placeholder="0x..."
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newRole">Access Role</Label>
                  <Select value={newWalletRole} onValueChange={(value: any) => setNewWalletRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (Full Access)</SelectItem>
                      <SelectItem value="operator">Operator (Read/Write)</SelectItem>
                      <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleAddWalletAccess} className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Grant Access
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Last Access</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessControls.map((access) => (
                    <TableRow key={access.id}>
                      <TableCell>
                        <code className="text-xs">{access.walletAddress}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(access.role)}
                          <Badge
                            variant={
                              access.role === 'admin' ? 'destructive' :
                              access.role === 'operator' ? 'default' : 'secondary'
                            }
                          >
                            {access.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {access.permissions.map(perm => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimestamp(access.lastAccess)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={access.active ? 'default' : 'secondary'}>
                          {access.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleWalletAccess(access.id)}
                          >
                            {access.active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveWalletAccess(access.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Maintenance
              </CardTitle>
              <CardDescription>
                Perform system maintenance tasks and data management operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Database Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Export Pet Database
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Pet Data
                    </Button>
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Rebuild Indexes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">IPFS Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Network className="mr-2 h-4 w-4" />
                      Test IPFS Connection
                    </Button>
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync IPFS Pins
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download All Files
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Blockchain Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      Test Contract Connection
                    </Button>
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Transaction Status
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Network className="mr-2 h-4 w-4" />
                      Check Gas Prices
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Key className="mr-2 h-4 w-4" />
                      Rotate Encryption Keys
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      Audit Access Logs
                    </Button>
                    <Button variant="outline" className="w-full">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Run Security Scan
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Some maintenance operations may temporarily affect system availability. 
                  Please schedule maintenance during low-usage periods and notify users in advance.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}