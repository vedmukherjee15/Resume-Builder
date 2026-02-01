const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload a PDF or DOCX file.' };
  }

  return { valid: true };
}

export function validateJobDescription(jd: string): { valid: boolean; error?: string } {
  if (!jd || jd.trim().length === 0) {
    return { valid: false, error: 'Job description is required' };
  }

  if (jd.length < 50) {
    return { valid: false, error: 'Job description is too short. Please provide more details.' };
  }

  if (jd.length > 10000) {
    return { valid: false, error: 'Job description is too long. Please keep it under 10,000 characters.' };
  }

  return { valid: true };
}
