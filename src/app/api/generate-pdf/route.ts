import { NextRequest, NextResponse } from 'next/server';
import { generateLatexFromTemplate } from '@/lib/template-engine';
import { ResumeData } from '@/types/resume';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { logError, logInfo } from '@/lib/logger';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let tempDir: string | null = null;
  let errorOccurred = false;
  
  try {
    const { resumeData, templateId = 'professional' } = await request.json();

    logInfo('PDF Generation Request', { templateId, resumeName: resumeData.personalInfo.name });
    console.log(`Generating LaTeX from resume data using template: ${templateId}...`);
    
    // Generate LaTeX content
    const latexContent = generateLatexFromTemplate(resumeData, templateId);
    console.log('LaTeX content generated, length:', latexContent.length);
    logInfo('LaTeX Content Generated', { length: latexContent.length, preview: latexContent.substring(0, 500) });

    // Create temporary directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-'));
    const texFile = path.join(tempDir, 'resume.tex');
    const pdfFile = path.join(tempDir, 'resume.pdf');

    console.log('Writing LaTeX to temp file:', texFile);
    await fs.writeFile(texFile, latexContent, 'utf-8');

    // If using class-based templates, copy resume.cls to temp dir
    if (['faangpath', 'business_insider'].includes(templateId)) {
      const clsPath = path.join(process.cwd(), 'src', 'templates', 'resume.cls');
      const destClsPath = path.join(tempDir, 'resume.cls');
      await fs.copyFile(clsPath, destClsPath);
      console.log('Copied resume.cls to temp dir');
    }

    if (templateId === 'business_insider') {
      const altaClsPath = path.join(process.cwd(), 'src', 'templates', 'altacv.cls');
      const destAltaClsPath = path.join(tempDir, 'altacv.cls');
      await fs.copyFile(altaClsPath, destAltaClsPath);
      console.log('Copied altacv.cls to temp dir');
    }

    console.log('Compiling LaTeX to PDF...');
    
    // Run pdflatex directly with explicit PATH
    const pdflatexPath = '/Library/TeX/texbin/pdflatex';
    const command = `cd "${tempDir}" && "${pdflatexPath}" -interaction=nonstopmode -halt-on-error resume.tex`;
    
    console.log('Executing:', command);
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        env: {
          ...process.env,
          PATH: `/Library/TeX/texbin:${process.env.PATH}`,
        },
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
      
      console.log('pdflatex stdout:', stdout);
      if (stderr) {
        console.log('pdflatex stderr:', stderr);
      }
    } catch (execError: any) {
      console.error('pdflatex execution error:', execError.message);
      console.error('FULL stdout:', execError.stdout);
      console.error('FULL stderr:', execError.stderr);
      
      logError('pdflatex Execution Error', {
        message: execError.message,
        stdout: execError.stdout,
        stderr: execError.stderr
      });
      
      throw new Error('LaTeX compilation failed. Check logs for details.');
    }

    // Check if PDF was created
    try {
      await fs.access(pdfFile);
    } catch {
      console.error('PDF file was not created');
      logError('PDF Not Created', { tempDir, pdfFile });
      throw new Error('PDF file was not generated');
    }

    // Read the PDF file
    const pdfBuffer = await fs.readFile(pdfFile);
    console.log('PDF generated successfully, size:', pdfBuffer.length);
    logInfo('PDF Generated Successfully', { size: pdfBuffer.length });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf"`,
      },
    });
  } catch (error) {
    errorOccurred = true;
    logError('PDF Generation Failure', error);
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      },
      { status: 500 }
    );
  } finally {
    // Cleanup temp directory only if successful OR if you want to always cleanup
    // Set to true to always cleanup, or false to keep files on error
    const alwaysCleanup = false;
    
    if (tempDir && (alwaysCleanup || !errorOccurred)) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log('Cleaned up temp directory:', tempDir);
      } catch (cleanupError) {
        console.error('Error cleaning up temp directory:', cleanupError);
      }
    } else if (tempDir && errorOccurred) {
      console.log('Keeping temp directory for debugging:', tempDir);
    }
  }
}
