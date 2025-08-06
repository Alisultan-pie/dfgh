import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, ExternalLink, Shield, Clock, CheckCircle, AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface BlockchainTransaction {
  id: string;
  petId: string;
  txHash: string;
  cid: string;
  timestamp: string;
  blockNumber: number;
  gasUsed: string;
  status: 'confirmed' | 'pending' | 'failed';
  network: string;
}

interface NetworkStats {
  totalTransactions: number;
  confirmedTransactions: number;
  pendingTransactions: number;
  averageGasUsed: string;
  lastBlockNumber: number;
}

export function BlockchainTracker() {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalTransactions: 24,
    confirmedTransactions: 22,
    pendingTransactions: 2,
    averageGasUsed: '45,231',
    lastBlockNumber: 52847291
  });
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);

  // Mock data generation
  useEffect(() => {
    const mockTransactions: BlockchainTransaction[] = [
      {
        id: '1',
        petId: 'PET001',
        txHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        timestamp: '2025-01-30T10:30:00Z',
        blockNumber: 52847291,
        gasUsed: '42,156',
        status: 'confirmed',
        network: 'Polygon Amoy'
      },
      {
        id: '2',
        petId: 'PET002',
        txHash: '0xb2c3d4e5f6a789012345678901234567890abcdef1234567890abcdef1234567',
        cid: 'QmPwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
        timestamp: '2025-01-30T09:15:00Z',
        blockNumber: 52847288,
        gasUsed: '41,890',
        status: 'confirmed',
        network: 'Polygon Amoy'
      },
      {
        id: '3',
        petId: 'PET003',
        txHash: '0xc3d4e5f6a7b89012345678901234567890abcdef1234567890abcdef12345678',
        cid: 'QmRwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI',
        timestamp: '2025-01-30T08:45:00Z',
        blockNumber: 0,
        gasUsed: '0',
        status: 'pending',
        network: 'Polygon Amoy'
      },
      {
        id: '4',
        petId: 'PET004',
        txHash: '0xd4e5f6a7b8c9012345678901234567890abcdef1234567890abcdef123456789',
        cid: 'QmSwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdJ',
        timestamp: '2025-01-30T07:20:00Z',
        blockNumber: 52847285,
        gasUsed: '43,445',
        status: 'confirmed',
        network: 'Polygon Amoy'
      },
      {
        id: '5',
        petId: 'PET005',
        txHash: '0xe5f6a7b8c9d012345678901234567890abcdef1234567890abcdef1234567890',
        cid: 'QmTwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdK',
        timestamp: '2025-01-30T06:00:00Z',
        blockNumber: 0,
        gasUsed: '0',
        status: 'pending',
        network: 'Polygon Amoy'
      }
    ];

    setTransactions(mockTransactions);
  }, []);

  const filteredTransactions = transactions.filter(tx =>
    tx.petId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.cid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: BlockchainTransaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const truncateHash = (hash: string, start = 10, end = 8) => {
    return `${hash.slice(0, start)}...${hash.slice(-end)}`;
  };

  const openPolygonScan = (txHash: string) => {
    // In a real app, this would open the actual Polygon scan
    toast.info(`Opening Polygon scan for ${truncateHash(txHash)}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">On Polygon Amoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.confirmedTransactions}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Gas Used</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.averageGasUsed}</div>
            <p className="text-xs text-muted-foreground">Wei per transaction</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="details">Transaction Details</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Transaction History</CardTitle>
              <CardDescription>
                Monitor all pet biometric storage transactions on the blockchain
              </CardDescription>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Pet ID, transaction hash, or CID..."
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
                    <TableHead>Transaction Hash</TableHead>
                    <TableHead>IPFS CID</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.petId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tx.status)}
                          <Badge
                            variant={
                              tx.status === 'confirmed' ? 'default' :
                              tx.status === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs">{truncateHash(tx.txHash)}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tx.txHash)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs">{truncateHash(tx.cid, 8, 6)}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tx.cid)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tx.blockNumber > 0 ? tx.blockNumber.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimestamp(tx.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTx(tx)}
                          >
                            View
                          </Button>
                          {tx.status === 'confirmed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPolygonScan(tx.txHash)}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found matching your search criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedTx ? (
            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
                <CardDescription>
                  Detailed information for transaction {truncateHash(selectedTx.txHash)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pet ID</label>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{selectedTx.petId}</code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedTx.status)}
                      <Badge
                        variant={
                          selectedTx.status === 'confirmed' ? 'default' :
                          selectedTx.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {selectedTx.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Transaction Hash</label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1">{selectedTx.txHash}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedTx.txHash)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">IPFS CID</label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1">{selectedTx.cid}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedTx.cid)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Block Number</label>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {selectedTx.blockNumber > 0 ? selectedTx.blockNumber.toLocaleString() : 'Pending'}
                    </code>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gas Used</label>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {selectedTx.gasUsed || '0'} Wei
                    </code>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Network</label>
                    <Badge variant="outline">{selectedTx.network}</Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timestamp</label>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {formatTimestamp(selectedTx.timestamp)}
                    </code>
                  </div>
                </div>

                {selectedTx.status === 'confirmed' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      This transaction has been successfully confirmed on the blockchain and the pet biometric data is securely stored.
                    </AlertDescription>
                  </Alert>
                )}

                {selectedTx.status === 'pending' && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      This transaction is pending confirmation. It may take a few minutes to be processed by the network.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  Select a transaction from the history tab to view detailed information.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}