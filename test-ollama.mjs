// Test script to verify Ollama integration
import { generateWithOllama } from './src/lib/ollama';

const testPrompt = `You are a helpful assistant. Return the following JSON:
{
  "test": "success",
  "message": "Ollama is working correctly"
}`;

async function test() {
  try {
    console.log('Testing Ollama connection...');
    const result = await generateWithOllama(testPrompt);
    console.log('Success! Response:', result);
    const parsed = JSON.parse(result);
    console.log('Parsed JSON:', parsed);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
