import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Upload, 
  Download, 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface BlockchainIntegrationProps {
  onUploadComplete?: () => void;
}

interface PetData {
  petId: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  description: string;
  file: File;
  encryptionKey?: string;
}

interface BlockchainData {
  cid: string;
  hash: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
}

export function BlockchainIntegration({ onUploadComplete }: BlockchainIntegrationProps) {
  const [petData, setPetData] = useState<PetData | null>(null);
  const [blockchainData, setBlockchainData] = useState<BlockchainData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    originalHash: string;
    blockchainHash: string;
  } | null>(null);
  const [isBlockchainOnline, setIsBlockchainOnline] = useState(false);

  // Check blockchain connectivity
  useEffect(() => {
    checkBlockchainConnectivity();
  }, []);

  const checkBlockchainConnectivity = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      setIsBlockchainOnline(data.blockchain);
    } catch (error) {
      console.error('Blockchain connectivity check failed:', error);
      setIsBlockchainOnline(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPetData(prev => prev ? { ...prev, file } : null);
    }
  };

  const handleInputChange = (field: keyof PetData, value: string | number) => {
    setPetData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const generateEncryptionKey = () => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const keyHex = Array.from(key, byte => byte.toString(16).padStart(2, '0')).join('');
    setPetData(prev => prev ? { ...prev, encryptionKey: keyHex } : null);
  };

  const uploadToBlockchain = async () => {
    if (!petData || !petData.file) {
      toast.error('Please select a file and fill in pet details');
      return;
    }

    setIsUploading(true);
    try {
      // Step 1: Upload to IPFS using Storacha
      const formData = new FormData();
      formData.append('file', petData.file);
      if (petData.encryptionKey) {
        formData.append('encryptionKey', petData.encryptionKey);
      }

      const uploadResponse = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('IPFS upload failed');
      }

      const uploadResult = await uploadResponse.json();

      // Step 2: Log to blockchain
      const timestamp = Math.floor(Date.now() / 1000);
      const blockchainResponse = await fetch('http://localhost:3001/blockchain/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petId: uploadResult.petId,
          cid: uploadResult.cid,
          timestamp,
        }),
      });

      if (!blockchainResponse.ok) {
        throw new Error('Blockchain transaction failed');
      }

      const blockchainResult = await blockchainResponse.json();

      // Step 3: Store in database
      const dbResponse = await fetch('http://localhost:3001/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...petData,
          petId: uploadResult.petId,
          ipfsCid: uploadResult.cid,
          ipfsHash: uploadResult.hash,
          blockchainTxHash: blockchainResult.txHash,
          blockchainBlockNumber: blockchainResult.blockNumber,
          blockchainTimestamp: timestamp,
        }),
      });

      if (!dbResponse.ok) {
        console.warn('Database storage failed, but blockchain upload succeeded');
      }

      setBlockchainData({
        cid: uploadResult.cid,
        hash: uploadResult.hash,
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber,
        timestamp,
      });

      toast.success('Pet data uploaded to blockchain successfully!', {
        description: `Transaction: ${blockchainResult.txHash.substring(0, 10)}...`,
      });

      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const verifyPetData = async () => {
    if (!blockchainData) {
      toast.error('No blockchain data available for verification');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`http://localhost:3001/verify/${petData?.petId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalHash: blockchainData.hash,
        }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const result = await response.json();
      setVerificationResult(result);

      if (result.isValid) {
        toast.success('Pet data integrity verified!', {
          description: 'The data on the blockchain matches the original file.',
        });
      } else {
        toast.error('Data integrity check failed', {
          description: 'The blockchain data does not match the original file.',
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const downloadFromIPFS = async () => {
    if (!blockchainData) {
      toast.error('No blockchain data available for download');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/download/${petData?.petId}?cid=${blockchainData.cid}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${petData?.name || 'pet'}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('File downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Blockchain Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blockchain Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={isBlockchainOnline ? "default" : "destructive"}>
              {isBlockchainOnline ? "Connected" : "Disconnected"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {isBlockchainOnline 
                ? "Blockchain and IPFS services are available" 
                : "Blockchain services are currently unavailable"
              }
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkBlockchainConnectivity}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pet Data Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Pet Data to Blockchain</CardTitle>
          <CardDescription>
            Securely store your pet's information on IPFS and the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Pet Name</Label>
              <Input
                id="name"
                placeholder="Enter pet name"
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="species">Species</Label>
              <Input
                id="species"
                placeholder="Dog, Cat, etc."
                onChange={(e) => handleInputChange('species', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                placeholder="Enter breed"
                onChange={(e) => handleInputChange('breed', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Age in years"
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell us about your pet..."
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="file">Pet Photo</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Encryption Key (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEncryptionKey(!showEncryptionKey)}
              >
                {showEncryptionKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type={showEncryptionKey ? "text" : "password"}
                placeholder="Enter encryption key or generate one"
                value={petData?.encryptionKey || ''}
                onChange={(e) => handleInputChange('encryptionKey', e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateEncryptionKey}
              >
                Generate
              </Button>
            </div>
          </div>

          <Button
            onClick={uploadToBlockchain}
            disabled={!petData?.file || isUploading || !isBlockchainOnline}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading to Blockchain...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload to Blockchain
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Blockchain Data Display */}
      {blockchainData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Blockchain Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">IPFS CID:</span>
                <p className="text-muted-foreground font-mono text-xs break-all">
                  {blockchainData.cid}
                </p>
              </div>
              <div>
                <span className="font-medium">File Hash:</span>
                <p className="text-muted-foreground font-mono text-xs break-all">
                  {blockchainData.hash}
                </p>
              </div>
              <div>
                <span className="font-medium">Transaction Hash:</span>
                <p className="text-muted-foreground font-mono text-xs break-all">
                  {blockchainData.txHash}
                </p>
              </div>
              <div>
                <span className="font-medium">Block Number:</span>
                <p className="text-muted-foreground">
                  {blockchainData.blockNumber}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={verifyPetData}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Integrity
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={downloadFromIPFS}
              >
                <Download className="h-4 w-4 mr-2" />
                Download from IPFS
              </Button>
            </div>

            {verificationResult && (
              <Alert variant={verificationResult.isValid ? "default" : "destructive"}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {verificationResult.isValid 
                    ? "Data integrity verified successfully!" 
                    : "Data integrity check failed. Hashes do not match."
                  }
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Offline Warning */}
      {!isBlockchainOnline && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Blockchain services are currently unavailable. Please ensure the backend server is running on port 3001.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 