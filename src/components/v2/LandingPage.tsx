'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, ArrowRight } from 'lucide-react';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const { isSignedIn } = useUser();

  return (
    <div className={styles.landing}>
      {/* Background elements */}
      <div className={styles.gridBackground} />
      <div className={styles.redGlow} />

      <header className={styles.header}>
        <div className={styles.logo}>
          RESUME<span>PROTOCOL</span>
        </div>
        <nav className={styles.nav}>
          {isSignedIn ? (
            <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className={styles.navLink}>Login</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className={styles.ctaSmall}>Deploy Strategy</button>
              </SignUpButton>
            </>
          )}
        </nav>
      </header>

      <main className={styles.hero}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.heroContent}
        >
          <div className={styles.badge}>Neural Optimization Active</div>
          <h1 className={styles.title}>
            Don't Just Build.<br />
            <span>Optimize for Infiltration.</span>
          </h1>
          <p className={styles.subtitle}>
            Your resume isn't a document. It's a strategy. We reverse-engineer job descriptions 
            to ensure your profile passes every ATS perimeter and lands on the hiring manager's desk.
          </p>
          
          <div className={styles.heroActions}>
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
              <button className={styles.ctaMain}>
                Begin Mission <ArrowRight size={20} />
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className={styles.heroVisual}
        >
          <div className={styles.resumeCard}>
            <div className={styles.scannerLine} />
            <div className={styles.resumePlaceholder}>
              <div className={styles.lineLong} />
              <div className={styles.lineMed} />
              <div className={styles.lineLong} />
              <div className={styles.lineShort} />
            </div>
            <div className={styles.optimizationStats}>
              <div className={styles.stat}>
                <span>RESONANCE</span>
                <div className={styles.progressBar}><div style={{ width: '94%' }} /></div>
              </div>
              <div className={styles.stat}>
                <span>IMPACT</span>
                <div className={styles.progressBar}><div style={{ width: '88%' }} /></div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <section className={styles.features}>
        <div className={styles.feature}>
          <Target className={styles.featureIcon} />
          <h3>Strategic Mapping</h3>
          <p>We align your core competencies with JD specifics using advanced semantic overlap.</p>
        </div>
        <div className={styles.feature}>
          <Zap className={styles.featureIcon} />
          <h3>Neural Extraction</h3>
          <p>Powered by Claude 3.5 Sonnet for precise phrasing and high-impact action verbs.</p>
        </div>
        <div className={styles.feature}>
          <Shield className={styles.featureIcon} />
          <h3>ATS Countermeasures</h3>
          <p>Engineered to bypass screening algorithms and maximize human visibility.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
