import { repairJson } from './src/lib/json-repair.js';

// Test cases for JSON repair functionality
const testCases = [
  // Valid JSON (should pass through)
  '{"name": "John", "age": 30}',
  
  // JavaScript object literal
  '{name: "John", age: 30}',
  
  // Single quotes
  "{'name': 'John', 'age': 30}",
  
  // Trailing commas
  '{"name": "John", "age": 30,}',
  
  // Unquoted keys with single quotes
  "{name: 'John', age: 30}",
  
  // Complex mixed case
  "{name: 'John', age: 30, items: ['a', 'b', 'c',], active: true,}",
  
  // Array with trailing comma
  '["a", "b", "c",]',
  
  // Invalid JSON that should fail
  'this is not json at all',
];

console.log('Testing JSON repair functionality...\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase}`);
  console.log('─'.repeat(50));
  
  const result = repairJson(testCase);
  
  console.log(`Success: ${result.success}`);
  console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
  console.log(`Is Valid JSON: ${result.isValidJson || 'false'}`);
  
  if (result.repairedText && result.repairedText !== testCase) {
    console.log(`Repaired: ${result.repairedText}`);
  }
  
  if (result.repairSuggestions.length > 0) {
    console.log('Suggestions:');
    result.repairSuggestions.forEach(suggestion => {
      console.log(`  - ${suggestion.description} (${Math.round(suggestion.confidence * 100)}%)`);
    });
  }
  
  if (result.errors && result.errors.length > 0) {
    console.log('Errors:');
    result.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }
  
  console.log('\n');
});

console.log('JSON repair testing completed.');