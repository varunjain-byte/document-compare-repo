'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { cn } from '@/utils/cn';

const quickLinks = [
  { title: 'Upload', description: 'Upload and manage your product related documents.', href: '/document-compare/upload', accent: 'bg-blue-500' },
  { title: 'Parse PDFs', description: 'Parse your documents into structured format. This utility extracts the document text, images, and tables. Maintains the hierarchy of information.', href: '/document-compare/parse', accent: 'bg-blue-400' },
  { title: 'Document validator', description: 'Validate the extraction data and assets against an annotated document. Mark and provide feedback. Download the assets after validation.', href: '/document-compare/structure', accent: 'bg-blue-300' },
  { title: 'Delta Compare', description: 'Compare the extracted document (multiple of them). Usually helps in tracking changes between the versions. Treat it as a "diff" for documents.', href: '/document-compare/compare', accent: 'bg-blue-200' },
  { title: 'Similarity Matcher', description: 'Check document extracts and their similarity across various documents.', href: '/document-compare/deep-dive', accent: 'bg-purple-300' },
];

const metrics = [
  { label: 'Active documents', value: '0', detail: 'Waiting for upload' },
  { label: 'Tables detected', value: '24', detail: '97% confidence' },
  { label: 'Images extracted', value: '28', detail: '5 flagged' },
];

const activity = [
  { title: 'Q4 Supplier Agreement', status: 'Awaiting upload', tone: 'text-volcanic-300' },
  { title: 'Compliance Addendum', status: 'Awaiting upload', tone: 'text-volcanic-300' },
  { title: 'Operations Report', status: 'Awaiting upload', tone: 'text-volcanic-300' },
];

// Mock metrics and quickLinks remain the same...

export default function DocumentComparePage() {
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [sharePointUrl, setSharePointUrl] = useState('');
  const [isSsoEnabled, setIsSsoEnabled] = useState(true);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharePointUrl) return;
    alert(`Connected to SharePoint at: ${sharePointUrl}\nSSO via Azure Entra ID: ${isSsoEnabled ? 'Enabled' : 'Disabled'}`);
    setIsStorageModalOpen(false);
    setSharePointUrl('');
  };

  const leftDrawer = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-3">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">ZF Document Lab</p>
        <h2 className="text-h5 font-variable text-volcanic-200">AI4Doc Portal</h2>
        <p className="text-p-sm text-volcanic-300">Parse PDFs, structure them, then compare content side by side.</p>
      </div>
    </aside>
  );

  const mainContent = (
    <div className="relative flex h-full flex-col overflow-y-auto bg-white text-volcanic-900">
      <div className="relative flex flex-col gap-8 p-6 lg:p-10">
        <header className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h1 className="text-h3 font-variable text-volcanic-900">Parse, structure, and compare PDFs.</h1>
            <p className="text-p-lg text-volcanic-300">Upload document sets, inspect structured output, then compare tables, images, and text.</p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-blue-500 px-5 py-2 text-p text-white shadow-md transition hover:bg-blue-400">Upload PDFs</button>
              <button
                onClick={() => setIsStorageModalOpen(true)}
                className="rounded-full border border-blue-300 bg-white px-5 py-2 text-p text-blue-500 transition hover:border-blue-400"
              >
                Connect your storage
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-blue-500 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-label text-volcanic-300">Pipeline status</p>
              <span className="rounded-full bg-blue-500 px-3 py-1 text-label text-white">Live</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Ingest', value: '3 PDFs', note: 'Uploaded today' },
                { title: 'Parse', value: '146 pages', note: 'OCR + layout' },
                { title: 'Structure', value: '82 sections', note: 'Tables indexed' },
                { title: 'Compare', value: '23 deltas', note: 'Ready to review' },
              ].map((card) => (
                <div key={card.title} className="rounded-xl border border-blue-400 bg-secondary-50 px-4 py-3 shadow-sm">
                  <p className="text-label text-volcanic-600">{card.title}</p>
                  <p className="text-h4 font-variable text-blue-900">{card.value}</p>
                  <p className="text-p-xs text-volcanic-600">{card.note}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-blue-500 bg-white p-6 shadow-md transition hover:shadow-lg hover:border-blue-400"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-h5 font-variable text-blue-500">{link.title}</h3>
                  <p className="mt-2 text-p-sm text-volcanic-300">{link.description}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg ${link.accent} opacity-80 group-hover:opacity-100 transition`} />
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-marble-400 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-label text-volcanic-600">Metrics</p>
              <h2 className="text-h4 font-variable text-volcanic-900">Document readiness</h2>
            </div>
            <Link href="/document-compare/parse" className="rounded-full bg-blue-700 px-4 py-2 text-p-sm text-white">
              View parsing
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {metrics.map((item) => (
              <div key={item.label} className="rounded-xl border border-marble-300 bg-secondary-50 p-4">
                <p className="text-label text-volcanic-600">{item.label}</p>
                <p className="text-h4 font-variable text-blue-900">{item.value}</p>
                <p className="text-p-xs text-volcanic-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Connect Storage Modal */}
      {isStorageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-volcanic-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-h5 font-variable text-volcanic-900">Connect Storage</h3>
              <button
                onClick={() => setIsStorageModalOpen(false)}
                className="rounded-full p-1 text-volcanic-400 hover:bg-marble-100 hover:text-volcanic-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label htmlFor="sharepoint-url" className="text-label text-volcanic-700 block mb-1">SharePoint Site URL</label>
                <input
                  id="sharepoint-url"
                  type="url"
                  required
                  placeholder="https://company.sharepoint.com/sites/TeamName"
                  value={sharePointUrl}
                  onChange={(e) => setSharePointUrl(e.target.value)}
                  className="w-full rounded-lg border border-marble-400 px-3 py-2 text-p-sm text-volcanic-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex h-5 items-center">
                  <input
                    id="sso-auth"
                    type="checkbox"
                    checked={isSsoEnabled}
                    onChange={(e) => setIsSsoEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="sso-auth" className="font-medium text-blue-900">Enable SSO Authentication</label>
                  <p className="text-blue-700 text-xs">Require Azure Entra ID login for access</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStorageModalOpen(false)}
                  className="flex-1 rounded-lg border border-marble-400 px-4 py-2 text-p-sm font-medium text-volcanic-600 hover:bg-marble-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-p-sm font-medium text-white hover:bg-blue-700"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return <Layout leftDrawerElement={leftDrawer} mainElement={mainContent} />;
}
