import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} from 'quicktype-core';

export interface SupportedLanguage {
  id: string;
  name: string;
  extension: string;
  icon?: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'python', name: 'Python (Pydantic)', extension: 'py' },
  { id: 'rust', name: 'Rust', extension: 'rs' },
  { id: 'swift', name: 'Swift', extension: 'swift' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
];

export interface CodeGenerationResult {
  code: string;
  language: string;
  success: boolean;
  error?: string;
}

export interface CodeGenerationOptions {
  typeName?: string;
  indentation?: string;
  alphabetizeProperties?: boolean;
}

/**
 * Generate code from JSON input for a specific target language
 */
export async function generateCode(
  jsonString: string,
  targetLanguage: string,
  options: CodeGenerationOptions = {}
): Promise<CodeGenerationResult> {
  try {
    // Validate JSON first
    let jsonInput: any;
    try {
      jsonInput = JSON.parse(jsonString);
    } catch (parseError) {
      return {
        code: '',
        language: targetLanguage,
        success: false,
        error: `Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
      };
    }

    // Handle empty input
    if (!jsonInput || (typeof jsonInput === 'object' && Object.keys(jsonInput).length === 0)) {
      return {
        code: '',
        language: targetLanguage,
        success: false,
        error: 'Empty or invalid JSON input',
      };
    }

    const typeName = options.typeName || 'GeneratedType';

    // Create input data for quicktype
    const quicktypeLanguage = getQuicktypeLanguageId(targetLanguage) as any;
    const jsonInputData = jsonInputForTargetLanguage(quicktypeLanguage);
    await jsonInputData.addSource({
      name: typeName,
      samples: [jsonString],
    });

    const inputData = new InputData();
    inputData.addInput(jsonInputData);

    // Configure quicktype options based on target language
    const quicktypeOptions = {
      lang: getQuicktypeLanguageId(targetLanguage),
      indentation: options.indentation || '  ',
      alphabetizeProperties: options.alphabetizeProperties ?? false,
      // Add language-specific options to generate only type definitions
      ...(targetLanguage === 'typescript' && {
        'just-types': true, // Only generate type definitions
      }),
      ...(targetLanguage === 'go' && {
        'just-types': true, // Only generate struct definitions
      }),
      ...(targetLanguage === 'python' && {
        'python-version': '3.7',
        'just-types': true, // Only generate class definitions
      }),
      ...(targetLanguage === 'swift' && {
        'just-types': true, // Only generate struct definitions
      }),
      ...(targetLanguage === 'csharp' && {
        'csharp-array-type': 'array',
        'just-types': true, // Only generate class definitions
      }),
      ...(targetLanguage === 'java' && {
        'java-package': 'com.example',
        'just-types': true,
      }),
      ...(targetLanguage === 'rust' && {
        'derive-debug': true,
        'derive-clone': true,
      }),
    };

    // Generate the code
    const result = await quicktype({
      inputData,
      lang: quicktypeOptions.lang as any,
      rendererOptions: quicktypeOptions,
    });

    if (result.lines.length === 0) {
      return {
        code: '',
        language: targetLanguage,
        success: false,
        error: 'No code was generated',
      };
    }

    return {
      code: result.lines.join('\n'),
      language: targetLanguage,
      success: true,
    };
  } catch (error) {
    console.error('Code generation error:', error);
    return {
      code: '',
      language: targetLanguage,
      success: false,
      error: `Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Generate code for multiple languages simultaneously
 */
export async function generateCodeForAllLanguages(
  jsonString: string,
  options: CodeGenerationOptions = {}
): Promise<Record<string, CodeGenerationResult>> {
  const results: Record<string, CodeGenerationResult> = {};

  // Generate code for each supported language
  const promises = SUPPORTED_LANGUAGES.map(async (lang) => {
    const result = await generateCode(jsonString, lang.id, options);
    results[lang.id] = result;
  });

  await Promise.all(promises);
  return results;
}

/**
 * Map our language IDs to quicktype language IDs
 */
function getQuicktypeLanguageId(languageId: string): string {
  const languageMap: Record<string, string> = {
    'typescript': 'typescript',
    'go': 'go',
    'java': 'java',
    'python': 'python',
    'rust': 'rust',
    'swift': 'swift',
    'csharp': 'cs',
  };

  return languageMap[languageId] || languageId;
}

/**
 * Get file extension for a language
 */
export function getFileExtension(languageId: string): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.id === languageId);
  return language?.extension || 'txt';
}

/**
 * Get display name for a language
 */
export function getLanguageDisplayName(languageId: string): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.id === languageId);
  return language?.name || languageId;
}

/**
 * Validate JSON and return detailed error information
 */
export function validateJSON(jsonString: string): { valid: boolean; error?: string; line?: number; column?: number } {
  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Try to extract line/column information from error message
      const match = error.message.match(/at position (\d+)/);
      let line: number | undefined;
      let column: number | undefined;

      if (match) {
        const position = parseInt(match[1], 10);
        const lines = jsonString.substring(0, position).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      return {
        valid: false,
        error: error.message,
        line,
        column,
      };
    }

    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown JSON validation error',
    };
  }
}

/**
 * Check if JSON input size is too large
 */
export function isJSONTooLarge(jsonString: string, maxSizeBytes: number = 1024 * 1024): boolean {
  return new Blob([jsonString]).size > maxSizeBytes;
}

