'use client';

import Link from 'next/link';

import { Layout } from '@/components/Layout';

const parsingStages = [
  { title: 'Ingestion', detail: 'PDF, scans, and images merged into a single batch.' },
  { title: 'OCR + Zoning', detail: 'Layout blocks, headings, and tables detected.' },
  { title: 'Extraction', detail: 'Tables and figures extracted with confidence scores.' },
  { title: 'Normalization', detail: 'Output structured into a reusable schema.' },
];

const navLinks = [
  { href: '/document-compare', label: 'Portal' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Structured Format' },
  { href: '/document-compare/compare', label: 'Compare' },
  { href: '/document-compare/deep-dive', label: 'Deep dive' },
];

export default function DocumentParsePage() {
  const leftDrawerElement = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-2 text-volcanic-900">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">Parse</p>
        <h2 className="text-h5 font-variable text-volcanic-900">PDF Intake</h2>
        <p className="text-p-sm text-volcanic-600">
          Upload documents and monitor the parsing pipeline in real time.
        </p>
      </div>
      <div className="rounded-2xl border border-marble-500 bg-white p-4">
        <p className="text-label text-volcanic-600">Navigation</p>
        <div className="mt-3 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = link.href === '/document-compare/parse';
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
            <p className="text-label text-volcanic-600">Pipeline</p>
            <h1 className="text-h3 font-variable text-volcanic-900">
              Parse and extract structure from PDFs
            </h1>
            <p className="text-p text-volcanic-700">
              Drag files in, then track OCR, zoning, and extraction status.
            </p>
          </div>
          <button className="rounded-full bg-blue-700 px-5 py-2 text-p text-white shadow-md transition hover:bg-blue-900">
            Add PDFs
          </button>
        </header>

        <section className="grid gap-4 lg:grid-cols-4">
          {parsingStages.map((stage, index) => (
            <div
              key={stage.title}
              className="rounded-2xl border border-marble-300 bg-white p-4 shadow-sm"
            >
              <p className="text-label text-blue-700">Step {index + 1}</p>
              <p className="mt-2 text-h5 font-variable text-volcanic-900">{stage.title}</p>
              <p className="mt-2 text-p-sm text-volcanic-700">{stage.detail}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-marble-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label text-volcanic-600">Live parsing</p>
                <h2 className="text-h4 font-variable text-volcanic-900">Active batch</h2>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-label text-blue-700">
                68% complete
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: 'OCR', value: '94%', bar: 'w-[94%]' },
                { label: 'Tables', value: '71%', bar: 'w-[71%]' },
                { label: 'Figures', value: '62%', bar: 'w-[62%]' },
                { label: 'Metadata', value: '88%', bar: 'w-[88%]' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-p-sm text-volcanic-600">
                    <span>{item.label}</span>
                    <span className="text-blue-700">{item.value}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary-100">
                    <div className={`h-full rounded-full bg-blue-700 ${item.bar}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-marble-300 bg-white p-6 shadow-sm">
            <p className="text-label text-volcanic-600">Extracted assets</p>
            <h2 className="text-h4 font-variable text-volcanic-900">Preview tiles</h2>
            <div className="mt-4 grid gap-3">
              {['Table A.1', 'Figure 3', 'Chart 5', 'Table B.2'].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl border border-marble-300 bg-secondary-50 px-4 py-3"
                >
                  <span className="text-p text-volcanic-800">{item}</span>
                  <span className="text-label text-blue-700">Detected</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
