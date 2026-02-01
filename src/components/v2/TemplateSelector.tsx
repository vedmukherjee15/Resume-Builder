'use client';

import React from 'react';
import styles from './TemplateSelector.module.css';

interface Template {
  id: string;
  name: string;
  description: string;
}

const templates: Template[] = [
  { id: 'faangpath', name: 'Faangpath Style', description: 'Optimized for Big Tech applications with a sharp header.' },
  { id: 'business_insider', name: 'Business Insider', description: 'Modern layout preferred by top management firms.' },
];

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function TemplateSelector({ selectedId, onSelect }: TemplateSelectorProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select Template</h2>
      <div className={styles.grid}>
        {templates.map(t => (
          <div 
            key={t.id} 
            className={`${styles.card} glass-card ${selectedId === t.id ? styles.active : ''}`}
            onClick={() => onSelect(t.id)}
          >
            <div className={styles.preview}>
               {/* Just a placeholder for actual preview images */}
               <div className={styles.dummyPreview}>
                  {[1,2,3,4].map(i => <div key={i} className={styles.line}></div>)}
               </div>
            </div>
            <h3 className={styles.name}>{t.name}</h3>
            <p className={styles.description}>{t.description}</p>
            {selectedId === t.id && <div className={styles.badge}>SELECTED</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
