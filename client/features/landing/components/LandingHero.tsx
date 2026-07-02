import Link from 'next/link';
import landingStyles from '../styles/Landing.module.css';

export function LandingHero() {
  return (
    <div className={landingStyles.container}>
      <header className={landingStyles.header}>
        <div className={landingStyles.logo}>LiveChat</div>
        <div className={landingStyles.navLinks}>
          <Link href="/login" className={landingStyles.navLink}>Log In</Link>
          <Link href="/register" className={`${landingStyles.navLink} ${landingStyles.navLinkPrimary}`}>Sign Up</Link>
        </div>
      </header>
      <main className={landingStyles.hero}>
        <h1 className={landingStyles.heroTitle}>Connect Instantly with LiveChat</h1>
        <p className={landingStyles.heroSubtitle}>
          Join rooms, chat in real-time, and experience seamless communication with a beautiful glassmorphic interface.
        </p>
        <Link href="/register" className={landingStyles.ctaBtn}>Get Started for Free</Link>
      </main>
    </div>
  );
}
