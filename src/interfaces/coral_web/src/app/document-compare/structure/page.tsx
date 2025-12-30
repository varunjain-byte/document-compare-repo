'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Layout } from '@/components/Layout';
import { cn } from '@/utils/cn';

const navLinks = [
  { href: '/document-compare', label: 'Portal' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Document validator' },
  { href: '/document-compare/compare', label: 'Compare' },
  { href: '/document-compare/deep-dive', label: 'Deep dive' },
];

export default function DocumentStructurePage() {
  const [viewerMode, setViewerMode] = useState<'structured' | 'rendered'>('structured');
  const [activeIssue, setActiveIssue] = useState('ISS-102');
  const [selectedDoc, setSelectedDoc] = useState('Invoice_Q4.pdf');
  const [pdfPage, setPdfPage] = useState(1);
  const [promptText, setPromptText] = useState(
    'Generate DOORS-ready requirements with clear IDs, acceptance criteria, and trace to source sections.'
  );
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const issues = [
    { id: 'ISS-102', title: 'Table A header misaligned', severity: 'Warning', location: 'Section 2.1', action: 'Fix header mapping' },
    { id: 'ISS-088', title: 'Figure 3 alt text missing', severity: 'Minor', location: 'Section 2.2', action: 'Add alt text' },
    { id: 'ISS-051', title: 'Clause 2.3 numbering off', severity: 'Major', location: 'Section 2.3', action: 'Normalize numbering' },
  ];

  const tables = [
    { label: 'Table A', name: 'Revenue by region', status: 'Aligned', columns: ['Region', 'FY23', 'FY24', 'Delta'] },
    { label: 'Table B', name: 'Margin forecast', status: 'Aligned', columns: ['Quarter', 'Target', 'Actual', 'Variance'] },
    { label: 'Table C', name: 'Staffing levels', status: 'Review', columns: ['Team', 'Planned', 'Actual'] },
  ];
  const documents = ['Invoice_Q4.pdf', 'Supplier_Agreement.pdf', 'Annex_Compliance.pdf'];
  const totalPdfPages = 12;

  useEffect(() => {
    const storedUrl = sessionStorage.getItem('uploadedPdfUrl');
    const storedName = sessionStorage.getItem('uploadedPdfName');
    if (storedUrl && storedName) {
      setUploadedUrl(storedUrl);
      setSelectedDoc(storedName);
      setPdfPage(1);
    }
  }, []);

  const pdfSrc = uploadedUrl ?? `/pdfs/${selectedDoc}`;

  const leftDrawerElement = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-2 text-volcanic-900">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">Validator</p>
        <h2 className="text-h5 font-variable text-volcanic-200">Document validator & viewer</h2>
        <p className="text-p-sm text-volcanic-300">Review the normalized output, validate structure, and preview assets.</p>
      </div>
      <div className="rounded-2xl border border-blue-500 bg-white p-4">
        <p className="text-label text-volcanic-300">Navigation</p>
        <div className="mt-3 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = link.href === '/document-compare/structure';
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg border px-3 py-2 text-p-sm ${
                  isActive
                    ? 'border-blue-400 bg-blue-100 text-volcanic-900'
                    : 'border-blue-400 bg-white text-blue-500'
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
            <p className="text-label text-volcanic-300">Document validator</p>
            <h1 className="text-h3 font-variable text-volcanic-200">Document validator & viewer</h1>
            <p className="text-p text-volcanic-300">
              Inspect normalized sections, validate tables, and preview extracted assets.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full border border-blue-400 px-4 py-2 text-p text-blue-600 transition hover:border-blue-500 hover:text-blue-700">
              Validate again
            </button>
            <button className="rounded-full bg-blue-500 px-5 py-2 text-p text-white shadow-md transition hover:bg-blue-400">
              Export JSON
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-blue-500 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-label text-volcanic-300">Document viewer</p>
              <h2 className="text-h4 font-variable text-volcanic-200">Source PDF vs extracted layout</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-p-sm text-volcanic-800 focus:border-blue-600 focus:outline-none"
              >
                {documents.map((doc) => (
                  <option key={doc}>{doc}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 text-label text-volcanic-600">
                <label className="text-volcanic-600">Page</label>
                <input
                  type="number"
                  min={1}
                  max={totalPdfPages}
                  value={pdfPage}
                  onChange={(e) =>
                    setPdfPage(() => {
                      const val = Number(e.target.value) || 1;
                      return Math.min(totalPdfPages, Math.max(1, val));
                    })
                  }
                  className="w-16 rounded border border-blue-300 bg-white px-2 py-1 text-right text-p-sm text-volcanic-800 focus:border-blue-600 focus:outline-none"
                />
                <span className="text-volcanic-500">/ {totalPdfPages}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-blue-300 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-label text-volcanic-300">PDF viewer</p>
              </div>
              <div className="mt-3 flex justify-center">
                <object
                  data={`${pdfSrc}#page=${pdfPage}`}
                  type="application/pdf"
                  className="w-full max-w-md aspect-[210/297] rounded-xl border border-blue-200 bg-white shadow-inner"
                >
                  <div className="flex h-full items-center justify-center text-p-sm text-volcanic-500">
                    PDF viewer unavailable. Place PDFs in /public/pdfs/{' '}
                    {selectedDoc} or upload a file from the Upload page.
                  </div>
                </object>
              </div>
              <p className="mt-2 text-p-xs text-volcanic-400">
                Rendering page {pdfPage} of {totalPdfPages} for {selectedDoc}
              </p>
            </div>
            <div className="rounded-xl border border-blue-300 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-label text-volcanic-300">Extracted layout</p>
                <span className="rounded-full bg-secondary-100 px-2 py-1 text-label text-volcanic-600">
                  Rendered
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-p-sm text-volcanic-400">
                  <span>Rendered layout</span>
                  <span className="rounded-full bg-secondary-100 px-2 py-1 text-label text-volcanic-600">
                    Page {pdfPage} of {totalPdfPages}
                  </span>
                </div>
                <div className="h-64 rounded-xl border border-blue-300 bg-gradient-to-br from-blue-50 via-secondary-50 to-white" />
              </div>
            </div>
          </div>
        </section>


        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-blue-500 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label text-volcanic-300">Requirements for DOORS</p>
                <h2 className="text-h4 font-variable text-volcanic-200">Export structured requirements</h2>
                <p className="text-p-sm text-volcanic-400">Generate XLSX, ReqIF, or JSON for the selected document.</p>
              </div>
              <span className="rounded-full bg-secondary-100 px-3 py-1 text-label text-volcanic-700">
                {selectedDoc}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Export XLSX', tone: 'bg-blue-500 text-white' },
                { label: 'Export ReqIF', tone: 'bg-secondary-100 text-volcanic-700 border border-blue-300' },
                { label: 'Export JSON', tone: 'bg-secondary-100 text-volcanic-700 border border-blue-300' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  className={`rounded-full px-4 py-2 text-p-sm shadow-sm ${btn.tone}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-blue-200 bg-secondary-50 p-4 text-p-sm text-volcanic-600">
              <p className="text-label text-volcanic-500">What’s included</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-p-xs text-volcanic-500">
                <li>Requirement IDs, text, and acceptance criteria.</li>
                <li>Trace to source section and detected tables/figures.</li>
                <li>Status tags (New, Modified, Deleted) from comparisons.</li>
              </ul>
            </div>
          </div>
          <div className="rounded-2xl border border-blue-500 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label text-volcanic-300">Custom prompt</p>
                <h2 className="text-h4 font-variable text-volcanic-200">Prompt editor</h2>
                <p className="text-p-sm text-volcanic-400">Tune how requirements are generated for DOORS.</p>
              </div>
              <button className="rounded-full border border-blue-300 px-3 py-1 text-label text-blue-600">
                Save prompt
              </button>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={6}
              className="mt-3 w-full rounded-xl border border-blue-300 bg-secondary-50 p-3 text-p-sm text-volcanic-800 focus:border-blue-600 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-label text-volcanic-600">
              <span className="rounded-full bg-secondary-100 px-3 py-1">IDs</span>
              <span className="rounded-full bg-secondary-100 px-3 py-1">Acceptance criteria</span>
              <span className="rounded-full bg-secondary-100 px-3 py-1">Traceability</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
