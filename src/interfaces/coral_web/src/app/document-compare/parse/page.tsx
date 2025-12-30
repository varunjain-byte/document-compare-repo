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
    assets: [
      { name: 'Table A.1', type: 'Table', page: 4, confidence: 98 },
      { name: 'Figure 3', type: 'Figure', page: 12, confidence: 92 },
      { name: 'Chart 5', type: 'Chart', page: 15, confidence: 88 },
      { name: 'Table B.2', type: 'Table', page: 22, confidence: 95 }
    ],
  },
  {
    name: 'Supplier_Agreement.pdf',
    pages: 54,
    status: 'Queued',
    progress: { ocr: 24, tables: 12, figures: 8, metadata: 30 },
    assets: [
      { name: 'Table 2.1 Pricing', type: 'Table', page: 3, confidence: 99 },
      { name: 'Figure 1 Workflow', type: 'Figure', page: 8, confidence: 85 }
    ],
  },
  {
    name: 'Annex_Compliance.pdf',
    pages: 22,
    status: 'Ready',
    progress: { ocr: 100, tables: 98, figures: 92, metadata: 100 },
    assets: [
      { name: 'Table C.4 Controls', type: 'Table', page: 5, confidence: 96 },
      { name: 'Figure 6 Process', type: 'Figure', page: 10, confidence: 91 },
      { name: 'Chart 2 KPIs', type: 'Chart', page: 18, confidence: 89 }
    ],
  },
];

const navLinks = [
  { href: '/document-compare', label: 'Home' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Document validator' },
  { href: '/document-compare/compare', label: 'Delta Compare' },
  { href: '/document-compare/deep-dive', label: 'Similarity Matcher' },
];

export default function DocumentParsePage() {
  const [selectedFile, setSelectedFile] = useState(pdfFiles[0]);
  const [selectedAsset, setSelectedAsset] = useState<any>(pdfFiles[0].assets[0]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [assetPage, setAssetPage] = useState(1);

  // Reset pagination and selection when file changes
  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
    setSelectedAsset(file.assets?.[0] || null);
    setAssetPage(1);
    setActiveFilter('All');
  };

  const handleDownload = () => {
    alert(`Downloading assets for ${selectedFile.name}...`);
  };

  const progressItems = [
    { label: 'OCR', value: `${selectedFile.progress.ocr}%`, bar: `w-[${selectedFile.progress.ocr}%]` },
    { label: 'Tables', value: `${selectedFile.progress.tables}%`, bar: `w-[${selectedFile.progress.tables}%]` },
    { label: 'Figures', value: `${selectedFile.progress.figures}%`, bar: `w-[${selectedFile.progress.figures}%]` },
    { label: 'Metadata', value: `${selectedFile.progress.metadata}%`, bar: `w-[${selectedFile.progress.metadata}%]` },
  ];
  const metrics = [
    { label: 'Active documents', value: String(pdfFiles.length), detail: 'In this workspace' },
    { label: 'Extracted assets', value: String(selectedFile.assets?.length || 0), detail: 'Tables, figures, clauses' },
    { label: 'Tables detected', value: '24', detail: '97% confidence' },
    { label: 'Images extracted', value: '28', detail: '5 flagged' },
  ];

  // Filter Logic
  const filteredAssets = (selectedFile.assets || []).filter((asset) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Tables') return asset.type === 'Table';
    if (activeFilter === 'Figures') return asset.type === 'Figure' || asset.type === 'Chart';
    return true;
  });

  // Pagination Logic
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / pageSize));
  const currentPage = Math.min(assetPage, totalPages);
  const pagedAssets = filteredAssets.slice(
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
                className={`rounded-lg border px-3 py-2 text-p-sm ${isActive
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
          <div className="rounded-2xl border border-blue-500 bg-white p-6 shadow-sm flex flex-col h-full max-h-[400px]">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <p className="text-label text-volcanic-300">QUEUE</p>
                <h2 className="text-h4 font-variable text-volcanic-200">Parsing Batch</h2>
              </div>
              <label className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-p-sm font-medium text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all cursor-pointer group">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add PDFs
                <input type="file" accept=".pdf" multiple className="hidden" />
              </label>
            </div>

            <div className="overflow-y-auto rounded-xl border border-marble-200 flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="border-b border-marble-200 bg-secondary-50/50 text-label text-volcanic-400">
                    <th className="py-3 pl-4 font-medium tracking-wider">File Name</th>
                    <th className="py-3 font-medium tracking-wider">Length</th>
                    <th className="py-3 font-medium tracking-wider">Status</th>
                    <th className="py-3 pr-4 text-right font-medium tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pdfFiles.map((file) => {
                    const isActive = file.name === selectedFile.name;
                    const actionLabel = file.status === 'Parsing' ? 'Parsing' : file.status === 'Ready' ? 'Parsed' : 'Start';
                    const isDisabled = file.status === 'Parsing' || file.status === 'Ready';

                    return (
                      <tr
                        key={file.name}
                        onClick={() => handleFileSelect(file)}
                        className={cn(
                          "cursor-pointer border-b border-marble-100 last:border-0 transition-colors",
                          isActive ? "bg-blue-50/60" : "hover:bg-secondary-50"
                        )}
                      >
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-8 w-8 rounded flex-shrink-0 flex items-center justify-center transition-colors",
                              isActive ? "bg-blue-100 text-blue-600" : "bg-secondary-100 text-volcanic-400"
                            )}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <span className={cn("text-p-sm font-medium", isActive ? "text-blue-900" : "text-volcanic-200")}>
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-p-sm text-volcanic-500 font-mono">
                          {file.pages} pgs
                        </td>
                        <td className="py-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] uppercase border font-medium tracking-wide",
                            file.status === 'Parsing' ? "bg-orange-50 text-orange-600 border-orange-200" :
                              file.status === 'Ready' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                "bg-marble-50 text-volcanic-500 border-marble-200"
                          )}>
                            {file.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <button
                            disabled={isDisabled}
                            className={cn(
                              'rounded-md px-3 py-1.5 text-label transition-all shadow-sm',
                              isDisabled
                                ? 'bg-transparent text-volcanic-300 cursor-not-allowed'
                                : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
                            )}
                          >
                            {actionLabel}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-500 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row h-[600px]">
          {/* Master List Pane */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-marble-300 bg-secondary-50/50 flex flex-col">
            <div className="p-4 border-b border-marble-200 bg-white flex-shrink-0">
              <div>
                <p className="text-label text-volcanic-300">INSPECTOR</p>
                <h2 className="text-h4 font-variable text-volcanic-200">Extracted Assets</h2>
              </div>
              {selectedFile.status === 'Ready' && (
                <div className="flex gap-2 mt-4">
                  {['All', 'Tables', 'Figures'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => { setActiveFilter(filter); setAssetPage(1); }}
                      className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-medium transition-colors border",
                        activeFilter === filter
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-volcanic-500 border-marble-300 hover:border-blue-300 hover:text-blue-600"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {selectedFile.status !== 'Ready' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  {selectedFile.status === 'Parsing' ? (
                    <>
                      <div className="w-8 h-8 rounded-full border-2 border-orange-400 border-t-transparent animate-spin mb-2" />
                      <h3 className="text-p font-medium text-volcanic-200">Processing Document...</h3>
                      <p className="text-p-xs text-volcanic-400">Our AI is currently analyzing tables and figures. Please wait.</p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-marble-100 flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-volcanic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-p font-medium text-volcanic-200">Waiting to Start</h3>
                      <p className="text-p-xs text-volcanic-400">Select "Start" in the queue to begin parsing this document.</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {pagedAssets.length === 0 ? (
                    <div className="p-8 text-center text-p-sm text-volcanic-400 italic">No {activeFilter.toLowerCase()} found.</div>
                  ) : (
                    pagedAssets.map((asset) => {
                      const isActive = asset.name === selectedAsset?.name;
                      return (
                        <button
                          key={asset.name}
                          onClick={() => setSelectedAsset(asset)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-lg text-left transition-all group",
                            isActive ? "bg-blue-100 border border-blue-200 shadow-sm" : "hover:bg-white border border-transparent hover:border-marble-200"
                          )}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={cn(
                              "h-8 w-8 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold uppercase",
                              isActive ? "bg-blue-600 text-white" : "bg-marble-200 text-volcanic-500 group-hover:bg-white group-hover:text-blue-600 group-hover:border group-hover:border-blue-200"
                            )}>
                              {asset.type[0]}
                            </div>
                            <div className="truncate">
                              <p className={cn("text-p-sm font-medium truncate", isActive ? "text-blue-900" : "text-volcanic-200")}>{asset.name}</p>
                              <p className="text-label text-volcanic-400">Page {asset.page}</p>
                            </div>
                          </div>
                          <div
                            title="Confidence Score: AI certainty of extraction"
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-mono font-medium cursor-help",
                              asset.confidence > 90 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                            )}>
                            Conf. {asset.confidence}%
                          </div>
                        </button>
                      );
                    })
                  )}
                </>
              )}
            </div>

            {/* Pagination Footer */}
            {selectedFile.status === 'Ready' && filteredAssets.length > 0 && (
              <div className="p-2 border-t border-marble-200 bg-white flex items-center justify-between text-label text-volcanic-500 flex-shrink-0">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setAssetPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 disabled:opacity-30 hover:bg-secondary-50 rounded"
                >
                  Prev
                </button>
                <span className="font-mono text-xs">{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setAssetPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2 py-1 disabled:opacity-30 hover:bg-secondary-50 rounded"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Detail Preview Pane */}
          <div className="w-full md:w-2/3 bg-dots-pattern p-8 flex flex-col relative">
            {selectedFile.status === 'Ready' && selectedAsset ? (
              <>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleDownload}
                    title="Download Asset"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-marble-200 text-volcanic-400 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all text-label font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button className="p-2 rounded-lg bg-white border border-marble-200 text-volcanic-400 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-white p-2 rounded-xl shadow-2xl border border-marble-200 max-w-full max-h-full overflow-auto">
                    <div className="bg-secondary-50 w-[400px] h-[300px] rounded-lg border border-dashed border-marble-300 flex flex-col items-center justify-center gap-4 text-volcanic-400">
                      <svg className="w-16 h-16 text-marble-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="text-center">
                        <p className="text-p font-medium text-volcanic-300">Preview: {selectedAsset.name}</p>
                        <p className="text-label text-volcanic-400 mt-1">High-fidelity render pending...</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center text-label text-volcanic-400">
                  <span>{selectedAsset.type} detected on Page {selectedAsset.page}</span>
                  <span className="font-mono">ID: {selectedAsset.name.replace(/\s+/g, '_').toUpperCase()}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-volcanic-300">
                <p className="text-p-sm">Select a processed asset to view details.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
