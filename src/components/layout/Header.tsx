'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';

const navLinks = [
  { href: '/', label: 'Dashboard', id: 'nav-dashboard' },
  { href: '/estimator', label: 'Estimator', id: 'nav-estimator' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-card-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group" id="logo-link">
              <Image
                src="/logo.png"
                alt="GOLD Eyes"
                width={44}
                height={44}
                className="rounded-xl shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 group-hover:scale-105 transition-all duration-300"
                priority
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-gold-gradient leading-tight">
                  GOLD Eyes
                </span>
                <span className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase leading-none">
                  Market Intelligence & Analytics
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" id="desktop-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  id={link.id}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'bg-gold-500/10 text-gold-500'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-10 h-10 rounded-xl bg-muted hover:bg-gold-500/10 flex items-center justify-center transition-colors"
                aria-label="Toggle menu"
                id="mobile-menu-toggle"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <div
        className={`nav-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Nav Drawer */}
      <div className={`nav-drawer ${mobileOpen ? 'active' : ''}`} id="mobile-nav">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="GOLD Eyes" width={28} height={28} className="rounded-md" />
            <span className="text-lg font-bold text-gold-gradient">GOLD Eyes</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                pathname === link.href
                  ? 'bg-gold-500/10 text-gold-500'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
