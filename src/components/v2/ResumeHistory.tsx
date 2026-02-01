'use client';

import React, { useState, useEffect } from 'react';
import { ResumeData } from '@/types/resume';
import styles from './ResumeHistory.module.css';

interface HistoryItem {
  id: string;
  date: string;
  jobTitle: string;
  templateId: string;
  data: ResumeData;
}

interface ResumeHistoryProps {
  onLoad: (data: ResumeData) => void;
  onDownload: (data: ResumeData, templateId: string) => void;
}

export default function ResumeHistory({ onLoad, onDownload }: ResumeHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('resume_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem('resume_history', JSON.stringify(updated));
    setHistory(updated);
  };

  if (history.length === 0) {
    return (
      <div className={`${styles.empty} glass-card`}>
        <p>No mission history found. Generate your first resume to see it here!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mission History</h2>
      <div className={styles.grid}>
        {history.map(item => (
          <div key={item.id} className={`${styles.card} glass-card fade-in`}>
            <div className={styles.header}>
              <span className={styles.date}>{new Date(item.date).toLocaleDateString()}</span>
              <span className={styles.template}>{item.templateId}</span>
            </div>
            <h3 className={styles.jobTitle}>{item.jobTitle || 'Optimized Resume'}</h3>
            <p className={styles.name}>{item.data.personalInfo.name}</p>
            
            <div className={styles.actions}>
              <button 
                className={`${styles.actionBtn} ${styles.download}`}
                onClick={() => onDownload(item.data, item.templateId)}
              >
                Download
              </button>
              <button 
                className={`${styles.actionBtn}`}
                onClick={() => onLoad(item.data)}
              >
                Refine
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.delete}`}
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
