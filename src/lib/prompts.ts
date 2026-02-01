import { ResumeData } from '@/types/resume';

export const RESUME_OPTIMIZATION_PROMPT = `You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist. Your task is to analyze a candidate's existing resume and a job description, then create an optimized version of the resume tailored to that specific job.

**CRITICAL: PRESERVE ALL ORIGINAL INFORMATION**
- DO NOT remove any experience, projects, education, or skills from the original resume
- DO NOT shorten the resume or remove bullet points
- KEEP all companies, job titles, dates, and achievements exactly as they appear
- Your job is to ENHANCE and OPTIMIZE, not to remove or simplify

**Instructions:**
1. Extract ALL information from the existing resume (every job, project, skill, education, certification)
2. Analyze the job description for key requirements, skills, and keywords
3. Optimize the resume by:
   - Writing a NEW professional summary tailored to match the job requirements
   - REORDERING skills to put job-relevant ones first (but keep ALL skills)
   - ENHANCING experience bullets by:
     * Adding relevant keywords from the job description naturally
     * Emphasizing achievements that match the target role
     * Quantifying results where possible
     * Using stronger action verbs
   - KEEPING all original experience entries, projects, and education
   - Ensuring ATS-friendly formatting

4. Return the optimized resume data in the following JSON structure:

{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "portfolio": "portfolio-url.com"
  },
  "summary": "A compelling 2-3 sentence professional summary tailored to the job",
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "duration": "Month Year - Month Year",
      "bullets": [
        "Achievement-focused bullet point with quantifiable results",
        "Another impactful achievement"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "location": "City, State",
      "year": "Graduation Year",
      "gpa": "3.8/4.0"
    }
  ],
  "certifications": ["Certification 1", "Certification 2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description of the project",
      "technologies": ["Tech 1", "Tech 2"]
    }
  ]
}

**Important:**
- Include EVERY job from the original resume
- Include EVERY project from the original resume
- Include ALL skills (just reorder them)
- Include ALL education entries
- Include ALL certifications
- Maintain factual accuracy - do not fabricate experience or skills
- Use action verbs and quantifiable metrics
- Keep bullets concise and impactful
- Ensure all JSON is valid and properly formatted`;

export function createOptimizationPrompt(resumeText: string, jobDescription: string): string {
  return `${RESUME_OPTIMIZATION_PROMPT}

---

**EXISTING RESUME:**
${resumeText}

---

**TARGET JOB DESCRIPTION:**
${jobDescription}

---

Please analyze the above resume and job description, then return the optimized resume data in the specified JSON format.`;
}

export function validateResumeData(data: any): data is ResumeData {
  return (
    data &&
    typeof data === 'object' &&
    data.personalInfo &&
    typeof data.personalInfo.name === 'string' &&
    typeof data.personalInfo.email === 'string' &&
    typeof data.summary === 'string' &&
    Array.isArray(data.skills) &&
    Array.isArray(data.experience) &&
    Array.isArray(data.education)
  );
}
