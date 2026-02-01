import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/file-parser';
import { validateFile } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Parse resume
    const resumeText = await parseResume(file);

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Could not extract text from the resume. Please ensure the file is not corrupted.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: resumeText,
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to parse resume' 
      },
      { status: 500 }
    );
  }
}
