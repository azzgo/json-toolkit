import { faker } from '@faker-js/faker';

export interface MockDataOptions {
  count: number;
  locale?: string;
  seed?: number;
  customMappings?: Record<string, string>;
}

export interface FieldMapping {
  field: string;
  type: string;
  fakerMethod: string;
  detected: boolean;
}

// Field name patterns for intelligent detection
const FIELD_PATTERNS = {
  // Email patterns
  email: /^(email|mail|e_mail|user_email|contact_email)$/i,
  
  // Name patterns
  firstName: /^(first_?name|fname|given_?name)$/i,
  lastName: /^(last_?name|lname|surname|family_?name)$/i,
  fullName: /^(name|full_?name|display_?name|user_?name)$/i,
  
  // Phone patterns
  phone: /^(phone|tel|telephone|mobile|cell|phone_?number|tel_?number)$/i,
  
  // Address patterns
  address: /^(address|street|street_?address|addr)$/i,
  city: /^(city|town|locality)$/i,
  state: /^(state|province|region)$/i,
  country: /^(country|nation)$/i,
  zipCode: /^(zip|postal|zip_?code|postal_?code)$/i,
  
  // Date patterns
  birthDate: /^(birth_?date|dob|date_?of_?birth)$/i,
  createdAt: /^(created_?at|create_?date|date_?created)$/i,
  updatedAt: /^(updated_?at|update_?date|date_?updated|modified_?at)$/i,
  
  // ID patterns
  id: /^(id|_id|uid|user_?id|primary_?key)$/i,
  uuid: /^(uuid|guid)$/i,
  
  // Company patterns
  company: /^(company|organization|org|employer)$/i,
  jobTitle: /^(job_?title|position|role|title)$/i,
  
  // Internet patterns
  username: /^(username|user_?name|login|handle)$/i,
  website: /^(website|url|site|homepage)$/i,
  
  // Commerce patterns
  price: /^(price|cost|amount|value)$/i,
  productName: /^(product|item|name|title)$/i,
  description: /^(description|desc|details|summary)$/i,
  
  // Boolean patterns
  isActive: /^(is_?active|active|enabled)$/i,
  isVerified: /^(is_?verified|verified|confirmed)$/i,
  
  // Number patterns
  age: /^(age|years)$/i,
  count: /^(count|quantity|qty|amount|number)$/i,
};

const FAKER_MAPPINGS = {
  email: () => faker.internet.email(),
  firstName: () => faker.person.firstName(),
  lastName: () => faker.person.lastName(),
  fullName: () => faker.person.fullName(),
  phone: () => faker.phone.number(),
  address: () => faker.location.streetAddress(),
  city: () => faker.location.city(),
  state: () => faker.location.state(),
  country: () => faker.location.country(),
  zipCode: () => faker.location.zipCode(),
  birthDate: () => faker.date.birthdate().toISOString(),
  createdAt: () => faker.date.past().toISOString(),
  updatedAt: () => faker.date.recent().toISOString(),
  id: () => faker.number.int({ min: 1, max: 10000 }),
  uuid: () => faker.string.uuid(),
  company: () => faker.company.name(),
  jobTitle: () => faker.person.jobTitle(),
  username: () => faker.internet.username(),
  website: () => faker.internet.url(),
  price: () => faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
  productName: () => faker.commerce.productName(),
  description: () => faker.lorem.sentence(),
  isActive: () => faker.datatype.boolean(),
  isVerified: () => faker.datatype.boolean(),
  age: () => faker.number.int({ min: 18, max: 80 }),
  count: () => faker.number.int({ min: 1, max: 100 }),
};

export function detectFieldType(fieldName: string, value: any): string {
  const lowerFieldName = fieldName.toLowerCase();
  
  // Check patterns
  for (const [type, pattern] of Object.entries(FIELD_PATTERNS)) {
    if (pattern.test(lowerFieldName)) {
      return type;
    }
  }
  
  // Fallback based on value type
  if (typeof value === 'string') {
    if (value.includes('@')) return 'email';
    if (value.length > 50) return 'description';
    return 'fullName';
  }
  
  if (typeof value === 'number') {
    return value > 0 && value < 150 ? 'age' : 'count';
  }
  
  if (typeof value === 'boolean') {
    return 'isActive';
  }
  
  return 'fullName'; // Default fallback
}

export function analyzeJsonStructure(jsonData: any): FieldMapping[] {
  const mappings: FieldMapping[] = [];
  
  function analyzeObject(obj: any, path: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      
      if (Array.isArray(value) && value.length > 0) {
        // Analyze first item of array
        analyzeObject(value[0], `${fullPath}[0]`);
      } else if (typeof value === 'object' && value !== null) {
        // Nested object
        analyzeObject(value, fullPath);
      } else {
        // Leaf field
        const detectedType = detectFieldType(key, value);
        mappings.push({
          field: fullPath,
          type: typeof value,
          fakerMethod: detectedType,
          detected: true,
        });
      }
    }
  }
  
  analyzeObject(jsonData);
  return mappings;
}

export function generateMockData(
  template: any,
  options: MockDataOptions,
  mappings?: FieldMapping[]
): any[] {
  // Set seed if provided
  if (options.seed) {
    faker.seed(options.seed);
  }
  
  // Note: locale setting would need to be handled differently in newer faker.js versions
  // For now, we'll use the default locale
  
  const results: any[] = [];
  
  for (let i = 0; i < options.count; i++) {
    results.push(generateSingleRecord(template, mappings, options.customMappings));
  }
  
  return results;
}

function generateSingleRecord(
  template: any,
  mappings?: FieldMapping[],
  customMappings?: Record<string, string>
): any {
  function processValue(value: any, path: string = ''): any {
    if (Array.isArray(value)) {
      // Generate array with 1-5 items
      const arrayLength = faker.number.int({ min: 1, max: 5 });
      return Array.from({ length: arrayLength }, () =>
        value.length > 0 ? processValue(value[0], `${path}[0]`) : null
      );
    }
    
    if (typeof value === 'object' && value !== null) {
      const result: any = {};
      for (const [key, val] of Object.entries(value)) {
        const fullPath = path ? `${path}.${key}` : key;
        result[key] = processValue(val, fullPath);
      }
      return result;
    }
    
    // Leaf value - generate fake data
    const fieldName = path.split('.').pop() || path;
    
    // Check for custom mapping first
    if (customMappings && customMappings[path]) {
      const customMethod = customMappings[path];
      return generateFromFakerMethod(customMethod);
    }
    
    // Check for detected mapping
    const mapping = mappings?.find(m => m.field === path);
    if (mapping) {
      return generateFromFakerMethod(mapping.fakerMethod);
    }
    
    // Fallback detection
    const detectedType = detectFieldType(fieldName, value);
    return generateFromFakerMethod(detectedType);
  }
  
  return processValue(template);
}

function generateFromFakerMethod(method: string): any {
  const generator = FAKER_MAPPINGS[method as keyof typeof FAKER_MAPPINGS];
  return generator ? generator() : faker.lorem.word();
}

export function exportToJson(data: any[], format: 'array' | 'objects'): string {
  if (format === 'array') {
    return JSON.stringify(data, null, 2);
  } else {
    return data.map(item => JSON.stringify(item)).join('\n');
  }
}

export function exportToCsv(data: any[]): string {
  if (data.length === 0) return '';
  
  // Flatten nested objects for CSV
  const flattenedData = data.map(item => flattenObject(item));
  
  // Get all unique keys
  const allKeys = new Set<string>();
  flattenedData.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  
  const headers = Array.from(allKeys);
  const csvRows = [
    headers.join(','),
    ...flattenedData.map(item =>
      headers.map(header => {
        const value = item[header] ?? '';
        // Escape quotes and wrap in quotes if contains comma or quotes
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

function flattenObject(obj: any, prefix: string = ''): any {
  const flattened: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (Array.isArray(value)) {
      // For arrays, just take first few items
      value.slice(0, 3).forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(flattened, flattenObject(item, `${newKey}[${index}]`));
        } else {
          flattened[`${newKey}[${index}]`] = item;
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  
  return flattened;
}

// Common templates for quick start
export const COMMON_TEMPLATES = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    isActive: true,
    profile: {
      firstName: "John",
      lastName: "Doe",
      phone: "123-456-7890",
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001"
      }
    }
  },
  product: {
    id: 1,
    name: "Product Name",
    description: "Product description",
    price: 29.99,
    category: "Category",
    inStock: true,
    createdAt: "2023-01-01T00:00:00.000Z"
  },
  blogPost: {
    id: 1,
    title: "Blog Post Title",
    content: "Blog post content goes here...",
    author: {
      name: "Author Name",
      email: "author@example.com"
    },
    publishedAt: "2023-01-01T00:00:00.000Z",
    tags: ["tag1", "tag2"]
  }
};