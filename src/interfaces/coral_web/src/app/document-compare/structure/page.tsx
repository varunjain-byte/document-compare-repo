'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { cn } from '@/utils/cn';
import { useListFiles } from '@/hooks/files';
import { useConversationStore } from '@/stores';

const navLinks = [
  { href: '/document-compare', label: 'Home' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Document validator' },
  { href: '/document-compare/compare', label: 'Delta Compare' },
  { href: '/document-compare/deep-dive', label: 'Similarity Matcher' },
];

// Mock files removed in favor of real data


// Mock data spanning multiple pages
const mockPages = [
  {
    pageId: 1,
    assets: [
      { id: "asset_1", type: "Header", content: "INVOICE #12345", flagged: false },
      { id: "asset_2", type: "Address", content: "Acme Corp, 123 Industrial Way", flagged: false },
    ]
  },
  {
    pageId: 2,
    assets: [
      { id: "asset_3", type: "Table", name: "Line Items Table", content: "Table Preview Placeholder", flagged: false },
    ]
  },
  {
    pageId: 3,
    assets: [
      { id: "asset_4", type: "Figure", name: "Signature Block", content: "Signature Image Placeholder", flagged: false },
      { id: "asset_5", type: "Footer", content: "Page 3 of 4", flagged: false },
    ]
  },
  {
    pageId: 4,
    assets: [] // Empty page example
  }
];

import { MOCK_FILES } from '@/mocks/mockFiles';

export default function DocumentStructurePage() {
  const { conversation } = useConversationStore();
  const { data: serverFiles = [] } = useListFiles(conversation.id, { enabled: !!conversation.id });

  // Use mock data if server list is empty
  const files = serverFiles.length > 0 ? serverFiles : MOCK_FILES;

  // Filter for parsed files only. 
  // Note: Backend 'status' field added in previous step. 
  // If not available yet, fall back to showing all for demo robustness or mock filtered behavior.
  const parsedFiles = files.filter(f => (f as any).status === 'parsed' || (f as any).status === 'PARSED'); // Case insensitive check

  // Default to first available file or empty
  const [selectedFileId, setSelectedFileId] = useState('');

  useEffect(() => {
    if (parsedFiles.length > 0 && !selectedFileId) {
      setSelectedFileId(parsedFiles[0].id);
    }
  }, [parsedFiles, selectedFileId]);

  const [pages, setPages] = useState(mockPages);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Update current page on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const pageIndex = Math.round(container.scrollLeft / container.clientWidth);
      setCurrentPage(pageIndex + 1);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToPage = (pageNumber: number) => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        left: (pageNumber - 1) * container.clientWidth,
        behavior: 'smooth'
      });
      setCurrentPage(pageNumber);
    }
  };

  // Per-asset feedback handling
  const toggleFlag = (pageIndex: number, assetIndex: number) => {
    const newPages = [...pages];
    newPages[pageIndex].assets[assetIndex].flagged = !newPages[pageIndex].assets[assetIndex].flagged;
    setPages(newPages);
  };

  const getFlaggedCount = () => {
    return pages.flatMap(p => p.assets).filter(a => a.flagged).length;
  };

  const getTotalAssets = () => {
    return pages.reduce((acc, page) => acc + page.assets.length, 0);
  };

  const getAccuracy = () => {
    const total = getTotalAssets();
    if (total === 0) return 100;
    return Math.round(((total - getFlaggedCount()) / total) * 100);
  };

  const leftDrawerElement = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-2 text-volcanic-900">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">Validator</p>
        <h2 className="text-h5 font-variable text-volcanic-200">Validation</h2>
        <p className="text-p-sm text-volcanic-300">Verify extracted data against the source PDF annotations.</p>
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
                className={cn(
                  "rounded-lg border px-3 py-2 text-p-sm transition-colors",
                  isActive
                    ? "border-blue-400 bg-secondary-50 text-volcanic-900"
                    : "border-marble-500 bg-white text-blue-800 hover:border-blue-300"
                )}
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
    <div className="flex h-full flex-col bg-white text-volcanic-900 overflow-hidden">
      {/* Page Header */}
      <div className="px-6 py-6 border-b border-marble-300 bg-white">
        <p className="text-label text-volcanic-600">Validation</p>
        <h1 className="text-h3 font-variable text-volcanic-900">
          Document Validator
        </h1>
        <p className="text-p text-volcanic-600">
          Review extracted assets, validate structure, and flag exceptions.
        </p>
      </div>

      {/* Simplified Header with Essential Stats */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-marble-200 bg-white">
        <div className="flex items-center gap-6">
          {/* File Selector */}
          <div className="flex flex-col">
            <label htmlFor="file-select" className="text-[10px] text-volcanic-600 font-bold uppercase tracking-wider block mb-1">Document</label>
            <div className="relative min-w-[220px]">
              <select
                id="file-select"
                value={selectedFileId}
                onChange={(e) => setSelectedFileId(e.target.value)}
                className="appearance-none bg-white border border-marble-300 text-volcanic-900 text-p-sm rounded pl-3 pr-8 py-1.5 focus:ring-blue-500 focus:border-blue-500 block w-full font-medium"
              >
                {parsedFiles.length === 0 && <option value="">No parsed files found</option>}
                {parsedFiles.map(file => (
                  <option key={file.id} value={file.id}>{file.file_name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-volcanic-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Validation Stats */}
          <div className="flex items-center gap-4 pl-6 border-l border-marble-200">
            <div className="text-center">
              <p className="text-[10px] text-volcanic-600 font-bold uppercase tracking-wider">Total</p>
              <p className="text-p-lg font-bold text-volcanic-900">{getTotalAssets()}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-volcanic-600 font-bold uppercase tracking-wider">Flagged</p>
              <p className={cn("text-p-lg font-bold", getFlaggedCount() > 0 ? "text-orange-600" : "text-emerald-600")}>
                {getFlaggedCount()}
              </p>
            </div>
          </div>
        </div>

        <div className="text-p-sm text-volcanic-700">
          {getFlaggedCount() === 0 ? "✓ All validated" : `${getFlaggedCount()} issue${getFlaggedCount() > 1 ? "s" : ""} pending`}
        </div>
      </header>

      {/* Compact Page Selector */}
      <div className="bg-marble-980 border-b border-marble-200 px-6 py-2.5 flex items-center justify-between">
        <span className="text-xs text-volcanic-700 font-medium">Page:</span>
        <div className="flex gap-1.5">
          {pages.map((p) => (
            <button
              key={p.pageId}
              onClick={() => scrollToPage(p.pageId)}
              className={cn(
                "w-7 h-7 rounded text-xs font-bold transition",
                currentPage === p.pageId
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-marble-300 text-volcanic-600 hover:border-blue-400"
              )}
            >
              {p.pageId}
            </button>
          ))}
        </div>
        <span className="text-xs text-volcanic-700">{currentPage} of {pages.length}</span>
      </div>

      {/* Main Split View - Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth bg-secondary-50 pb-4"
      >
        {pages.map((page, pageIndex) => (
          <div key={page.pageId} className="min-w-full h-full flex gap-4 p-4 snap-center pt-2">

            {/* Left Pane: PDF Page View */}
            <div className="w-1/2 flex flex-col rounded-xl border border-blue-300 bg-white shadow-sm overflow-hidden h-full">
              <div className="bg-secondary-50 px-4 py-3 border-b border-marble-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <p className="text-label font-medium text-volcanic-700">Page {page.pageId} - Source PDF</p>
                </div>
                <button
                  onClick={() => alert(`Mock: Add missing asset on Page ${page.pageId}`)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 transition shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-wide">Add Missing</span>
                </button>
              </div>

              {/* Mock PDF Rendering Area */}
              <div className="flex-1 bg-marble-100 flex items-center justify-center p-8 overflow-hidden relative">
                <div className="bg-white shadow-lg w-[300px] h-[400px] border border-marble-200 flex items-center justify-center text-volcanic-300 relative group">
                  <span className="font-variable text-volcanic-300">Page {page.pageId} Preview</span>
                  {/* Simulating content */}
                  <div className="absolute top-10 left-4 right-4 h-4 bg-secondary-200 rounded opacity-50"></div>
                  <div className="absolute top-20 left-4 right-4 bottom-10 bg-secondary-100 rounded opacity-30 border border-dashed border-volcanic-300"></div>

                  {/* Interactive Highlight Helper */}
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end flex-col p-4 pointer-events-none">
                    <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] text-blue-700 shadow-sm border border-blue-100">Click & Drag to select missing requirements</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane: Assets List for this Page */}
            <div className="w-1/2 flex flex-col rounded-xl border border-blue-300 bg-white shadow-sm overflow-hidden h-full">
              <div className="bg-white px-6 py-3 border-b border-marble-200 flex justify-between items-center">
                <h3 className="text-p-sm font-medium text-volcanic-700">Extracted Assets ({page.assets.length})</h3>
                <div className="text-[10px] text-volcanic-400 font-mono">PAGE {page.pageId}</div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-secondary-50 space-y-4">
                {page.assets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-volcanic-400">
                    <svg className="w-8 h-8 opacity-20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="text-p-sm">No assets extracted on this page.</p>
                  </div>
                ) : (
                  page.assets.map((asset, assetIndex) => (
                    <div key={asset.id} className={cn(
                      "bg-white p-4 rounded-lg border shadow-sm transition-all",
                      asset.flagged ? "border-orange-300 ring-1 ring-orange-100" : "border-marble-200 hover:border-blue-300"
                    )}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary-100 text-volcanic-600 mb-1">
                            {asset.type}
                          </span>
                          <p className="text-p-sm font-medium text-volcanic-900">{asset.name || asset.content.substring(0, 30) + "..."}</p>
                        </div>

                        {/* Per-Asset Flag Button */}
                        <button
                          onClick={() => toggleFlag(pageIndex, assetIndex)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors border",
                            asset.flagged
                              ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                              : "bg-white border-marble-300 text-volcanic-500 hover:bg-secondary-50 hover:text-volcanic-700"
                          )}
                        >
                          <svg className={cn("w-3.5 h-3.5", asset.flagged ? "fill-current" : "none")} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 01-2-2m-2 2a2 2 0 002 2m2-2v8m0 0a2 2 0 012-2h12a2 2 0 002-2v-6a2 2 0 00-2-2H3" />
                            {!asset.flagged && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
                          </svg>
                          {asset.flagged ? "Incorrect" : "Flag Incorrect"}
                        </button>
                      </div>

                      {/* Asset Content Preview */}
                      <div className="p-3 bg-secondary-50 rounded border border-marble-100 text-xs font-mono text-volcanic-600 block whitespace-pre-wrap leading-relaxed">
                        {asset.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Validation Footer */}
      <div className="p-4 border-t border-marble-200 bg-white flex justify-between items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="text-p-sm text-volcanic-500">
          <span className="font-medium text-volcanic-900">{getFlaggedCount()} issues</span> marked across {pages.length} pages.
        </div>
        <button
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-p-sm shadow-md transition-shadow hover:shadow-lg flex items-center gap-2"
          onClick={() => alert(`Submitting feedback with ${getFlaggedCount()} flagged items.`)}
        >
          <span>Submit Feedback</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        <div className="flex gap-2">
          {['REQIF', 'XLSX', 'JSON'].map((format) => (
            <button
              key={format}
              onClick={() => alert(`Downloading ${format} for parsed document... (Not implemented)`)}
              className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 font-medium text-p-sm hover:bg-blue-50 transition-colors"
            >
              Download {format}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
