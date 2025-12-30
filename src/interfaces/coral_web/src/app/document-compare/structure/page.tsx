'use client';

import Link from 'next/link';

import { Layout } from '@/components/Layout';

const navLinks = [
  { href: '/document-compare', label: 'Portal' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Structured Format' },
  { href: '/document-compare/compare', label: 'Compare' },
  { href: '/document-compare/deep-dive', label: 'Deep dive' },
];

export default function DocumentStructurePage() {
  const leftDrawerElement = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-2 text-volcanic-900">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">Structure</p>
        <h2 className="text-h5 font-variable text-volcanic-900">Normalized Output</h2>
        <p className="text-p-sm text-volcanic-600">
          See headings, tables, and images mapped into a clean schema.
        </p>
      </div>
      <div className="rounded-2xl border border-marble-500 bg-white p-4">
        <p className="text-label text-volcanic-600">Navigation</p>
        <div className="mt-3 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = link.href === '/document-compare/structure';
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg border px-3 py-2 text-p-sm ${
                  isActive
                    ? 'border-blue-400 bg-secondary-50 text-volcanic-900'
                    : 'border-marble-500 bg-white text-blue-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );

  const mainElement = (
    <div className="relative flex h-full flex-col overflow-y-auto bg-white text-volcanic-900">
      <div className="relative flex flex-col gap-8 p-6 lg:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-label text-volcanic-600">Structured format</p>
            <h1 className="text-h3 font-variable text-volcanic-900">
              Document tree with normalized sections and table schema
            </h1>
          </div>
          <button className="rounded-full bg-blue-700 px-5 py-2 text-p text-white shadow-md transition hover:bg-blue-900">
            Export JSON
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-marble-400 bg-white p-6 shadow-sm">
            <p className="text-label text-volcanic-600">Outline</p>
            <h2 className="text-h4 font-variable text-volcanic-900">Document tree</h2>
            <div className="mt-4 space-y-3 rounded-xl bg-secondary-50 p-4 text-code-sm text-volcanic-700">
              <div>1. Executive Summary</div>
              <div className="pl-4">1.1 Overview</div>
              <div className="pl-4">1.2 Key metrics</div>
              <div className="pl-8">Table: Revenue by region</div>
              <div className="pl-4">1.3 Risk profile</div>
              <div>2. Commercial Terms</div>
              <div className="pl-4">2.1 Payment schedule</div>
              <div className="pl-4">2.2 Termination</div>
              <div className="pl-8">Figure: Exit flowchart</div>
            </div>
          </div>
          <div className="rounded-2xl border border-marble-400 bg-white p-6 shadow-sm">
            <p className="text-label text-volcanic-600">Schema</p>
            <h2 className="text-h4 font-variable text-volcanic-900">Table normalization</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Table A', value: 'Revenue by region', status: 'Aligned' },
                { label: 'Table B', value: 'Margin forecast', status: 'Aligned' },
                { label: 'Table C', value: 'Staffing levels', status: 'Review' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-marble-300 bg-secondary-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-p text-volcanic-800">{item.label}</p>
                      <p className="text-p-sm text-volcanic-600">{item.value}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-label text-blue-700">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-marble-400 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label text-volcanic-600">Metadata</p>
              <h2 className="text-h4 font-variable text-volcanic-900">Key fields</h2>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-label text-blue-700">42 extracted</span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {[
              { title: 'Supplier', value: 'ZF Components GmbH' },
              { title: 'Effective date', value: '2024-02-14' },
              { title: 'Term length', value: '36 months' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-marble-300 bg-secondary-50 px-4 py-3">
                <p className="text-label text-volcanic-600">{item.title}</p>
                <p className="text-p text-volcanic-800">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
