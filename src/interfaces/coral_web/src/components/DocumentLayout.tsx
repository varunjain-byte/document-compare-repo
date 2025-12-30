import Head from 'next/head';
import Link from 'next/link';
import { useMemo } from 'react';

import { cn } from '@/utils/cn';

type NavLink = { href: string; label: string };

const navLinks: NavLink[] = [
  { href: '/document-compare', label: 'Portal' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse' },
  { href: '/document-compare/structure', label: 'Structure' },
  { href: '/document-compare/compare', label: 'Compare' },
  { href: '/document-compare/deep-dive', label: 'Deep dive' },
];

type Props = {
  title: string;
  activePath: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export const DocumentLayout: React.FC<Props> = ({ title, activePath, sidebar, children }) => {
  const nav = useMemo(
    () =>
      navLinks.map((link) => ({
        ...link,
        active: activePath === link.href,
      })),
    [activePath]
  );

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex min-h-screen flex-col bg-secondary-100 p-4 lg:p-6">
        <header className="mb-4 flex items-center justify-between rounded-lg border border-marble-400 bg-white px-4 py-3 shadow-sm">
          <Link href="/document-compare" className="flex items-center gap-2">
            <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
            <span className="text-p font-medium text-volcanic-800">Document Workspace</span>
          </Link>
          <div className="flex flex-wrap gap-2">
            {nav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full border px-3 py-1 text-p-sm transition',
                  link.active
                    ? 'border-blue-200 bg-blue-700 text-white'
                    : 'border-marble-300 bg-secondary-50 text-blue-700 hover:border-blue-300'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="grid flex-1 gap-4 lg:grid-cols-[0.42fr_1.58fr]">
          <aside className="rounded-lg border border-marble-400 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-120px)] lg:overflow-y-auto">
            {sidebar}
          </aside>
          <section className="rounded-lg border border-marble-400 bg-white shadow-sm">
            {children}
          </section>
        </main>
      </div>
    </>
  );
};
