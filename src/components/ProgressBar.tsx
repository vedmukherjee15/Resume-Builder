'use client';

import React, { useEffect, useState } from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  duration?: number; // Duration in milliseconds
  message?: string;
}

export default function ProgressBar({ duration = 15000, message = 'Processing...' }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 95); // Cap at 95% until complete
      setProgress(newProgress);

      if (newProgress >= 95) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div className={styles.container}>
      <div className={styles.messageContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.message}>{message}</p>
      </div>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progress}%` }}
        >
          <div className={styles.progressGlow}></div>
        </div>
      </div>
      <p className={styles.percentage}>{Math.round(progress)}%</p>
    </div>
  );
}
