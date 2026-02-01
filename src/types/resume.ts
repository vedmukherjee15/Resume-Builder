export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  duration: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
  year: string;
  gpa?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications?: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

export interface OptimizeResumeRequest {
  resumeText: string;
  jobDescription: string;
}

export interface OptimizeResumeResponse {
  success: boolean;
  data?: ResumeData;
  error?: string;
}
