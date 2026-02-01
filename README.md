# AI Resume Builder

An intelligent resume optimization tool powered by Google Gemini AI. Upload your existing resume, provide a job description, and receive an ATS-optimized PDF tailored to your target role.

## Features

- 📄 **Resume Upload**: Support for PDF and DOCX formats
- 🤖 **AI-Powered Optimization**: Uses Ollama (local LLM) - no API key needed!
- 🎯 **ATS-Friendly**: Generates resumes optimized for Applicant Tracking Systems
- 📥 **PDF Generation**: Professional LaTeX-based PDF output
- ✨ **Modern UI**: Beautiful glassmorphism design with smooth animations
- 🚀 **Fast Processing**: Efficient token usage with structured JSON extraction
- 🔒 **Privacy**: All AI processing happens locally on your machine

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Vanilla CSS with modern design patterns
- **AI**: Ollama with Llama 3 (runs locally - completely free!)
- **Document Parsing**: pdf-parse, mammoth
- **PDF Generation**: LaTeX templates + node-latex

## Getting Started

### Prerequisites

- Node.js 18+ installed
- **Ollama installed** ([Download here](https://ollama.ai))
- LaTeX distribution installed (for PDF generation):
  - **macOS**: `brew install --cask mactex-no-gui`
  - **Linux**: `sudo apt-get install texlive-latex-base texlive-latex-extra`
  - **Windows**: Install [MiKTeX](https://miktex.org/download)

### Installation

1. Clone the repository:

```bash
cd /Users/vedaantmukherjee/Desktop/AI_Resume_Builder
```

2. Install dependencies:

```bash
npm install
```

3. Install and start Ollama:

```bash
# Install Ollama from https://ollama.ai
# Then pull the Llama 3 model
ollama pull llama3:latest
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Resume**: Drag and drop or click to upload your existing resume (PDF or DOCX)
2. **Paste Job Description**: Copy and paste the job description you're targeting
3. **Generate**: Click "Generate Optimized Resume" and wait for AI processing
4. **Download**: Review the optimized resume and download the PDF

## How It Works

1. **Resume Parsing**: Extracts text from uploaded PDF/DOCX files
2. **AI Optimization**: Ollama (running locally) analyzes your resume and the job description, then outputs structured JSON with:
   - Tailored professional summary
   - Optimized skills matching the JD
   - Rewritten experience bullets with relevant keywords
   - Proper formatting for ATS systems
3. **Template Injection**: JSON data is injected into a pre-validated LaTeX template
4. **PDF Generation**: LaTeX compiles to a professional PDF resume

## Project Structure

```
AI_Resume_Builder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── parse-resume/     # Resume file parsing endpoint
│   │   │   ├── optimize-resume/  # AI optimization endpoint
│   │   │   └── generate-pdf/     # PDF generation endpoint
│   │   ├── globals.css           # Design system
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main page
│   ├── components/
│   │   ├── FileUpload.tsx        # Drag-and-drop upload
│   │   └── LoadingSpinner.tsx    # Loading indicator
│   ├── lib/
│   │   ├── gemini.ts             # Gemini API client
│   │   ├── prompts.ts            # AI prompt engineering
│   │   ├── file-parser.ts        # PDF/DOCX parsing
│   │   ├── template-engine.ts    # LaTeX template injection
│   │   └── validation.ts         # Input validation
│   ├── templates/
│   │   └── professional.tex      # LaTeX resume template
│   └── types/
│       └── resume.ts             # TypeScript interfaces
├── package.json
├── tsconfig.json
└── next.config.js
```

## API Endpoints

### POST `/api/parse-resume`

Parses uploaded resume file and extracts text.

**Request**: `multipart/form-data` with `file` field

**Response**:

```json
{
  "success": true,
  "text": "extracted resume text..."
}
```

### POST `/api/optimize-resume`

Optimizes resume using AI based on job description.

**Request**:

```json
{
  "resumeText": "...",
  "jobDescription": "..."
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "personalInfo": {...},
    "summary": "...",
    "skills": [...],
    "experience": [...],
    "education": [...]
  }
}
```

### POST `/api/generate-pdf`

Generates PDF from optimized resume data.

**Request**: Resume data JSON

**Response**: PDF file (application/pdf)

## Why Ollama?

This application uses Ollama for several key advantages:

- ✅ **Completely Free**: No API costs, no rate limits
- ✅ **Privacy**: All data stays on your machine
- ✅ **No Internet Required**: Works offline once model is downloaded
- ✅ **Fast**: Local processing with no network latency
- ✅ **Reliable**: Pre-validated LaTeX templates (no regeneration needed)
- ✅ **Structured Output**: JSON mode for consistent results

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
