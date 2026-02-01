import { NextRequest, NextResponse } from 'next/server';
import { createOptimizationPrompt, validateResumeData } from '@/lib/prompts';
import { OptimizeResumeRequest, OptimizeResumeResponse } from '@/types/resume';

export async function POST(request: NextRequest) {
  try {
    const body: OptimizeResumeRequest = await request.json();
    const { resumeText, jobDescription } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { success: false, error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    console.log('Creating optimization prompt...');
    
    // Create the optimization prompt
    const prompt = createOptimizationPrompt(resumeText, jobDescription);

    console.log('Calling Claude API (Anthropic)...');
    const { optimizeWithClaude } = await import('@/lib/claude');
    const resumeData = await optimizeWithClaude(resumeText, jobDescription);

    console.log('Validating resume data...');
    
    // Validate the resume data
    if (!validateResumeData(resumeData)) {
      console.error('Invalid resume data structure:', resumeData);
      return NextResponse.json(
        { success: false, error: 'AI returned invalid resume data structure. Please try again.' },
        { status: 500 }
      );
    }

    console.log('Resume optimization successful!');

    const responseData: OptimizeResumeResponse = {
      success: true,
      data: resumeData,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const { logError } = await import('@/lib/logger');
    logError('API Route Optimization Failure', error);
    console.error('Error optimizing resume:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}
