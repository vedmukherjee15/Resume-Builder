'use client';

import React, { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import ProgressBar from '@/components/ProgressBar';
import MasterProfile from '@/components/v2/MasterProfile';
import TemplateSelector from '@/components/v2/TemplateSelector';
import ResumeHistory from '@/components/v2/ResumeHistory';
import { validateJobDescription } from '@/lib/validation';
import { ResumeData, PersonalInfo } from '@/types/resume';
import { UserButton } from '@clerk/nextjs';
import styles from './page.module.css';

type ProcessingState = 'idle' | 'parsing' | 'optimizing' | 'generating' | 'complete';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [optimizedData, setOptimizedData] = useState<ResumeData | null>(null);
  
  // V2 States
  const [activeTab, setActiveTab] = useState<'build' | 'history' | 'profile'>('build');
  const [templateId, setTemplateId] = useState('faangpath');
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [masterProfile, setMasterProfile] = useState<PersonalInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('master_profile');
    if (saved) setMasterProfile(JSON.parse(saved));
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!file && !isCreateMode) {
      setError('Please upload your resume or enable Create Mode');
      return;
    }

    const jdValidation = validateJobDescription(jobDescription);
    if (!jdValidation.valid) {
      setError(jdValidation.error || 'Invalid job description');
      return;
    }

    setError(null);

    try {
      let resumeText = '';

      if (!isCreateMode && file) {
        // Step 1: Parse resume
        setState('parsing');
        const formData = new FormData();
        formData.append('file', file);

        const parseResponse = await fetch('/api/parse-resume', {
          method: 'POST',
          body: formData,
        });

        const parseResult = await parseResponse.json();
        if (!parseResult.success) {
          throw new Error(parseResult.error || 'Failed to parse resume');
        }
        resumeText = parseResult.text;
      } else {
        // Create Mode: Use Master Profile info as context
        resumeText = `NAME: ${masterProfile?.name || 'User'}
CONTACT: ${masterProfile?.email || ''} ${masterProfile?.phone || ''}
LOCATION: ${masterProfile?.location || ''}
OBJECTIVE: I want to build a new resume from scratch.`;
      }

      // Step 2: Optimize with AI
      setState('optimizing');
      const optimizeResponse = await fetch('/api/optimize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      if (!optimizeResponse.ok) {
        throw new Error(`Server error: ${optimizeResponse.status}. Please check if the system is online.`);
      }

      const optimizeResult = await optimizeResponse.json();
      if (!optimizeResult.success) {
        throw new Error(optimizeResult.error || 'Failed to optimize resume');
      }

      // Merge with Master Profile if available
      const finalData = { ...optimizeResult.data };
      if (masterProfile) {
        finalData.personalInfo = {
          ...finalData.personalInfo,
          ...masterProfile,
          // Keep name from master if AI messed up
          name: masterProfile.name || finalData.personalInfo.name
        };
      }

      setOptimizedData(finalData);
      
      // Save to history
      const historyItem = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        jobTitle: jobDescription.substring(0, 30) + '...',
        templateId,
        data: finalData
      };
      const oldHistory = JSON.parse(localStorage.getItem('resume_history') || '[]');
      localStorage.setItem('resume_history', JSON.stringify([historyItem, ...oldHistory]));

      setState('complete');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('idle');
    }
  };

  const handleDownload = async (dataOverride?: ResumeData, tIdOverride?: string) => {
    const data = dataOverride || optimizedData;
    const tId = tIdOverride || templateId;
    if (!data) return;

    try {
      setIsDownloading(true);

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeData: data,
          templateId: tId 
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate PDF');
        }
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      
      if (blob.type !== 'application/pdf') {
        console.error('Received blob type:', blob.type, 'Size:', blob.size);
        throw new Error(`Invalid file type received: ${blob.type}`);
      }
      
      // Get filename from header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      console.log('Downloading PDF with filename:', filename);
      
      // Try using msSaveOrOpenBlob for IE/Edge
      if (typeof (window.navigator as any).msSaveOrOpenBlob !== 'undefined') {
        (window.navigator as any).msSaveOrOpenBlob(blob, filename);
      } else {
        // Standard blob download
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        
        // Firefox requires the link to be in the body
        document.body.appendChild(link);
        
        // Trigger download
        link.dispatchEvent(
          new MouseEvent('click', { 
            bubbles: true, 
            cancelable: true, 
            view: window 
          })
        );
        
        // Cleanup
        document.body.removeChild(link);
        
        // Revoke the blob URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const isProcessing = state !== 'idle' && state !== 'complete';

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Hero Section */}
        <header className={styles.hero}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 'var(--spacing-md)' }}>
            <h1 className={styles.title} style={{ margin: 0 }}>
              MISSION<span>CONTROL</span>
            </h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <p className={styles.subtitle}>
            Execute your optimization protocol. Upload your profile or use the local master record 
            to engineer a targeted resume for theJD perimeter.
          </p>
        </header>

        {/* Navigation Tabs */}
        <nav className={styles.nav}>
          <button 
            className={`${styles.navBtn} ${activeTab === 'build' ? styles.navBtnActive : ''}`}
            onClick={() => setActiveTab('build')}
          >
            Mission Control
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'history' ? styles.navBtnActive : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'profile' ? styles.navBtnActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Agent Profile
          </button>
        </nav>

        {activeTab === 'profile' && (
          <MasterProfile onSave={(info) => setMasterProfile(info)} />
        )}

        {activeTab === 'history' && (
          <ResumeHistory 
            onLoad={(data) => {
              setOptimizedData(data);
              setState('complete');
              setActiveTab('build');
            }}
            onDownload={(data, tId) => handleDownload(data, tId)}
          />
        )}

        {/* Main Form */}
        {activeTab === 'build' && state !== 'complete' && (
          <div className={`${styles.card} glass-card fade-in`}>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
              <div className={styles.modeToggle}>
                <span>Mission Mode: {isCreateMode ? 'Infiltration' : 'Strategy'}</span>
                <button 
                  className={`${styles.toggle} ${isCreateMode ? styles.toggleOn : ''}`}
                  onClick={() => setIsCreateMode(!isCreateMode)}
                >
                  <div className={styles.toggleBall}></div>
                </button>
                <span>Create Mode</span>
              </div>
            </div>

            {!isCreateMode && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>1. Upload Your Resume</h2>
                <FileUpload onFileSelect={handleFileSelect} disabled={isProcessing} />
              </div>
            )}

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{isCreateMode ? '1. Describe the Role' : '2. Paste Job Description'}</h2>
              <textarea
                className="textarea"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isProcessing}
                rows={8}
              />
            </div>

            <TemplateSelector selectedId={templateId} onSelect={setTemplateId} />

            {error && (
              <div className={styles.error}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {isProcessing ? (
              <ProgressBar
                duration={state === 'parsing' ? 3000 : 15000}
                message={
                  state === 'parsing'
                    ? 'Decrypting resonance...'
                    : 'System synchronized... Optimizing mission profile'
                }
              />
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={(!file && !isCreateMode) || !jobDescription}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                {isCreateMode ? 'Build New Resume' : 'Generate Optimized Resume'}
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {activeTab === 'build' && state === 'complete' && optimizedData && (
          <div className={`${styles.card} glass-card fade-in`}>
            <div className={styles.success}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h2 className={styles.successTitle}>Resume Optimized!</h2>
              <p className={styles.successText}>
                Your resume has been optimized for the target role. Download your new resume below.
              </p>
            </div>

            <div className={styles.preview}>
              <h3 className={styles.previewTitle}>Preview</h3>
              <div className={styles.previewContent}>
                <p><strong>Name:</strong> {optimizedData.personalInfo.name}</p>
                <p><strong>Email:</strong> {optimizedData.personalInfo.email}</p>
                <p className={styles.mt}><strong>Summary:</strong></p>
                <p className={styles.summaryText}>{optimizedData.summary}</p>
                <p className={styles.mt}><strong>Skills:</strong></p>
                <div className={styles.skills}>
                  {optimizedData.skills.map((skill, idx) => (
                    <span key={idx} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className="btn btn-primary"
                onClick={() => handleDownload()}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <div className="spinner"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              <button
                className={styles.btnSecondary}
                onClick={() => {
                  setState('idle');
                  setOptimizedData(null);
                  setFile(null);
                  setJobDescription('');
                }}
              >
                Create Another Resume
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className={styles.footer}>
          <p>Powered by Advanced Resume Strategy • Built with Next.js</p>
        </footer>
      </div>
    </main>
  );
}
