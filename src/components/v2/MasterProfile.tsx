'use client';

import React, { useState, useEffect } from 'react';
import { PersonalInfo } from '@/types/resume';
import styles from './MasterProfile.module.css';

interface MasterProfileProps {
  onSave: (info: PersonalInfo) => void;
}

export default function MasterProfile({ onSave }: MasterProfileProps) {
  const [profile, setProfile] = useState<PersonalInfo>({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('master_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('master_profile', JSON.stringify(profile));
    onSave(profile);
    alert('Profile saved successfully!');
  };

  return (
    <div className={`${styles.container} glass-card`}>
      <h2 className={styles.title}>Agent Profile</h2>
      <p className={styles.subtitle}>Your master contact information for all resumes.</p>
      
      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Full Name</label>
          <input className="input" name="name" value={profile.name} onChange={handleChange} placeholder="John Doe" />
        </div>
        <div className={styles.field}>
          <label>Email</label>
          <input className="input" name="email" value={profile.email} onChange={handleChange} placeholder="john@example.com" />
        </div>
        <div className={styles.field}>
          <label>Phone</label>
          <input className="input" name="phone" value={profile.phone} onChange={handleChange} placeholder="+1 234 567 890" />
        </div>
        <div className={styles.field}>
          <label>Location</label>
          <input className="input" name="location" value={profile.location} onChange={handleChange} placeholder="New York, NY" />
        </div>
        <div className={styles.field}>
          <label>LinkedIn (username)</label>
          <input className="input" name="linkedin" value={profile.linkedin} onChange={handleChange} placeholder="linkedin.com/in/johndoe" />
        </div>
        <div className={styles.field}>
          <label>GitHub (username)</label>
          <input className="input" name="github" value={profile.github} onChange={handleChange} placeholder="github.com/johndoe" />
        </div>
      </div>

      <button className="btn btn-primary mt-md" onClick={handleSave}>
        Save Master Profile
      </button>
    </div>
  );
}
