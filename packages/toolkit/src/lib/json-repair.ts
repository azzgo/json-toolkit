import { jsonrepair } from 'jsonrepair';
import JSON5 from 'json5';

export interface JsonRepairResult {
  success: boolean;
  originalText: string;
  repairedText?: string;
  isValidJson?: boolean;
  repairSuggestions: RepairSuggestion[];
  confidence: number; // 0-1, where 1 is highest confidence
  errors?: string[];
}

export interface RepairSuggestion {
  type: 'trailing-comma' | 'unquoted-keys' | 'single-quotes' | 'js-object' | 'escape-chars' | 'unknown';
  description: string;
  applied: boolean;
  confidence: number;
}

/**
 * Attempts to repair malformed JSON using multiple strategies
 */
export function repairJson(text: string): JsonRepairResult {
  const result: JsonRepairResult = {
    success: false,
    originalText: text,
    repairSuggestions: [],
    confidence: 0,
    errors: []
  };

  if (!text || text.trim().length === 0) {
    result.errors = ['Empty or whitespace-only input'];
    return result;
  }

  const trimmed = text.trim();

  // First, check if it's already valid JSON
  try {
    JSON.parse(trimmed);
    result.success = true;
    result.repairedText = trimmed;
    result.isValidJson = true;
    result.confidence = 1.0;
    result.repairSuggestions.push({
      type: 'unknown',
      description: 'Input is already valid JSON',
      applied: false,
      confidence: 1.0
    });
    return result;
  } catch {
    // Continue with repair attempts
  }

  // Try different repair strategies in order of confidence
  const strategies = [
    () => repairWithJsonRepair(trimmed),
    () => repairWithJson5(trimmed),
    () => repairTrailingCommas(trimmed),
    () => repairUnquotedKeys(trimmed),
    () => repairSingleQuotes(trimmed),
    () => repairJavaScriptObject(trimmed),
  ];

  for (const strategy of strategies) {
    try {
      const strategyResult = strategy();
      if (strategyResult.success) {
        Object.assign(result, strategyResult);
        break;
      }
    } catch (error) {
      result.errors?.push(`Strategy failed: ${error}`);
    }
  }

  return result;
}

/**
 * Try to repair using the jsonrepair library
 */
function repairWithJsonRepair(text: string): JsonRepairResult {
  try {
    const repaired = jsonrepair(text);
    JSON.parse(repaired); // Validate the result
    
    return {
      success: true,
      originalText: text,
      repairedText: repaired,
      isValidJson: true,
      confidence: 0.9,
      repairSuggestions: [{
        type: 'unknown',
        description: 'Auto-repaired using jsonrepair library',
        applied: true,
        confidence: 0.9
      }]
    };
  } catch (error) {
    return {
      success: false,
      originalText: text,
      confidence: 0,
      repairSuggestions: [],
      errors: [`jsonrepair failed: ${error}`]
    };
  }
}

/**
 * Try to parse as JSON5 (superset of JSON that allows more flexible syntax)
 */
function repairWithJson5(text: string): JsonRepairResult {
  try {
    const parsed = JSON5.parse(text);
    const repaired = JSON.stringify(parsed, null, 2);
    
    return {
      success: true,
      originalText: text,
      repairedText: repaired,
      isValidJson: true,
      confidence: 0.85,
      repairSuggestions: [{
        type: 'js-object',
        description: 'Converted JavaScript object to valid JSON',
        applied: true,
        confidence: 0.85
      }]
    };
  } catch (error) {
    return {
      success: false,
      originalText: text,
      confidence: 0,
      repairSuggestions: [],
      errors: [`JSON5 parsing failed: ${error}`]
    };
  }
}

/**
 * Remove trailing commas
 */
function repairTrailingCommas(text: string): JsonRepairResult {
  const suggestions: RepairSuggestion[] = [];
  let repaired = text;
  let hasChanges = false;

  // Remove trailing commas before closing braces/brackets
  const trailingCommaRegex = /,(\s*[}\]])/g;
  const matches = [...text.matchAll(trailingCommaRegex)];
  
  if (matches.length > 0) {
    repaired = text.replace(trailingCommaRegex, '$1');
    hasChanges = true;
    suggestions.push({
      type: 'trailing-comma',
      description: `Removed ${matches.length} trailing comma(s)`,
      applied: true,
      confidence: 0.8
    });
  }

  if (hasChanges) {
    try {
      JSON.parse(repaired);
      return {
        success: true,
        originalText: text,
        repairedText: repaired,
        isValidJson: true,
        confidence: 0.8,
        repairSuggestions: suggestions
      };
    } catch {
      // Still not valid, continue
    }
  }

  return {
    success: false,
    originalText: text,
    confidence: 0,
    repairSuggestions: suggestions
  };
}

/**
 * Add quotes around unquoted keys
 */
function repairUnquotedKeys(text: string): JsonRepairResult {
  const suggestions: RepairSuggestion[] = [];
  let repaired = text;
  let hasChanges = false;

  // Match unquoted keys (word characters followed by colon)
  const unquotedKeyRegex = /(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g;
  const matches = [...text.matchAll(unquotedKeyRegex)];

  if (matches.length > 0) {
    repaired = text.replace(unquotedKeyRegex, '$1"$2":');
    hasChanges = true;
    suggestions.push({
      type: 'unquoted-keys',
      description: `Added quotes around ${matches.length} unquoted key(s)`,
      applied: true,
      confidence: 0.75
    });
  }

  if (hasChanges) {
    try {
      JSON.parse(repaired);
      return {
        success: true,
        originalText: text,
        repairedText: repaired,
        isValidJson: true,
        confidence: 0.75,
        repairSuggestions: suggestions
      };
    } catch {
      // Still not valid, continue
    }
  }

  return {
    success: false,
    originalText: text,
    confidence: 0,
    repairSuggestions: suggestions
  };
}

/**
 * Convert single quotes to double quotes
 */
function repairSingleQuotes(text: string): JsonRepairResult {
  const suggestions: RepairSuggestion[] = [];
  let repaired = text;
  let hasChanges = false;

  // Convert single quotes to double quotes, but be careful about escaped quotes
  const singleQuoteMatches = text.match(/'/g);
  if (singleQuoteMatches && singleQuoteMatches.length > 0) {
    // Simple replacement - this could be improved with more sophisticated parsing
    repaired = text.replace(/'/g, '"');
    hasChanges = true;
    suggestions.push({
      type: 'single-quotes',
      description: `Converted ${singleQuoteMatches.length} single quote(s) to double quotes`,
      applied: true,
      confidence: 0.7
    });
  }

  if (hasChanges) {
    try {
      JSON.parse(repaired);
      return {
        success: true,
        originalText: text,
        repairedText: repaired,
        isValidJson: true,
        confidence: 0.7,
        repairSuggestions: suggestions
      };
    } catch {
      // Still not valid, continue
    }
  }

  return {
    success: false,
    originalText: text,
    confidence: 0,
    repairSuggestions: suggestions
  };
}

/**
 * Try to convert JavaScript object literal to JSON
 */
function repairJavaScriptObject(text: string): JsonRepairResult {
  const suggestions: RepairSuggestion[] = [];
  let repaired = text;
  let hasChanges = false;

  // Multiple transformations for JS object -> JSON
  const transformations = [
    // Unquoted keys
    { regex: /(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, replacement: '$1"$2":', desc: 'Quote unquoted keys' },
    // Single quotes to double quotes
    { regex: /'/g, replacement: '"', desc: 'Convert single quotes to double quotes' },
    // Remove trailing commas
    { regex: /,(\s*[}\]])/g, replacement: '$1', desc: 'Remove trailing commas' },
    // Handle undefined/null values
    { regex: /:\s*undefined\b/g, replacement: ': null', desc: 'Convert undefined to null' },
  ];

  for (const transform of transformations) {
    const matches = [...repaired.matchAll(transform.regex)];
    if (matches.length > 0) {
      repaired = repaired.replace(transform.regex, transform.replacement);
      hasChanges = true;
      suggestions.push({
        type: 'js-object',
        description: `${transform.desc} (${matches.length} occurrence(s))`,
        applied: true,
        confidence: 0.6
      });
    }
  }

  if (hasChanges) {
    try {
      JSON.parse(repaired);
      return {
        success: true,
        originalText: text,
        repairedText: repaired,
        isValidJson: true,
        confidence: 0.65,
        repairSuggestions: suggestions
      };
    } catch {
      // Still not valid
    }
  }

  return {
    success: false,
    originalText: text,
    confidence: 0,
    repairSuggestions: suggestions
  };
}

/**
 * Detect if text looks like JSON or JavaScript object
 */
export function detectJsonLikeContent(text: string): boolean {
  if (!text || text.trim().length < 2) return false;
  
  const trimmed = text.trim();
  
  // Check for basic JSON-like structures
  const startsWithBrace = trimmed.startsWith('{') || trimmed.startsWith('[');
  const endsWithBrace = trimmed.endsWith('}') || trimmed.endsWith(']');
  
  // Check for object-like patterns (key: value, key = value, etc.)
  const hasKeyValuePatterns = /[\w"']\s*[:=]\s*[\w"'{[]/.test(trimmed);
  
  // Check for array-like patterns
  const hasArrayPatterns = /^\s*\[.*\]\s*$/.test(trimmed);
  
  // Check for common JSON/JS patterns
  const hasJsonPatterns = /["']\s*:\s*["'\[\{]/.test(trimmed);
  
  return (startsWithBrace && endsWithBrace) || hasKeyValuePatterns || hasArrayPatterns || hasJsonPatterns;
}