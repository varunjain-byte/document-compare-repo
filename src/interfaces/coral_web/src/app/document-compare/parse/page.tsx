'use client';

import Link from 'next/link';

import { useState } from 'react';

import { Layout } from '@/components/Layout';
import { cn } from '@/utils/cn';

const parsingStages = [
  { title: 'Ingestion', detail: 'PDF, scans, and images merged into a single batch.' },
  { title: 'OCR + Zoning', detail: 'Layout blocks, headings, and tables detected.' },
  { title: 'Extraction', detail: 'Tables and figures extracted with confidence scores.' },
  { title: 'Normalization', detail: 'Output structured into a reusable schema.' },
];

const pdfFiles = [
  {
    name: 'Invoice_Q4.pdf',
    pages: 38,
    status: 'Parsing',
    progress: { ocr: 94, tables: 71, figures: 62, metadata: 88 },
    assets: ['Table A.1', 'Figure 3', 'Chart 5', 'Table B.2'],
  },
  {
    name: 'Supplier_Agreement.pdf',
    pages: 54,
    status: 'Queued',
    progress: { ocr: 24, tables: 12, figures: 8, metadata: 30 },
    assets: ['Table 2.1 Pricing', 'Figure 1 Workflow'],
  },
  {
    name: 'Annex_Compliance.pdf',
    pages: 22,
    status: 'Ready',
    progress: { ocr: 100, tables: 98, figures: 92, metadata: 100 },
    assets: ['Table C.4 Controls', 'Figure 6 Process', 'Chart 2 KPIs'],
  },
];

const navLinks = [
  { href: '/document-compare', label: 'Portal' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Document validator' },
  { href: '/document-compare/compare', label: 'Compare' },
  { href: '/document-compare/deep-dive', label: 'Deep dive' },
];

export default function DocumentParsePage() {
  const [selectedFile, setSelectedFile] = useState(pdfFiles[0]);
  const [selectedAsset, setSelectedAsset] = useState(pdfFiles[0].assets[0]);
  const [assetPage, setAssetPage] = useState(1);

  const progressItems = [
    { label: 'OCR', value: `${selectedFile.progress.ocr}%`, bar: `w-[${selectedFile.progress.ocr}%]` },
    { label: 'Tables', value: `${selectedFile.progress.tables}%`, bar: `w-[${selectedFile.progress.tables}%]` },
    { label: 'Figures', value: `${selectedFile.progress.figures}%`, bar: `w-[${selectedFile.progress.figures}%]` },
    { label: 'Metadata', value: `${selectedFile.progress.metadata}%`, bar: `w-[${selectedFile.progress.metadata}%]` },
  ];
  const metrics = [
    { label: 'Active documents', value: String(pdfFiles.length), detail: 'In this workspace' },
    { label: 'Extracted assets', value: String(selectedFile.assets.length), detail: 'Tables, figures, clauses' },
    { label: 'Tables detected', value: '24', detail: '97% confidence' },
    { label: 'Images extracted', value: '28', detail: '5 flagged' },
  ];

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(selectedFile.assets.length / pageSize));
  const currentPage = Math.min(assetPage, totalPages);
  const pagedAssets = selectedFile.assets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const leftDrawerElement = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-2 text-volcanic-900">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">Parse</p>
        <h2 className="text-h5 font-variable text-volcanic-200">PDF Intake</h2>
        <p className="text-p-sm text-volcanic-300">
          Upload documents and monitor the parsing pipeline in real time.
        </p>
      </div>
      <div className="rounded-2xl border border-blue-500 bg-white p-4">
        <p className="text-label text-volcanic-300">Navigation</p>
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
            <p className="text-label text-volcanic-300">Pipeline</p>
            <h1 className="text-h3 font-variable text-volcanic-200">
              Parse and extract structure from PDFs
            </h1>
            <p className="text-p text-volcanic-300">
              Drag files in, then track OCR, zoning, and extraction status.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-blue-500 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-label text-volcanic-300">Metrics</p>
            <span className="rounded-full bg-blue-500 px-3 py-1 text-label text-white">Live</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((item) => (
              <div key={item.label} className="rounded-xl border border-blue-400 bg-white px-4 py-3 shadow-sm">
                <p className="text-label text-blue-500">{item.label}</p>
                <p className="text-h4 font-variable text-blue-600">{item.value}</p>
                <p className="text-p-xs text-volcanic-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-blue-500 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label text-volcanic-300">Live parsing</p>
                <h2 className="text-h4 font-variable text-volcanic-200">{selectedFile.name}</h2>
                <p className="text-p-sm text-volcanic-400">{selectedFile.pages} pages • {selectedFile.status}</p>
              </div>
              <span className="rounded-full bg-blue-500 px-3 py-1 text-label text-white">
                {selectedFile.progress.ocr}%
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {progressItems.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-p-sm text-volcanic-300">
                    <span>{item.label}</span>
                    <span className="text-blue-500">{item.value}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
                    <div className={`h-full rounded-full bg-blue-500`} style={{ width: item.bar.replace('w-[', '').replace(']', '') }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-blue-500 bg-white p-6 shadow-sm">
            <p className="text-label text-volcanic-300">Select PDF to parse</p>
            <h2 className="text-h4 font-variable text-volcanic-200">Pick a file</h2>
            <div className="mt-4 space-y-3">
              {pdfFiles.map((file) => {
                const isActive = file.name === selectedFile.name;
                const actionLabel =
                  file.status === 'Parsing' ? 'Parsing' : file.status === 'Ready' ? 'Parsed' : 'Send to parse';
                const isDisabled = file.status === 'Parsing' || file.status === 'Ready';
                return (
                  <div
                    key={file.name}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition',
                      isActive ? 'border-blue-500 bg-secondary-50 shadow-sm' : 'border-blue-300 bg-white hover:border-blue-400'
                    )}
                  >
                    <button
                      onClick={() => setSelectedFile(file)}
                      className="flex flex-col text-left"
                    >
                      <p className="text-p text-volcanic-200">{file.name}</p>
                      <p className="text-p-xs text-volcanic-400">
                        {file.pages} pages • {file.status}
                      </p>
                    </button>
                    <button
                      disabled={isDisabled}
                      className={cn(
                        'rounded-full px-3 py-1 text-label transition',
                        isDisabled
                          ? 'border border-marble-300 bg-secondary-100 text-volcanic-500 cursor-not-allowed'
                          : 'border border-blue-400 bg-blue-500 text-white hover:bg-blue-600'
                      )}
                    >
                      {actionLabel}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-p text-white shadow-md transition hover:bg-blue-400">
                Add PDFs
                <input type="file" accept=".pdf" multiple className="hidden" />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-500 bg-white p-6 shadow-sm">
          <p className="text-label text-volcanic-300">Extracted assets</p>
          <h2 className="text-h4 font-variable text-volcanic-200">Preview tiles</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_1.1fr]">
            <div className="space-y-3">
              {pagedAssets.map((item) => {
                const isActive = item === selectedAsset;
                return (
                  <button
                    key={item}
                    onClick={() => setSelectedAsset(item)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition',
                      isActive ? 'border-blue-500 bg-secondary-50 shadow-sm' : 'border-blue-300 bg-white hover:border-blue-400'
                    )}
                  >
                    <span className="text-p text-volcanic-200">{item}</span>
                    <span className="text-label text-blue-500">Detected</span>
                  </button>
                );
              })}
              <div className="flex items-center justify-between pt-2 text-label text-volcanic-600">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setAssetPage((p) => Math.max(1, p - 1))}
                  className={cn(
                    'rounded-full border px-3 py-1',
                    currentPage === 1 ? 'border-marble-300 text-volcanic-400' : 'border-blue-400 text-blue-600 hover:bg-blue-50'
                  )}
                >
                  Prev
                </button>
                <span>
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setAssetPage((p) => Math.min(totalPages, p + 1))}
                  className={cn(
                    'rounded-full border px-3 py-1',
                    currentPage === totalPages ? 'border-marble-300 text-volcanic-400' : 'border-blue-400 text-blue-600 hover:bg-blue-50'
                  )}
                >
                  Next
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-400 bg-white p-4 shadow-sm">
              <p className="text-label text-volcanic-300">Asset viewer</p>
              <h3 className="text-h5 font-variable text-volcanic-200">{selectedAsset}</h3>
              <div className="mt-3 h-52 rounded-xl border border-dashed border-blue-300 bg-gradient-to-br from-blue-50 via-secondary-50 to-white" />
              <p className="mt-2 text-p-xs text-volcanic-500">
                Static preview placeholder. Render the table/figure once extraction is wired.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
