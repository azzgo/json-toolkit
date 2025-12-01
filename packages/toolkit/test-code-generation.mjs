import { generateCode } from './src/lib/code-generation.js';

const testJSON = `{
  "name": "John Doe", 
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Springfield", 
    "zipCode": "12345"
  },
  "hobbies": ["reading", "cycling", "cooking"],
  "isActive": true
}`;

async function testCodeGeneration() {
  console.log('Testing code generation...');
  
  try {
    // Test TypeScript generation
    const tsResult = await generateCode(testJSON, 'typescript', { typeName: 'Person' });
    console.log('TypeScript generation:', tsResult.success ? 'SUCCESS' : 'FAILED');
    if (tsResult.error) console.log('  Error:', tsResult.error);
    
    // Test Go generation
    const goResult = await generateCode(testJSON, 'go', { typeName: 'Person' });
    console.log('Go generation:', goResult.success ? 'SUCCESS' : 'FAILED');
    if (goResult.error) console.log('  Error:', goResult.error);
    
    // Test Java generation
    const javaResult = await generateCode(testJSON, 'java', { typeName: 'Person' });
    console.log('Java generation:', javaResult.success ? 'SUCCESS' : 'FAILED');
    if (javaResult.error) console.log('  Error:', javaResult.error);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCodeGeneration();