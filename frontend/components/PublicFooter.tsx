'use client';

import Link from 'next/link';
import { Dumbbell, Github, Twitter, Instagram, Mail } from 'lucide-react';

export function PublicFooter() {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Roadmap', href: '#roadmap' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Blog', href: '#blog' },
        { label: 'Careers', href: '#careers' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#docs' },
        { label: 'Guides', href: '#guides' },
        { label: 'API Reference', href: '#api' },
        { label: 'Community', href: '#community' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Cookie Policy', href: '#cookies' },
        { label: 'License', href: '#license' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Github, href: '#', label: 'Github' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="bg-black/40 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 group-hover:scale-110 transition-transform">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">GYM</h2>
                <p className="text-[9px] text-white/60 font-bold uppercase tracking-wider -mt-1">Training App</p>
              </div>
            </Link>
            <p className="text-white/60 text-sm mb-4 max-w-xs">
              Transform your fitness journey with our modern training platform. Track workouts, monitor progress, and achieve your goals.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-black text-sm uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} GYM Training App. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
              Status
            </a>
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
              Security
            </a>
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
