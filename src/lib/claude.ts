import Anthropic from '@anthropic-ai/sdk';
import { ResumeData } from '@/types/resume';
import { logError, logInfo } from './logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function optimizeWithClaude(resumeText: string, jobDescription: string): Promise<ResumeData> {
  const prompt = `You are an expert resume optimizer. Your task is to take the provided resume text and optimize it for the given job description.
  
  CRITICAL INSTRUCTIONS:
  1. DO NOT REMOVE any existing jobs, projects, or education history.
  2. Optimize the bullet points using action verbs and quantifiable metrics.
  3. Ensure the output is a VALID JSON object following the schema below.
  4. Ensure all special characters are escaped properly.
  
  JSON Schema:
  {
    "personalInfo": {
      "name": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "linkedin": "string (optional)",
      "github": "string (optional)",
      "portfolio": "string (optional)"
    },
    "summary": "Professional summary optimized for the JD",
    "skills": ["skill1", "skill2"],
    "experience": [
      {
        "company": "string",
        "title": "string",
        "location": "string",
        "duration": "string",
        "bullets": ["bullet1", "bullet2"]
      }
    ],
    "education": [
      {
        "institution": "string",
        "degree": "string",
        "location": "string",
        "year": "string",
        "gpa": "string (optional)"
      }
    ],
    "projects": [
      {
        "name": "string",
        "description": "string",
        "technologies": ["tech1", "tech2"]
      }
    ],
    "certifications": ["cert1", "cert2"]
  }

  Resume Text:
  ${resumeText}

  Job Description:
  ${jobDescription}

  Output ONLY the JSON object.`;

  try {
    logInfo('Claude Optimization Request', { model: 'claude-3-haiku-20240307', promptLength: prompt.length });
    
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
      system: 'You are a professional resume writer that outputs ONLY valid JSON.',
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    if (!content) throw new Error('Empty response from Claude');

    // Extract JSON if there is extra text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;

    return JSON.parse(jsonStr) as ResumeData;
  } catch (error) {
    logError('Claude Optimization Failure', error);
    console.error('Claude optimization error:', error);
    throw error;
  }
}
