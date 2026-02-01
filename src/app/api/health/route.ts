import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Anthropic API key is configured
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    
    // Check if Clerk keys are configured
    const hasClerkPublicKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const hasClerkSecretKey = !!process.env.CLERK_SECRET_KEY;

    const allConfigured = hasAnthropicKey && hasClerkPublicKey && hasClerkSecretKey;

    return NextResponse.json({
      status: allConfigured ? 'ok' : 'warning',
      services: {
        anthropic: hasAnthropicKey ? 'configured' : 'missing',
        clerk: (hasClerkPublicKey && hasClerkSecretKey) ? 'configured' : 'missing',
      },
      message: allConfigured 
        ? 'All services configured' 
        : 'Some environment variables are missing',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
