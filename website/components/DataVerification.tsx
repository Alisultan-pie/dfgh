import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Search, CheckCircle, AlertTriangle, Shield, Hash, RefreshCw, Loader2, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationResult {
  id: string;
  petId: string;
  cid: string;
  originalHash: string;
  downloadedHash: string;
  isValid: boolean;
  fileSize: number;
  verifiedAt: string;
  encryptionIntact: boolean;
  downloadTime: number;
}

interface BatchVerificationProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
}

export function DataVerification() {
  const [singleCid, setSingleCid] = useState('');
  const [singleResult, setSingleResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState<VerificationResult[]>([]);
  const [batchProgress, setBatchProgress] = useState<BatchVerificationProgress | null>(null);
  const [isBatchVerifying, setIsBatchVerifying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock verification history
  useEffect(() => {
    const mockHistory: VerificationResult[] = [
      {
        id: '1',
        petId: 'PET001',
        cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        originalHash: 'sha256:a1b2c3d4e5f6789012345678901234567890abcdef',
        downloadedHash: 'sha256:a1b2c3d4e5f6789012345678901234567890abcdef',
        isValid: true,
        fileSize: 2048576,
        verifiedAt: '2025-01-30T10:30:00Z',
        encryptionIntact: true,
        downloadTime: 1250
      },
      {
        id: '2',
        petId: 'PET002',
        cid: 'QmPwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
        originalHash: 'sha256:b2c3d4e5f6a789012345678901234567890abcdef1',
        downloadedHash: 'sha256:b2c3d4e5f6a789012345678901234567890abcdef1',
        isValid: true,
        fileSize: 1875394,
        verifiedAt: '2025-01-30T09:15:00Z',
        encryptionIntact: true,
        downloadTime: 980
      },
      {
        id: '3',
        petId: 'PET003',
        cid: 'QmRwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI',
        originalHash: 'sha256:c3d4e5f6a7b89012345678901234567890abcdef12',
        downloadedHash: 'sha256:d4e5f6a7b8c90123456789012345678901234567',
        isValid: false,
        fileSize: 2156473,
        verifiedAt: '2025-01-30T08:45:00Z',
        encryptionIntact: false,
        downloadTime: 1540
      },
      {
        id: '4',
        petId: 'PET004',
        cid: 'QmSwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdJ',
        originalHash: 'sha256:e4f5g6h7i8j901234567890123456789012345abc',
        downloadedHash: 'sha256:e4f5g6h7i8j901234567890123456789012345abc',
        isValid: true,
        fileSize: 1923847,
        verifiedAt: '2025-01-30T07:20:00Z',
        encryptionIntact: true,
        downloadTime: 1100
      }
    ];

    setVerificationHistory(mockHistory);
  }, []);

  const simulateVerification = async (cid: string): Promise<VerificationResult> => {
    // Simulate IPFS download and hash verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockPetId = `PET${Math.random().toString().substr(2, 3)}`;
    const originalHash = `sha256:${Math.random().toString(16).substr(2, 40)}`;
    const isValid = Math.random() > 0.15; // 85% success rate
    const downloadedHash = isValid ? originalHash : `sha256:${Math.random().toString(16).substr(2, 40)}`;
    
    return {
      id: Date.now().toString(),
      petId: mockPetId,
      cid,
      originalHash,
      downloadedHash,
      isValid,
      fileSize: Math.floor(Math.random() * 3000000) + 1000000,
      verifiedAt: new Date().toISOString(),
      encryptionIntact: isValid,
      downloadTime: Math.floor(Math.random() * 1000) + 500
    };
  };

  const handleSingleVerification = async () => {
    if (!singleCid.trim()) {
      toast.error('Please enter a valid IPFS CID');
      return;
    }

    if (!singleCid.startsWith('Qm') || singleCid.length < 40) {
      toast.error('Invalid IPFS CID format');
      return;
    }

    setIsVerifying(true);
    setSingleResult(null);

    try {
      const result = await simulateVerification(singleCid);
      setSingleResult(result);
      
      // Add to history
      setVerificationHistory(prev => [result, ...prev]);

      if (result.isValid) {
        toast.success('Data integrity verified successfully!');
      } else {
        toast.error('Data integrity verification failed!');
      }
    } catch (error) {
      toast.error('Verification process failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBatchVerification = async () => {
    const allCids = verificationHistory.map(v => v.cid);
    if (allCids.length === 0) {
      toast.error('No CIDs found for batch verification');
      return;
    }

    setIsBatchVerifying(true);
    setBatchProgress({
      total: allCids.length,
      completed: 0,
      failed: 0,
      current: ''
    });

    const newResults: VerificationResult[] = [];

    for (let i = 0; i < allCids.length; i++) {
      const cid = allCids[i];
      setBatchProgress(prev => prev ? { ...prev, current: cid } : null);

      try {
        const result = await simulateVerification(cid);
        newResults.push(result);
        
        setBatchProgress(prev => prev ? {
          ...prev,
          completed: prev.completed + 1,
          failed: result.isValid ? prev.failed : prev.failed + 1
        } : null);
      } catch (error) {
        setBatchProgress(prev => prev ? {
          ...prev,
          completed: prev.completed + 1,
          failed: prev.failed + 1
        } : null);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Update history with fresh verification results
    setVerificationHistory(newResults);
    setBatchProgress(null);
    setIsBatchVerifying(false);

    const successCount = newResults.filter(r => r.isValid).length;
    const failCount = newResults.length - successCount;

    toast.success(`Batch verification complete: ${successCount} passed, ${failCount} failed`);
  };

  const filteredHistory = verificationHistory.filter(result =>
    result.petId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.cid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateHash = (hash: string, length = 20) => {
    return `${hash.slice(0, length)}...`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verified</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationHistory.length}</div>
            <p className="text-xs text-muted-foreground">Files checked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Files</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verificationHistory.filter(v => v.isValid).length}
            </div>
            <p className="text-xs text-muted-foreground">Hash integrity passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Files</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verificationHistory.filter(v => !v.isValid).length}
            </div>
            <p className="text-xs text-muted-foreground">Integrity issues found</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verificationHistory.length > 0 
                ? Math.round((verificationHistory.filter(v => v.isValid).length / verificationHistory.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Verification success</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="single" className="space-y-4">
        <TabsList>
          <TabsTrigger value="single">Single Verification</TabsTrigger>
          <TabsTrigger value="batch">Batch Verification</TabsTrigger>
          <TabsTrigger value="history">Verification History</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                IPFS Hash Integrity Verification
              </CardTitle>
              <CardDescription>
                Verify the integrity of encrypted pet biometric data stored on IPFS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cid">IPFS CID</Label>
                <Input
                  id="cid"
                  placeholder="Enter IPFS Content Identifier (e.g., QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG)"
                  value={singleCid}
                  onChange={(e) => setSingleCid(e.target.value)}
                  disabled={isVerifying}
                />
              </div>

              <Button 
                onClick={handleSingleVerification}
                disabled={!singleCid.trim() || isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Hash Integrity...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Data Integrity
                  </>
                )}
              </Button>

              {singleResult && (
                <Alert className={singleResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {singleResult.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">
                        {singleResult.isValid ? 'Verification Successful' : 'Verification Failed'}
                      </div>
                      <div className="text-sm space-y-1">
                        <div><strong>Pet ID:</strong> {singleResult.petId}</div>
                        <div><strong>File Size:</strong> {formatFileSize(singleResult.fileSize)}</div>
                        <div><strong>Download Time:</strong> {singleResult.downloadTime}ms</div>
                        <div><strong>Encryption Status:</strong> {singleResult.encryptionIntact ? 'Intact' : 'Compromised'}</div>
                        <div><strong>Original Hash:</strong> <code className="text-xs">{truncateHash(singleResult.originalHash)}</code></div>
                        <div><strong>Downloaded Hash:</strong> <code className="text-xs">{truncateHash(singleResult.downloadedHash)}</code></div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Automated Batch Verification
              </CardTitle>
              <CardDescription>
                Verify all stored pet biometric data files for integrity and encryption status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Available Files: {verificationHistory.length}</p>
                  <p className="text-sm text-muted-foreground">
                    This will re-verify all files in the system
                  </p>
                </div>
                <Button 
                  onClick={handleBatchVerification}
                  disabled={isBatchVerifying || verificationHistory.length === 0}
                >
                  {isBatchVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Start Batch Verification
                    </>
                  )}
                </Button>
              </div>

              {batchProgress && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {batchProgress.completed} of {batchProgress.total}</span>
                    <span>{Math.round((batchProgress.completed / batchProgress.total) * 100)}%</span>
                  </div>
                  <Progress value={(batchProgress.completed / batchProgress.total) * 100} />
                  <div className="text-sm text-muted-foreground">
                    Currently verifying: <code className="text-xs">{truncateHash(batchProgress.current, 30)}</code>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">✓ Passed: {batchProgress.completed - batchProgress.failed}</span>
                    <span className="text-red-600">✗ Failed: {batchProgress.failed}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
              <CardDescription>
                Complete log of all hash integrity verifications performed
              </CardDescription>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Pet ID or CID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pet ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IPFS CID</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Download Time</TableHead>
                    <TableHead>Verified At</TableHead>
                    <TableHead>Encryption</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.petId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {result.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge
                            variant={result.isValid ? 'default' : 'destructive'}
                          >
                            {result.isValid ? 'Valid' : 'Invalid'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{truncateHash(result.cid, 15)}</code>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatFileSize(result.fileSize)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {result.downloadTime}ms
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimestamp(result.verifiedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={result.encryptionIntact ? 'default' : 'destructive'}
                        >
                          {result.encryptionIntact ? 'Intact' : 'Compromised'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredHistory.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No verification records found matching your search criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}