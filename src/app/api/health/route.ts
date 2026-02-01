import { NextResponse } from 'next/server';
import { MODEL_NAME } from '@/lib/ollama';

export async function GET() {
  try {
    // Check if Ollama is accessible
    const response = await fetch('http://localhost:11434/api/tags');
    
    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: 'Ollama is not responding',
        ollamaRunning: false,
      }, { status: 500 });
    }

    const data = await response.json();
    const models = data.models || [];
    const hasModel = models.some((m: any) => m.name === MODEL_NAME);

    return NextResponse.json({
      status: 'ok',
      ollamaRunning: true,
      modelConfigured: MODEL_NAME,
      modelAvailable: hasModel,
      availableModels: models.map((m: any) => m.name),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      ollamaRunning: false,
    }, { status: 500 });
  }
}
