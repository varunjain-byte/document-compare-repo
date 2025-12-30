'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { cn } from '@/utils/cn';

// Mock data for parsed documents
const availableDocuments = [
  { id: 'doc1', name: 'Service Agreement v3.0', parsedDate: '2024-12-10', pageCount: 48, fileSize: '2.7 MB' },
  { id: 'doc2', name: 'Technical Specification v2.0', parsedDate: '2024-08-15', pageCount: 72, fileSize: '4.3 MB' },
  { id: 'doc3', name: 'Product Requirements Doc', parsedDate: '2024-11-20', pageCount: 35, fileSize: '1.9 MB' },
  { id: 'doc4', name: 'Safety Analysis Report', parsedDate: '2024-10-05', pageCount: 127, fileSize: '8.1 MB' },
  { id: 'doc5', name: 'Compliance Checklist', parsedDate: '2024-09-12', pageCount: 22, fileSize: '1.2 MB' },
];

// Mock job history
const mockJobHistory = [
  {
    id: 'job1',
    name: 'Service Agreement vs Technical Spec',
    documents: ['Service Agreement v3.0', 'Technical Specification v2.0'],
    submittedDate: '2024-12-15 14:30',
    status: 'completed',
    similarityScore: 0.42,
    summary: 'Low similarity due to different document purposes. Technical Spec focuses on implementation details while Service Agreement covers legal terms.'
  },
  {
    id: 'job2',
    name: 'Multi-doc compliance comparison',
    documents: ['Safety Analysis Report', 'Compliance Checklist', 'Product Requirements Doc'],
    submittedDate: '2024-12-14 09:15',
    status: 'completed',
    similarityScore: 0.67,
    summary: 'Moderate similarity. All documents share compliance-focused terminology and reference similar safety standards (ISO 26262).'
  },
  {
    id: 'job3',
    name: 'Template validation run',
    documents: ['Service Agreement v3.0', 'Service Agreement v2.0'],
    submittedDate: '2024-12-13 16:45',
    status: 'processing',
    similarityScore: null,
    summary: null
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

export default function SimilarityMatcherPage() {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'select' | 'results' | 'history'>('select');
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const toggleDoc = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSubmitJob = () => {
    // Simulate job submission
    setActiveView('history');
    setSelectedDocs([]);
  };

  const viewJobResults = (job: any) => {
    setSelectedJob(job);
    setActiveView('results');
  };

  const leftDrawerElement = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-2">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">Similarity Matcher</p>
        <h2 className="text-h5 font-variable text-volcanic-900">Document Similarity</h2>
        <p className="text-p-sm text-volcanic-700">
          Compare different documents to identify semantic similarity and shared content.
        </p>
      </div>
      <div className="rounded-2xl border border-marble-300 bg-white p-4">
        <p className="text-label text-volcanic-600">Navigation</p>
        <div className="mt-3 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = link.href === '/document-compare/deep-dive';
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

      {/* Tab Navigation */}
      <div className="border-b border-marble-300 bg-white px-6 pt-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveView('select')}
            className={cn(
              "px-4 py-2 text-p-sm font-medium rounded-t-lg transition",
              activeView === 'select'
                ? "bg-white text-blue-700 border-t-2 border-x-2 border-blue-500 border-b-0"
                : "text-volcanic-600 hover:text-blue-600"
            )}
          >
            New Comparison
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={cn(
              "px-4 py-2 text-p-sm font-medium rounded-t-lg transition",
              activeView === 'history'
                ? "bg-white text-blue-700 border-t-2 border-x-2 border-blue-500 border-b-0"
                : "text-volcanic-600 hover:text-blue-600"
            )}
          >
            Run History ({mockJobHistory.length})
          </button>
        </div>
      </div>

      {/* Document Selection View */}
      {activeView === 'select' && (
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-h3 font-variable text-volcanic-900 mb-2">Select Documents to Compare</h1>
              <p className="text-p text-volcanic-600">
                Choose <strong>2 or more documents</strong> to calculate semantic similarity scores
              </p>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-bold">What is document similarity?</p>
                  <p className="mt-1">This tool measures how similar different documents are based on shared terminology, structure, and content. Unlike <strong>Delta Compare</strong> which tracks changes between versions of the same document, Similarity Matcher identifies overlap between different documents.</p>
                </div>
              </div>
            </div>

            {/* Document Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-p-sm font-bold text-volcanic-800">Available Documents</p>
                <p className="text-xs text-volcanic-600">
                  {selectedDocs.length} selected
                  {selectedDocs.length >= 2 && <span className="ml-2 text-blue-600">✓ Ready</span>}
                </p>
              </div>

              <div className="space-y-2">
                {availableDocuments.map(doc => {
                  const isSelected = selectedDocs.includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
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

                      {/* Document info */}
                      <div className="flex-1">
                        <p className="text-p-sm font-bold text-volcanic-900">{doc.name}</p>
                        <div className="mt-1 flex items-center gap-4 text-xs text-volcanic-600">
                          <span>{doc.pageCount} pages</span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                          <span>•</span>
                          <span>Parsed {doc.parsedDate}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmitJob}
                disabled={selectedDocs.length < 2}
                className={cn(
                  "px-8 py-3 rounded-lg font-bold text-p transition-all flex items-center gap-2",
                  selectedDocs.length >= 2
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                    : "bg-marble-200 text-volcanic-400 cursor-not-allowed"
                )}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Submit Comparison Job</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job History View */}
      {activeView === 'history' && (
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-h3 font-variable text-volcanic-900 mb-2">Comparison History</h1>
              <p className="text-p text-volcanic-600">View and revisit previous similarity analysis runs</p>
            </div>

            <div className="space-y-4">
              {mockJobHistory.map(job => (
                <div
                  key={job.id}
                  className="rounded-xl border-2 border-marble-200 bg-white p-5 hover:border-emerald-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-p font-bold text-volcanic-900">{job.name}</h3>
                        {job.status === 'completed' ? (
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            ✓ Complete
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                            ⏳ Processing
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-volcanic-600 mt-1">Submitted: {job.submittedDate}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {job.documents.map((docName, idx) => (
                          <span key={idx} className="px-2 py-1 rounded bg-marble-100 text-xs text-volcanic-700">
                            {docName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {job.similarityScore !== null && (
                        <div className="text-right">
                          <p className="text-xs text-volcanic-600">Similarity Score</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {(job.similarityScore * 100).toFixed(0)}%
                          </p>
                        </div>
                      )}
                      {job.status === 'completed' && (
                        <button
                          onClick={() => viewJobResults(job)}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                        >
                          View Results
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {activeView === 'results' && selectedJob && (
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <button
                onClick={() => setActiveView('history')}
                className="text-blue-700 hover:text-blue-800 text-sm font-medium mb-4 flex items-center gap-1"
              >
                ← Back to History
              </button>
              <h1 className="text-h3 font-variable text-volcanic-900 mb-2">{selectedJob.name}</h1>
              <p className="text-p text-volcanic-600">Analysis completed: {selectedJob.submittedDate}</p>
            </div>

            {/* Similarity Score Card */}
            <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label text-blue-800 uppercase">Overall Similarity Score</p>
                  <p className="text-5xl font-bold text-blue-700 mt-2">
                    {(selectedJob.similarityScore * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-blue-900 mt-2 max-w-2xl">
                    {selectedJob.summary}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Report
                  </button>
                  <button className="px-4 py-2 rounded-lg border-2 border-blue-600 text-blue-700 font-medium hover:bg-blue-50 transition">
                    Export JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="rounded-xl border border-marble-300 bg-white p-6">
              <h2 className="text-h5 font-variable text-volcanic-900 mb-4">Similarity Breakdown</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-marble-50">
                  <div>
                    <p className="font-bold text-volcanic-900">Shared Terminology</p>
                    <p className="text-sm text-volcanic-600">Common technical terms and domain-specific vocabulary</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-volcanic-900">73%</p>
                    <p className="text-xs text-volcanic-600">412 shared terms</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-marble-50">
                  <div>
                    <p className="font-bold text-volcanic-900">Structural Similarity</p>
                    <p className="text-sm text-volcanic-600">Document organization and section hierarchy</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-volcanic-900">58%</p>
                    <p className="text-xs text-volcanic-600">23 common sections</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-marble-50">
                  <div>
                    <p className="font-bold text-volcanic-900">Content Overlap</p>
                    <p className="text-sm text-volcanic-600">Semantic similarity of actual content</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-volcanic-900">45%</p>
                    <p className="text-xs text-volcanic-600">based on embeddings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div className="rounded-xl border border-marble-300 bg-white p-6">
              <h2 className="text-h5 font-variable text-volcanic-900 mb-4">Key Findings</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <p className="text-volcanic-700">Both documents reference ISO 26262 safety standards extensively</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <p className="text-volcanic-700">Shared terminology around ASIL levels and hazard analysis</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold">!</span>
                  <p className="text-volcanic-700">Service Agreement focuses on contractual obligations while Technical Spec covers implementation details</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold">!</span>
                  <p className="text-volcanic-700">Different intended audiences (legal vs. engineering teams)</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
