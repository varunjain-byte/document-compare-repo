'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { cn } from '@/utils/cn';

// Mock data for parsed documents available for comparison
const availableDocuments = [
  { id: 'v1_contract_2023', name: 'Service Agreement v1.0', parsedDate: '2023-12-15', pageCount: 42, fileSize: '2.3 MB', version: '1.0' },
  { id: 'v2_contract_2024', name: 'Service Agreement v2.0', parsedDate: '2024-06-20', pageCount: 45, fileSize: '2.5 MB', version: '2.0' },
  { id: 'v3_contract_2024', name: 'Service Agreement v3.0', parsedDate: '2024-12-10', pageCount: 48, fileSize: '2.7 MB', version: '3.0' },
  { id: 'spec_v1_2023', name: 'Technical Specification v1.2', parsedDate: '2023-10-05', pageCount: 68, fileSize: '4.1 MB', version: '1.2' },
  { id: 'spec_v2_2024', name: 'Technical Specification v2.0', parsedDate: '2024-08-15', pageCount: 72, fileSize: '4.3 MB', version: '2.0' },
];

// Mock comparison data with ALL asset types (text, tables, images)
const mockPageComparisons = [
  {
    pageNumber: 1,
    totalChanges: 0,
    changes: []
  },
  {
    pageNumber: 2,
    totalChanges: 3,
    changes: [
      {
        id: 'c1',
        type: 'minor',
        category: 'text',
        location: { section: 'Section 1.2', page: 2 },
        title: 'Company Name Correction',
        reasoning: 'Typo corrected in company legal name',
        before: 'Acme Corporaton',
        after: 'Acme Corporation',
        metadata: { confidence: 0.98, impactScore: 2 }
      }
    ]
  },
  {
    pageNumber: 3,
    totalChanges: 11,
    changes: [
      {
        id: 'c2',
        type: 'major',
        category: 'text',
        location: { section: 'Section 2.1', page: 3 },
        title: 'Payment Terms Extended',
        reasoning: 'Payment period extended from 30 to 90 days (200% increase)',
        before: 'Payment shall be made within 30 days of invoice receipt.',
        after: 'Payment shall be made within 90 days of invoice receipt.',
        metadata: { confidence: 0.95, impactScore: 9 }
      },
      {
        id: 'c3',
        type: 'major',
        category: 'text',
        location: { section: 'Section 2.2', page: 3 },
        title: 'Termination Notice Period Changed',
        reasoning: 'Notice period extended from 60 to 90 days (50% increase)',
        before: 'Either party may terminate with 60 days written notice.',
        after: 'Either party may terminate with 90 days written notice.',
        metadata: { confidence: 0.97, impactScore: 8 }
      },
      {
        id: 'c4',
        type: 'major',
        category: 'table',
        location: { section: 'Table 3', page: 3 },
        title: 'Diagnostic Codes Updated',
        reasoning: 'New DTC added and response length updated',
        before: {
          headers: ['Service', 'Name', 'DID/Req', 'Value'],
          rows: [
            { cells: ['0x22', 'ReadDataByIdentifier', 'F190', 'VIN'] },
            { cells: ['0x19', 'ReadDTCInformation', '02', '3 DTCs'], change: 'modified' },
            { cells: ['0x14', 'ClearDiagnosticInformation', 'FF', 'Allowed'], change: 'modified' }
          ]
        },
        after: {
          headers: ['Service', 'Name', 'DID/Req', 'Value'],
          rows: [
            { cells: ['0x22', 'ReadDataByIdentifier', 'F190', 'VIN'] },
            { cells: ['0x19', 'ReadDTCInformation', '02', '4 DTCs'], change: 'modified' },
            { cells: ['0x2E', 'WriteDataByIdentifier', 'F187', 'Enabled'], change: 'added' },
            { cells: ['0x14', 'ClearDiagnosticInformation', 'FF', 'Blocked'], change: 'modified' }
          ]
        },
        metadata: { confidence: 0.92, impactScore: 9 }
      },
      {
        id: 'c6',
        type: 'minor',
        category: 'image',
        location: { section: 'Figure 2', page: 3 },
        title: 'Process Flow Diagram Updated',
        reasoning: 'Legend colors updated for better accessibility; layout unchanged',
        before: '/mock/process_flow_v2.png',
        after: '/mock/process_flow_v3.png',
        metadata: { confidence: 0.89, impactScore: 3 }
      }
    ]
  },
  {
    pageNumber: 4,
    totalChanges: 2,
    changes: [
      {
        id: 'c7',
        type: 'major',
        category: 'image',
        location: { section: 'Figure 3', page: 4 },
        title: 'Architecture Diagram Redesigned',
        reasoning: 'Component structure changed to reflect new microservices architecture',
        before: '/mock/arch_old.png',
        after: '/mock/arch_new.png',
        metadata: { confidence: 0.94, impactScore: 8 }
      },
      {
        id: 'c8',
        type: 'minor',
        category: 'table',
        location: { section: 'Table 4', page: 4 },
        title: 'Pricing Table Updated',
        reasoning: 'Currency symbols standardized from $ to USD throughout',
        before: {
          headers: ['Item', 'Price', 'Qty'],
          rows: [
            { cells: ['License', '$1000', '1'] },
            { cells: ['Support', '$500', '1'], change: 'modified' }
          ]
        },
        after: {
          headers: ['Item', 'Price', 'Qty'],
          rows: [
            { cells: ['License', 'USD 1000', '1'] },
            { cells: ['Support', 'USD 500', '1'], change: 'modified' }
          ]
        },
        metadata: { confidence: 0.96, impactScore: 3 }
      }
    ]
  },
  {
    pageNumber: 5,
    totalChanges: 2,
    changes: [
      {
        id: 'c5',
        type: 'new',
        category: 'text',
        location: { section: 'Section 5.3', page: 5 },
        title: 'New Audit Rights Clause',
        reasoning: 'New section 5.3 "Audit Rights" added to align with compliance requirements',
        before: null,
        after: 'The Client reserves the right to audit the Supplier\'s compliance with this agreement annually.',
        metadata: { confidence: 0.99, impactScore: 7 }
      }
    ]
  }
];

const navLinks = [
  { href: '/document-compare', label: 'Home' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Document validator' },
  { href: '/document-compare/compare', label: 'Delta Compare' },
  { href: '/document-compare/deep-dive', label: 'Similarity Matcher' },
];

export default function DocumentComparePage() {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [selectedPage, setSelectedPage] = useState(3); // Default to page with most changes
  const [selectedChange, setSelectedChange] = useState<any>(null);

  const toggleVersion = (versionId: string) => {
    setSelectedVersions(prev =>
      prev.includes(versionId)
        ? prev.filter(id => id !== versionId)
        : [...prev, versionId]
    );
  };

  const handleCompare = () => {
    if (selectedVersions.length >= 2) {
      setComparing(true);
      // Auto-select first change
      const firstPageWithChanges = mockPageComparisons.find(p => p.changes.length > 0);
      if (firstPageWithChanges && firstPageWithChanges.changes[0]) {
        setSelectedChange(firstPageWithChanges.changes[0]);
      }
    }
  };

  const getTotalChanges = () => {
    return mockPageComparisons.reduce((sum, page) => sum + page.totalChanges, 0);
  };

  const getChangesByType = (type: string) => {
    return mockPageComparisons.reduce((sum, page) =>
      sum + page.changes.filter(c => c.type === type).length, 0
    );
  };

  const currentPageData = mockPageComparisons.find(p => p.pageNumber === selectedPage);

  const leftDrawerElement = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-2">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">Delta Compare</p>
        <h2 className="text-h5 font-variable text-volcanic-900">Delta Compare</h2>
        <p className="text-p-sm text-volcanic-700">
          Version chain, change filters, and focused diffs for tables and images.
        </p>
      </div>
      <div className="rounded-2xl border border-marble-300 bg-white p-4">
        <p className="text-label text-volcanic-700 font-bold uppercase mb-3">Navigation</p>
        <div className="flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = link.href === '/document-compare/compare';
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg border px-3 py-2 text-p-sm transition",
                  isActive
                    ? 'border-blue-400 bg-blue-100 text-volcanic-900 font-medium'
                    : 'border-marble-300 bg-white text-blue-700 hover:border-blue-300'
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

      {!comparing ? (
        // Selection View
        <>
          {/* Warning Banner */}
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
            <div className="flex items-center gap-2 text-amber-900">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-p-sm font-bold">Version Comparison Tool</p>
                <p className="text-xs text-amber-800">This utility compares different versions of the <strong>same document</strong> to track changes over time. For comparing different documents, please use the <strong>Similarity Matcher</strong>.</p>
              </div>
            </div>
          </div>

          {/* Page Header */}
          <div className="px-6 py-6 border-b border-marble-300">
            <p className="text-label text-volcanic-600">Version Tracker</p>
            <h1 className="text-h3 font-variable text-volcanic-900">
              Delta Compare
            </h1>
            <p className="text-p text-volcanic-600">
              Select document versions to track changes across tables, images, and text.
            </p>
          </div>

          {/* Selection Interface */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-h3 font-variable text-volcanic-900 mb-2">Select Document Versions</h1>
                <p className="text-p text-volcanic-600">Choose <strong>2 or more versions</strong> of the same document to track changes across iterations</p>
              </div>

              {/* Multi-version selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-p-sm font-bold text-volcanic-800">Available Versions</p>
                  <p className="text-xs text-volcanic-600">
                    {selectedVersions.length} selected
                    {selectedVersions.length >= 2 && <span className="ml-2 text-emerald-600">✓ Ready to compare</span>}
                  </p>
                </div>

                <div className="space-y-2">
                  {availableDocuments.map(doc => {
                    const isSelected = selectedVersions.includes(doc.id);
                    return (
                      <button
                        key={doc.id}
                        onClick={() => toggleVersion(doc.id)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition flex items-center gap-4",
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-marble-200 bg-white hover:border-blue-300"
                        )}
                      >
                        {/* Checkbox */}
                        <div className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-marble-400 bg-white"
                        )}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        {/* Version badge */}
                        {isSelected && (
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {selectedVersions.indexOf(doc.id) + 1}
                          </div>
                        )}

                        {/* Document info */}
                        <div className="flex-1">
                          <p className="text-p-sm font-bold text-volcanic-900">{doc.name}</p>
                          <div className="mt-1 flex items-center gap-4 text-xs text-volcanic-600">
                            <span className="font-medium text-blue-700">v{doc.version}</span>
                            <span>•</span>
                            <span>{doc.pageCount} pages</span>
                            <span>•</span>
                            <span>{doc.parsedDate}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compare Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleCompare}
                  disabled={selectedVersions.length < 2}
                  className={cn(
                    "px-8 py-3 rounded-lg font-bold text-p transition-all flex items-center gap-2",
                    selectedVersions.length >= 2
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                      : "bg-marble-200 text-volcanic-400 cursor-not-allowed"
                  )}
                >
                  <span>Compare {selectedVersions.length} Versions</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Comparison Results View - Three Panel Layout
        <>
          {/* Header with version info */}
          <header className="flex-shrink-0 border-b border-marble-200 px-6 py-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setComparing(false)}
                  className="px-3 py-1.5 rounded border border-marble-300 text-xs font-medium text-volcanic-700 hover:bg-marble-100 transition flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Selection
                </button>
                <div className="h-6 w-px bg-marble-200"></div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">A</div>
                    <span className="text-xs text-volcanic-600">v2.0</span>
                  </div>
                  <svg className="w-4 h-4 text-volcanic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">B</div>
                    <span className="text-xs text-volcanic-600">v3.0</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-volcanic-600">
                {getTotalChanges()} total changes detected
              </div>
            </div>
          </header>

          {/* Three-Panel Layout */}
          <div className="flex-1 flex overflow-hidden bg-marble-980">

            {/* Left Panel: Overview & Navigation (20%) */}
            <div className="w-1/5 border-r border-marble-200 bg-white overflow-y-auto p-4 space-y-4">
              {/* Change Summary */}
              <div className="rounded-lg border border-marble-300 p-3 bg-secondary-50">
                <p className="text-xs font-bold text-volcanic-800 uppercase mb-3">Change Summary</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-volcanic-700">Major</span>
                    </span>
                    <span className="font-bold text-volcanic-900">{getChangesByType('major')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span className="text-volcanic-700">Minor</span>
                    </span>
                    <span className="font-bold text-volcanic-900">{getChangesByType('minor')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-volcanic-700">New</span>
                    </span>
                    <span className="font-bold text-volcanic-900">{getChangesByType('new')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-volcanic-400"></span>
                      <span className="text-volcanic-700">Deleted</span>
                    </span>
                    <span className="font-bold text-volcanic-900">{getChangesByType('deleted')}</span>
                  </div>
                </div>
              </div>

              {/* Page Navigator */}
              <div>
                <p className="text-xs font-bold text-volcanic-800 uppercase mb-2">Pages</p>
                <div className="space-y-1">
                  {mockPageComparisons.map(page => (
                    <button
                      key={page.pageNumber}
                      onClick={() => setSelectedPage(page.pageNumber)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded text-xs transition",
                        selectedPage === page.pageNumber
                          ? "bg-blue-600 text-white"
                          : page.totalChanges > 0
                            ? "bg-blue-50 text-volcanic-900 hover:bg-blue-100"
                            : "bg-white text-volcanic-600 hover:bg-marble-100"
                      )}
                    >
                      <span className="font-medium">Page {page.pageNumber}</span>
                      {page.totalChanges > 0 && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                          selectedPage === page.pageNumber
                            ? "bg-white text-blue-600"
                            : "bg-orange-100 text-orange-700"
                        )}>
                          {page.totalChanges}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Panel: Page-wise Comparison (55%) */}
            <div className="flex-[0.55] overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-p font-bold text-volcanic-900">Page {selectedPage} Changes</h3>
                <span className="text-xs text-volcanic-600">
                  {currentPageData?.totalChanges || 0} {currentPageData?.totalChanges === 1 ? 'change' : 'changes'}
                </span>
              </div>

              {currentPageData && currentPageData.changes.length > 0 ? (
                currentPageData.changes.map(change => (
                  <div
                    key={change.id}
                    onClick={() => setSelectedChange(change)}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition",
                      selectedChange?.id === change.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-marble-200 bg-white hover:border-blue-300"
                    )}
                  >
                    {/* Change Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase",
                          change.type === 'major' && "bg-red-100 text-red-700",
                          change.type === 'minor' && "bg-yellow-100 text-yellow-700",
                          change.type === 'new' && "bg-emerald-100 text-emerald-700",
                          change.type === 'deleted' && "bg-volcanic-200 text-volcanic-700"
                        )}>
                          {change.type}
                        </span>
                        <span className="text-xs text-volcanic-600">{change.location.section}</span>
                      </div>
                    </div>

                    <h4 className="text-p-sm font-bold text-volcanic-900 mb-1">{change.title}</h4>
                    <p className="text-xs text-volcanic-600 mb-3">{change.reasoning}</p>

                    {/* Before/After Preview - Enhanced for all asset types */}
                    {change.category === 'text' && (
                      <div className="space-y-2">
                        {change.before && (
                          <div className="p-2 rounded bg-red-50 border border-red-200">
                            <p className="text-[10px] font-bold text-red-700 uppercase mb-1">Before</p>
                            <p className="text-xs text-volcanic-900 line-through">{change.before}</p>
                          </div>
                        )}
                        {change.after && (
                          <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                            <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">After</p>
                            <p className="text-xs text-volcanic-900">{change.after}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {change.category === 'table' && typeof change.before === 'object' && typeof change.after === 'object' && (
                      <div className="overflow-x-auto">
                        <p className="text-[10px] font-bold text-volcanic-700 uppercase mb-2">Table Comparison</p>
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-marble-100">
                              {change.after.headers.map((header: string, i: number) => (
                                <th key={i} className="border border-marble-300 px-2 py-1 text-left font-bold text-volcanic-800">
                                  {header}
                                </th>
                              ))}
                              <th className="border border-marble-300 px-2 py-1 text-left font-bold text-volcanic-800">Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {change.after.rows.map((row: any, i: number) => {
                              const rowChange = row.change || '';
                              return (
                                <tr
                                  key={i}
                                  className={cn(
                                    rowChange === 'added' && 'bg-emerald-50',
                                    rowChange === 'modified' && 'bg-yellow-50',
                                    rowChange === 'removed' && 'bg-red-50'
                                  )}
                                >
                                  {row.cells.map((cell: string, j: number) => (
                                    <td key={j} className="border border-marble-300 px-2 py-1 text-volcanic-900">
                                      {cell}
                                    </td>
                                  ))}
                                  <td className="border border-marble-300 px-2 py-1">
                                    {rowChange === 'added' && <span className="text-[10px] font-bold text-emerald-700">✨ NEW</span>}
                                    {rowChange === 'modified' && <span className="text-[10px] font-bold text-orange-600">⬆️ MOD</span>}
                                    {rowChange === 'removed' && <span className="text-[10px] font-bold text-red-600">🗑️ DEL</span>}
                                    {!rowChange && <span className="text-[10px] text-volcanic-400">—</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {change.category === 'image' && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-volcanic-700 uppercase mb-2">Image Comparison</p>
                        <div className="grid grid-cols-2 gap-2">
                          {change.before && (
                            <div className="border border-red-200 rounded p-2 bg-red-50">
                              <p className="text-[10px] font-bold text-red-700 mb-1">Before</p>
                              <div className="bg-marble-200 rounded h-24 flex items-center justify-center">
                                <svg className="w-8 h-8 text-volcanic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          )}
                          {change.after && (
                            <div className="border border-emerald-200 rounded p-2 bg-emerald-50">
                              <p className="text-[10px] font-bold text-emerald-700 mb-1">After</p>
                              <div className="bg-marble-200 rounded h-24 flex items-center justify-center">
                                <svg className="w-8 h-8 text-volcanic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-volcanic-600 italic">📸 Side-by-side visual comparison</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-64 text-volcanic-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-p-sm">No changes on this page</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Detail View (25%) */}
            <div className="w-1/4 border-l border-marble-200 bg-white overflow-y-auto p-4">
              {selectedChange ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-volcanic-600 uppercase mb-2">Change Details</p>
                    <h4 className="text-p font-bold text-volcanic-900">{selectedChange.title}</h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-volcanic-600 mb-1">Location</p>
                      <p className="text-p-sm font-medium text-volcanic-900">{selectedChange.location.section}</p>
                      <p className="text-xs text-volcanic-600">Page {selectedChange.location.page}</p>
                    </div>

                    <div>
                      <p className="text-xs text-volcanic-600 mb-1">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-marble-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{ width: `${selectedChange.metadata.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-volcanic-900">
                          {Math.round(selectedChange.metadata.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-volcanic-600 mb-1">Impact Score</p>
                      <div className="flex items-center gap-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2 h-6 rounded-sm",
                              i < selectedChange.metadata.impactScore
                                ? "bg-orange-500"
                                : "bg-marble-200"
                            )}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-marble-200 space-y-2">
                    <button className="w-full px-3 py-2 rounded bg-white border border-marble-300 text-xs font-medium text-volcanic-800 hover:bg-marble-100 transition">
                      Mark as Reviewed
                    </button>
                    <button className="w-full px-3 py-2 rounded bg-white border border-orange-200 text-xs font-medium text-orange-700 hover:bg-orange-50 transition">
                      Flag for Review
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-volcanic-400 text-center">
                  <p className="text-xs">Select a change to view details</p>
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
