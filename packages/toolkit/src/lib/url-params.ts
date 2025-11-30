/**
 * URL Parameters utility functions for converting between URL query strings and JSON objects
 */

export interface ParsedUrlData {
  fullUrl: string;
  baseUrl: string;
  queryString: string;
  queryParams: Record<string, any>;
}

/**
 * Extracts query parameters from a full URL or query string
 */
export function extractQueryFromUrl(input: string): ParsedUrlData {
  let fullUrl = input.trim();
  let baseUrl = '';
  let queryString = '';

  // Handle different input formats
  if (input.includes('?')) {
    // Full URL with query string
    const urlParts = input.split('?');
    baseUrl = urlParts[0];
    queryString = urlParts.slice(1).join('?'); // Handle multiple ? characters
    fullUrl = input;
  } else if (input.startsWith('&') || /^[a-zA-Z_][\w]*=/.test(input)) {
    // Just query parameters (with or without leading &)
    queryString = input.startsWith('&') ? input.substring(1) : input;
    baseUrl = '';
    fullUrl = baseUrl + (queryString ? '?' + queryString : '');
  } else {
    // No query parameters
    baseUrl = input;
    queryString = '';
    fullUrl = input;
  }

  const queryParams = parseQueryString(queryString);

  return {
    fullUrl,
    baseUrl,
    queryString,
    queryParams
  };
}

/**
 * Parses a query string into a JSON object
 */
export function parseQueryString(queryString: string): Record<string, any> {
  if (!queryString) return {};

  const params: Record<string, any> = {};
  const searchParams = new URLSearchParams(queryString);

  // Handle regular parameters
  for (const [key, value] of searchParams.entries()) {
    // Handle array notation (e.g., tags=red&tags=blue)
    if (params[key] !== undefined) {
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  }

  // Parse nested objects (e.g., user[name]=John&user[email]=john@example.com)
  const nestedParams: Record<string, any> = {};
  Object.keys(params).forEach(key => {
    if (key.includes('[') && key.includes(']')) {
      const matches = key.match(/^([^\[]+)\[([^\]]*)\]$/);
      if (matches) {
        const [, parentKey, childKey] = matches;
        if (!nestedParams[parentKey]) {
          nestedParams[parentKey] = {};
        }
        nestedParams[parentKey][childKey] = params[key];
        delete params[key];
      }
    }
  });

  return { ...params, ...nestedParams };
}

/**
 * Converts a JSON object to a URL query string
 */
export function objectToQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();

  function addParam(key: string, value: any) {
    if (Array.isArray(value)) {
      value.forEach(item => params.append(key, String(item)));
    } else if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(subKey => {
        addParam(`${key}[${subKey}]`, value[subKey]);
      });
    } else {
      params.append(key, String(value));
    }
  }

  Object.keys(obj).forEach(key => {
    addParam(key, obj[key]);
  });

  return params.toString();
}

/**
 * Validates if a string is a valid URL format
 */
export function isValidUrl(input: string): boolean {
  try {
    // Try parsing as a full URL
    new URL(input);
    return true;
  } catch {
    // Check if it's a partial URL or query string
    if (input.includes('=') || input.includes('?') || input.includes('&')) {
      return true;
    }
    // Check if it's a path-like string
    if (input.startsWith('/') || input.includes('.')) {
      return true;
    }
    return false;
  }
}

/**
 * Formats a query string for display (adds ? if needed)
 */
export function formatQueryString(queryString: string): string {
  if (!queryString) return '';
  return queryString.startsWith('?') ? queryString : '?' + queryString;
}

/**
 * Type guard to check if a value is a simple serializable object
 */
export function isSerializableForUrl(value: any): boolean {
  if (value === null || value === undefined) return false;
  
  const type = typeof value;
  if (['string', 'number', 'boolean'].includes(type)) return true;
  
  if (Array.isArray(value)) {
    return value.every(item => isSerializableForUrl(item));
  }
  
  if (type === 'object') {
    return Object.values(value).every(val => isSerializableForUrl(val));
  }
  
  return false;
}