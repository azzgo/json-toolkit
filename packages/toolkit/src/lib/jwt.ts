export interface JwtHeader {
  alg: string;
  typ: string;
  [key: string]: any;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

export interface JwtToken {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  rawHeader: string;
  rawPayload: string;
  rawSignature: string;
}

export interface JwtError {
  message: string;
  type: 'structure' | 'encoding' | 'json';
}

export interface VerificationResult {
  isValid: boolean;
  algorithm: string;
  message: string;
}

export class JwtDecodeError extends Error {
  public type: JwtError['type'];
  
  constructor(message: string, type: JwtError['type']) {
    super(message);
    this.type = type;
    this.name = 'JwtDecodeError';
  }
}

function base64UrlDecode(str: string): string {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if necessary
  while (base64.length % 4) {
    base64 += '=';
  }
  
  try {
    // Decode base64
    const decoded = atob(base64);
    // Convert to UTF-8 using TextEncoder/TextDecoder
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (error) {
    throw new JwtDecodeError('Invalid Base64 encoding', 'encoding');
  }
}

function base64UrlEncode(str: string): string {
  // Convert string to base64
  const base64 = btoa(str);
  // Convert base64 to base64url
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

async function hmacSign(algorithm: string, secret: string, data: string): Promise<string> {
  const algorithmMap: { [key: string]: string } = {
    'HS256': 'SHA-256',
    'HS384': 'SHA-384',
    'HS512': 'SHA-512'
  };

  const hashAlgorithm = algorithmMap[algorithm];
  if (!hashAlgorithm) {
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      stringToUint8Array(secret),
      { name: 'HMAC', hash: hashAlgorithm },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      stringToUint8Array(data)
    );

    // Convert ArrayBuffer to base64url
    const signatureArray = new Uint8Array(signature);
    const signatureString = String.fromCharCode(...signatureArray);
    return base64UrlEncode(signatureString);
  } catch (error) {
    throw new Error('Failed to create signature');
  }
}

export function parseJwt(token: string): JwtToken {
  if (!token || typeof token !== 'string') {
    throw new JwtDecodeError('Token must be a non-empty string', 'structure');
  }

  const parts = token.split('.');
  
  if (parts.length !== 3) {
    throw new JwtDecodeError('Invalid JWT structure. A valid JWT requires header, payload, and signature parts separated by dots.', 'structure');
  }

  const [headerPart, payloadPart, signaturePart] = parts;

  if (!headerPart || !payloadPart || !signaturePart) {
    throw new JwtDecodeError('All JWT parts (header, payload, signature) must be present and non-empty', 'structure');
  }

  let header: JwtHeader;
  let payload: JwtPayload;

  try {
    const decodedHeader = base64UrlDecode(headerPart);
    header = JSON.parse(decodedHeader);
  } catch (error) {
    if (error instanceof JwtDecodeError) {
      throw new JwtDecodeError('Invalid Base64 encoding in header section', 'encoding');
    }
    throw new JwtDecodeError('Invalid JSON in header section', 'json');
  }

  try {
    const decodedPayload = base64UrlDecode(payloadPart);
    payload = JSON.parse(decodedPayload);
  } catch (error) {
    if (error instanceof JwtDecodeError) {
      throw new JwtDecodeError('Invalid Base64 encoding in payload section', 'encoding');
    }
    throw new JwtDecodeError('Invalid JSON in payload section', 'json');
  }

  return {
    header,
    payload,
    signature: signaturePart,
    rawHeader: headerPart,
    rawPayload: payloadPart,
    rawSignature: signaturePart,
  };
}

export async function verifyJwtSignature(token: string, secret: string): Promise<VerificationResult> {
  try {
    const decodedToken = parseJwt(token);
    const { header } = decodedToken;
    
    // Check if algorithm is supported
    const supportedAlgorithms = ['HS256', 'HS384', 'HS512'];
    if (!supportedAlgorithms.includes(header.alg)) {
      return {
        isValid: false,
        algorithm: header.alg,
        message: `Algorithm ${header.alg} is not supported. Supported algorithms: ${supportedAlgorithms.join(', ')}`
      };
    }

    // Create the signing input (header.payload)
    const signingInput = `${decodedToken.rawHeader}.${decodedToken.rawPayload}`;
    
    // Generate expected signature
    const expectedSignature = await hmacSign(header.alg, secret, signingInput);
    
    // Compare signatures
    const actualSignature = decodedToken.rawSignature;
    const isValid = expectedSignature === actualSignature;
    
    return {
      isValid,
      algorithm: header.alg,
      message: isValid 
        ? `Signature verified successfully using ${header.alg}`
        : `Signature verification failed. Expected: ${expectedSignature}, Got: ${actualSignature}`
    };
    
  } catch (error) {
    if (error instanceof JwtDecodeError) {
      return {
        isValid: false,
        algorithm: 'unknown',
        message: `Token parsing failed: ${error.message}`
      };
    }
    
    return {
      isValid: false,
      algorithm: 'unknown',
      message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  } catch (error) {
    return 'Invalid timestamp';
  }
}

export function isTokenExpired(payload: JwtPayload): boolean {
  if (!payload.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

export function getTimestampStatus(payload: JwtPayload): {
  isExpired: boolean;
  isNotYetValid: boolean;
  timeToExpiry?: string;
} {
  const now = Date.now() / 1000;
  const isExpired = payload.exp ? now >= payload.exp : false;
  const isNotYetValid = payload.nbf ? now < payload.nbf : false;
  
  let timeToExpiry: string | undefined;
  if (payload.exp && !isExpired) {
    const secondsToExpiry = payload.exp - now;
    if (secondsToExpiry < 3600) {
      timeToExpiry = `${Math.floor(secondsToExpiry / 60)}m ${Math.floor(secondsToExpiry % 60)}s`;
    } else if (secondsToExpiry < 86400) {
      timeToExpiry = `${Math.floor(secondsToExpiry / 3600)}h ${Math.floor((secondsToExpiry % 3600) / 60)}m`;
    } else {
      timeToExpiry = `${Math.floor(secondsToExpiry / 86400)}d ${Math.floor((secondsToExpiry % 86400) / 3600)}h`;
    }
  }
  
  return { isExpired, isNotYetValid, timeToExpiry };
}

export function formatJsonWithTimestamps(payload: JwtPayload): string {
  const formatted = { ...payload };
  
  // Add human-readable timestamps for standard JWT time fields
  const timeFields = ['exp', 'iat', 'nbf'] as const;
  
  timeFields.forEach(field => {
    if (formatted[field] && typeof formatted[field] === 'number') {
      // Add a formatted version alongside the original timestamp
      formatted[`${field}_formatted` as keyof JwtPayload] = formatTimestamp(formatted[field] as number);
    }
  });
  
  return JSON.stringify(formatted, null, 2);
}