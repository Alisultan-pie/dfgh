/**
 * IPFS Guard Middleware - Prevents fake CID fallbacks
 * 
 * Hard-fails requests when IPFS is not properly configured
 * Ensures only real IPFS uploads are processed
 */

export function requireRealIPFS({ clientRef, readinessFlag }) {
  return (req, res, next) => {
    if (!readinessFlag() || !clientRef()) {
      return res.status(422).json({
        success: false,
        error: 'IPFS_NOT_CONFIGURED',
        details: 'Real IPFS credentials required; fake CIDs are disabled.'
      });
    }
    next();
  };
}
