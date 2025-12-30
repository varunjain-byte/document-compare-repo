'use client';

import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { cn } from '@/utils/cn';

const quickLinks = [
  { title: 'Upload', description: 'Create a comparison set and upload the PDFs.', href: '/document-compare/upload', accent: 'bg-blue-300' },
  { title: 'Parse PDFs', description: 'Upload and segment documents into zones, tables, and figures.', href: '/document-compare/parse', accent: 'bg-blue-500' },
  { title: 'Structured Format', description: 'View the normalized outline, clauses, and table schema.', href: '/document-compare/structure', accent: 'bg-blue-700' },
  { title: 'Compare', description: 'Align tables, images, and text across two or more PDFs.', href: '/document-compare/compare', accent: 'bg-blue-900' },
];

const metrics = [
  { label: 'Active documents', value: '0', detail: 'Waiting for upload' },
  { label: 'Tables detected', value: '24', detail: '97% confidence' },
  { label: 'Images extracted', value: '28', detail: '5 flagged' },
  { label: 'Match score', value: '87%', detail: 'Across all pages' },
];

const activity = [
  { title: 'Q4 Supplier Agreement', status: 'Awaiting upload', tone: 'text-volcanic-600' },
  { title: 'Compliance Addendum', status: 'Awaiting upload', tone: 'text-volcanic-600' },
  { title: 'Operations Report', status: 'Awaiting upload', tone: 'text-volcanic-600' },
];

export default function DocumentComparePage() {
  const leftDrawer = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-3">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">ZF Document Lab</p>
        <h2 className="text-h5 font-variable text-volcanic-900">Document Intelligence Portal</h2>
        <p className="text-p-sm text-volcanic-600">Parse PDFs, structure them, then compare content side by side.</p>
      </div>
      <div className="rounded-2xl border border-marble-400 bg-white p-4">
        <p className="text-label text-volcanic-600">Workspace</p>
        <div className="mt-3 space-y-2">
          {[
            { name: 'ZF Procurement', status: 'Active', statusTone: 'text-blue-700' },
            { name: 'R&D Compliance', status: 'Review', statusTone: 'text-volcanic-600' },
            { name: 'Legal Ops', status: 'Paused', statusTone: 'text-volcanic-600' },
          ].map((ws) => (
            <div key={ws.name} className="flex items-center justify-between rounded-lg bg-secondary-50 px-3 py-2">
              <span className="text-p-sm text-volcanic-800">{ws.name}</span>
              <span className={cn('text-label', ws.statusTone)}>{ws.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-marble-400 bg-white p-4">
        <p className="text-label text-volcanic-600">Recent activity</p>
        <div className="mt-3 space-y-2 text-p-sm">
          {activity.map((item) => (
            <div key={item.title} className="flex items-center justify-between">
              <span className="text-volcanic-800">{item.title}</span>
              <span className={cn('text-label font-medium', item.tone)}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );

  const mainContent = (
    <div className="relative flex h-full flex-col overflow-y-auto bg-white text-volcanic-900">
      <div className="relative flex flex-col gap-8 p-6 lg:p-10">
        <header className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-700 px-3 py-1 text-label text-white">ZF Theme</span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-label text-blue-700">AI Document Tool</span>
            </div>
            <h1 className="text-h3 font-variable text-volcanic-900">Parse, structure, and compare PDFs.</h1>
            <p className="text-p-lg text-volcanic-700">Upload document sets, inspect structured output, then compare tables, images, and text.</p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-blue-700 px-5 py-2 text-p text-white shadow-md transition hover:bg-blue-900">Upload PDFs</button>
              <button className="rounded-full border border-blue-200 bg-white px-5 py-2 text-p text-blue-700 transition hover:border-blue-500">Connect SharePoint</button>
            </div>
          </div>
          <div className="rounded-2xl border border-marble-400 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-label text-volcanic-600">Metrics</p>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-label text-blue-700">Live</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {metrics.map((item) => (
                <div key={item.label} className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-label text-blue-700">{item.label}</p>
                  <p className="text-h4 font-variable text-blue-900">{item.value}</p>
                  <p className="text-p-xs text-volcanic-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <Link key={item.title} href={item.href} className="group rounded-2xl border border-marble-400 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300">
              <div className="flex items-center justify-between">
                <span className="text-h5 font-variable text-volcanic-900">{item.title}</span>
                <span className={cn('h-10 w-10 rounded-full text-white shadow-sm transition flex items-center justify-center', item.accent)}>→</span>
              </div>
              <p className="mt-3 text-p text-volcanic-700">{item.description}</p>
              <p className="mt-4 text-p-sm font-medium text-blue-700">Open module</p>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-marble-400 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-label text-volcanic-600">Pipeline status</p>
              <h2 className="text-h4 font-variable text-volcanic-900">Document comparison pipeline</h2>
            </div>
            <Link href="/document-compare/compare" className="rounded-full bg-blue-700 px-4 py-2 text-p-sm text-white">Go to comparison</Link>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-4">
            {[
              { title: 'Ingest', value: '3 PDFs', note: 'Uploaded today' },
              { title: 'Parse', value: '146 pages', note: 'OCR + layout' },
              { title: 'Structure', value: '82 sections', note: 'Tables indexed' },
              { title: 'Compare', value: '23 deltas', note: 'Ready to review' },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border border-marble-300 bg-secondary-50 p-4">
                <p className="text-label text-volcanic-600">{card.title}</p>
                <p className="text-h4 font-variable text-blue-900">{card.value}</p>
                <p className="text-p-xs text-volcanic-600">{card.note}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  return <Layout leftDrawerElement={leftDrawer} mainElement={mainContent} />;
}
