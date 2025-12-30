'use client';

import Link from 'next/link';

import { Layout } from '@/components/Layout';

const uploadCards = [
  { title: 'Agreement A', detail: 'PDF, 42 pages', status: 'Ready', size: '3.2 MB' },
  { title: 'Agreement B', detail: 'PDF, 37 pages', status: 'Ready', size: '2.8 MB' },
  { title: 'Annex C', detail: 'PDF, 18 pages', status: 'Missing', size: '—' },
];

const navLinks = [
  { href: '/document-compare', label: 'Portal' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Document validator' },
  { href: '/document-compare/compare', label: 'Compare' },
  { href: '/document-compare/deep-dive', label: 'Deep dive' },
];

export default function DocumentUploadPage() {
  const handleViewerUpload = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    sessionStorage.setItem('uploadedPdfUrl', url);
    sessionStorage.setItem('uploadedPdfName', file.name);
  };

  const leftDrawerElement = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-2 text-volcanic-900">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">Upload</p>
        <h2 className="text-h5 font-variable text-volcanic-200">Comparison Set</h2>
        <p className="text-p-sm text-volcanic-300">Add PDFs to a named set before parsing and comparing.</p>
      </div>
      <div className="rounded-2xl border border-blue-500 bg-white p-4">
        <p className="text-label text-volcanic-300">Navigation</p>
        <div className="mt-3 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = link.href === '/document-compare/upload';
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
            <p className="text-label text-volcanic-300">Document manager</p>
            <h1 className="text-h3 font-variable text-volcanic-200">Upload and manage files</h1>
            <p className="text-p text-volcanic-300">Add PDFs to your workspace, then parse and compare.</p>
          </div>
        </header>

        <section className="grid gap-6">
          <div className="rounded-2xl border border-blue-500 bg-white p-6 shadow-sm">
            <p className="text-label text-volcanic-300">Document manager</p>
            <h2 className="text-h4 font-variable text-volcanic-200">Document manager</h2>
            <p className="mt-2 text-p text-volcanic-300">
              Drop PDFs into this batch and prepare them for parsing and comparison.
            </p>
            <div className="mt-5 space-y-4 rounded-xl border border-blue-400 bg-secondary-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label text-volcanic-600">Files in batch</p>
                  <p className="text-p text-volcanic-800">
                    {uploadCards.length} files listed • 2 ready, 1 missing
                  </p>
                </div>
                <span className="rounded-full bg-blue-500 px-3 py-1 text-label text-white">
                  {uploadCards.filter((c) => c.status === 'Ready').length} ready
                </span>
              </div>
              <div className="rounded-xl border border-dashed border-blue-400 bg-white p-4 text-center">
                <p className="text-p text-volcanic-800">Drop your PDF files here</p>
                <p className="text-p-xs text-volcanic-300">or</p>
                <label className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-full bg-blue-500 px-4 py-2 text-p-sm text-white">
                  Upload PDFs
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => handleViewerUpload(e.target.files?.[0] ?? undefined)}
                  />
                </label>
                <p className="mt-2 text-p-xs text-volcanic-400">
                  First file also loads into the viewer on the Validator page.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full border border-blue-400 px-4 py-2 text-p-sm text-blue-500">Connect your storage</button>
                <button className="rounded-full border border-blue-400 px-4 py-2 text-p-sm text-blue-500">Batch upload</button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-500 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label text-volcanic-300">File viewer</p>
              <h2 className="text-h4 font-variable text-volcanic-200">File viewer</h2>
              <p className="text-p-sm text-volcanic-400">Preview, rename, or delete items before parsing.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-blue-300 bg-secondary-50 px-3 py-2 text-label text-volcanic-700">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {uploadCards.length} files
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-blue-300 bg-secondary-50">
            <div className="grid grid-cols-[1.4fr_0.9fr_0.6fr_1fr] border-b border-blue-200 bg-white/70 px-4 py-2 text-label text-volcanic-700">
              <span>Name</span>
              <span>Status</span>
              <span>Size</span>
              <span className="text-right">Actions</span>
            </div>
            {uploadCards.map((card) => (
              <div
                key={card.title}
                className="grid grid-cols-[1.4fr_0.9fr_0.6fr_1fr] items-center gap-2 border-t border-blue-200 bg-white px-4 py-3 text-p-sm text-volcanic-800 transition hover:bg-secondary-100"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{card.title}</span>
                  <span className="text-p-xs text-volcanic-500">{card.detail}</span>
                </div>
                <span
                  className={`text-p-xs font-medium ${
                    card.status === 'Ready' ? 'text-blue-700' : 'text-volcanic-500'
                  }`}
                >
                  {card.status === 'Missing' ? 'Awaiting upload' : 'Ready'}
                </span>
                <span className="text-p-xs text-volcanic-600">{card.size}</span>
                <div className="flex justify-end gap-2">
                  <button className="rounded-lg border border-blue-400 px-3 py-1 text-label text-blue-500 transition hover:bg-blue-50">
                    View
                  </button>
                  <button className="rounded-lg border border-marble-400 px-3 py-1 text-label text-volcanic-700 transition hover:bg-secondary-50">
                    Rename
                  </button>
                  <button className="rounded-lg border border-red-300 px-3 py-1 text-label text-red-600 transition hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
