import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Copy, Key, AlertTriangle, CheckCircle, Clock, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { parseJwt, JwtToken, JwtDecodeError, formatTimestamp, getTimestampStatus, formatJsonWithTimestamps, verifyJwtSignature, VerificationResult } from "@/lib/jwt";

function JwtDecoder() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [decodedToken, setDecodedToken] = useState<JwtToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleTokenChange = useCallback((value: string) => {
    setToken(value);
    if (!value.trim()) {
      setDecodedToken(null);
      setError(null);
      setVerificationResult(null);
      return;
    }

    try {
      const decoded = parseJwt(value.trim());
      setDecodedToken(decoded);
      setError(null);
      // Clear previous verification result when token changes
      setVerificationResult(null);
    } catch (err) {
      if (err instanceof JwtDecodeError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while decoding the JWT token");
      }
      setDecodedToken(null);
      setVerificationResult(null);
    }
  }, []);

  const handleSecretChange = useCallback((value: string) => {
    setSecret(value);
    // Clear verification result when secret changes
    setVerificationResult(null);
  }, []);

  const handleVerifySignature = useCallback(async () => {
    if (!token.trim() || !secret.trim()) {
      toast.error("Please provide both token and secret");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyJwtSignature(token.trim(), secret.trim());
      setVerificationResult(result);
      
      if (result.isValid) {
        toast.success("Signature verified successfully!");
      } else {
        toast.error("Signature verification failed");
      }
    } catch (error) {
      toast.error("Failed to verify signature");
      setVerificationResult({
        isValid: false,
        algorithm: 'unknown',
        message: 'Verification process failed'
      });
    } finally {
      setIsVerifying(false);
    }
  }, [token, secret]);

  // Auto-verify when both token and secret are present
  useEffect(() => {
    if (token.trim() && secret.trim() && decodedToken && !isVerifying) {
      handleVerifySignature();
    }
  }, [token, secret, decodedToken, isVerifying, handleVerifySignature]);

  const copyToClipboard = async (content: string, section: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${section} copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const getTokenStatus = () => {
    if (!decodedToken) return null;
    return getTimestampStatus(decodedToken.payload);
  };

  const tokenStatus = getTokenStatus();

  return (
    <div className="w-full flex-1 flex flex-col gap-4 p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="size-5" />
          <h1 className="text-xl font-semibold">JWT Decoder</h1>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="jwt-input" className="text-sm font-medium">
            JWT Token
          </label>
          <Input
            id="jwt-input"
            placeholder="Paste your JWT token here..."
            value={token}
            onChange={(e) => handleTokenChange(e.target.value)}
            className="font-mono text-sm"
          />
          {token && (
            <div className="text-xs text-muted-foreground">
              Token length: {token.length} characters
            </div>
          )}
        </div>

        {/* JWT Signature Verification Section */}
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Shield className="size-4" />
            <h2 className="text-sm font-semibold">JWT Signature Verification</h2>
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="secret-input" className="text-sm font-medium">
              Secret Key
            </label>
            <Input
              id="secret-input"
              type="password"
              placeholder="Enter the secret used to sign the JWT..."
              value={secret}
              onChange={(e) => handleSecretChange(e.target.value)}
              className="font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground">
              Enter the secret key to verify the JWT signature. Supports HMAC algorithms (HS256, HS384, HS512).
            </div>
          </div>

          {!token.trim() || !secret.trim() ? (
            <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
              <Shield className="size-4" />
              <span>Provide both token and secret to verify signature</span>
            </div>
          ) : isVerifying ? (
            <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
              <Shield className="size-4 animate-spin" />
              <span>Verifying signature...</span>
            </div>
          ) : verificationResult ? (
            <div className={`flex items-center gap-2 p-3 rounded border ${
              verificationResult.isValid 
                ? 'bg-green-500/10 border-green-500/20 text-green-700' 
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}>
              {verificationResult.isValid ? (
                <ShieldCheck className="size-4" />
              ) : (
                <ShieldX className="size-4" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {verificationResult.isValid ? 'Signature Verified' : 'Signature Invalid'}
                </div>
                <div className="text-xs opacity-80">
                  {verificationResult.message}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="size-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {decodedToken && tokenStatus && (
          <div className="space-y-2">
            {tokenStatus.isExpired && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="size-4 text-destructive" />
                <span className="text-sm text-destructive">Token is expired</span>
              </div>
            )}
            {tokenStatus.isNotYetValid && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Clock className="size-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">Token is not yet valid</span>
              </div>
            )}
            {!tokenStatus.isExpired && !tokenStatus.isNotYetValid && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="size-4 text-green-600" />
                <span className="text-sm text-green-600">
                  Token is valid
                  {tokenStatus.timeToExpiry && ` • Expires in ${tokenStatus.timeToExpiry}`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {decodedToken && (
        <div className="space-y-6">
          <Separator />
          
          {/* Header Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="size-4" />
                <h2 className="text-lg font-semibold">Header</h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(formatJson(decodedToken.header), "Header")}
                className="h-8 px-3 text-sm"
              >
                <Copy className="size-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto">
                {formatJson(decodedToken.header)}
              </pre>
            </div>
            <div className="text-xs text-muted-foreground">
              Algorithm: {decodedToken.header.alg} • Type: {decodedToken.header.typ}
            </div>
          </div>

          {/* Payload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Payload</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(formatJsonWithTimestamps(decodedToken.payload), "Payload")}
                className="h-8 px-3 text-sm"
              >
                <Copy className="size-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto">
                {formatJsonWithTimestamps(decodedToken.payload)}
              </pre>
            </div>
            
            {/* Timestamp information */}
            {(decodedToken.payload.iat || decodedToken.payload.exp || decodedToken.payload.nbf) && (
              <div className="space-y-2 text-xs text-muted-foreground">
                {decodedToken.payload.iat && (
                  <div>Issued at: {formatTimestamp(decodedToken.payload.iat)}</div>
                )}
                {decodedToken.payload.nbf && (
                  <div>Not before: {formatTimestamp(decodedToken.payload.nbf)}</div>
                )}
                {decodedToken.payload.exp && (
                  <div>Expires at: {formatTimestamp(decodedToken.payload.exp)}</div>
                )}
              </div>
            )}
          </div>

          {/* Signature Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Signature</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(decodedToken.signature, "Signature")}
                className="h-8 px-3 text-sm"
              >
                <Copy className="size-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm font-mono break-all">
                {decodedToken.signature}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Base64 URL encoded signature • Length: {decodedToken.signature.length} characters
            </div>
          </div>

          {/* Token Parts */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Token Parts</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Header (Base64)</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(decodedToken.rawHeader, "Raw Header")}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
                <div className="rounded border bg-muted/30 p-2">
                  <div className="text-xs font-mono break-all">
                    {decodedToken.rawHeader}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Payload (Base64)</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(decodedToken.rawPayload, "Raw Payload")}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
                <div className="rounded border bg-muted/30 p-2">
                  <div className="text-xs font-mono break-all">
                    {decodedToken.rawPayload}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Signature (Base64)</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(decodedToken.rawSignature, "Raw Signature")}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
                <div className="rounded border bg-muted/30 p-2">
                  <div className="text-xs font-mono break-all">
                    {decodedToken.rawSignature}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JwtDecoder;