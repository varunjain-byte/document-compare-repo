'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useListFiles } from '@/hooks/files';
import { useConversationStore } from '@/stores';
import { Layout } from '@/components/Layout';
import { cn } from '@/utils/cn';

// Mock availableDocuments removed in favor of real data


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

import { MOCK_FILES } from '@/mocks/mockFiles';

export default function SimilarityMatcherPage() {
  const { conversation } = useConversationStore();
  const { data: serverFiles = [] } = useListFiles(conversation.id, { enabled: !!conversation.id });

  // Use mock data if server list is empty
  const files = serverFiles.length > 0 ? serverFiles : MOCK_FILES;

  // Filter and map real files
  const availableDocuments = useMemo(() => {
    return files
      .filter((f: any) => f.status === 'parsed' || f.status === 'PARSED')
      .map((f: any) => ({
        id: f.id,
        name: f.file_name || f.name,
        type: 'PDF',
        lastModified: new Date(f.updated_at || f.lastModified || Date.now()).toLocaleDateString(),
        pageCount: Math.ceil((f.file_size || f.size || 0) / 50000) || 1,
        fileSize: f.file_size ? `${(f.file_size / 1024 / 1024).toFixed(2)} MB` : '1.2 MB',
        parsedDate: new Date(f.updated_at || Date.now()).toLocaleDateString() // Added missing prop
      }));
  }, [files]);

  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'select' | 'results' | 'history'>('select');
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Review Mode State
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [feedbackData, setFeedbackData] = useState<Record<string, any>>({});
  const [flaggedSegments, setFlaggedSegments] = useState<string[]>([]);

  const mockFindings = [
    { id: 'f1', title: 'Shared Terminology', description: '412 shared terms found between documents.', type: 'positive' },
    { id: 'f2', title: 'Structural Match', description: '23 common sections identified.', type: 'positive' },
    { id: 'f4', title: 'Audience Mismatch', description: 'Different intended audiences detected.', type: 'warning' }
  ];

  // Mock granular matches for the new view
  const mockGranularMatches = [
    {
      id: 'gm1',
      sourceText: "The Supplier shall warrant that the Goods are free from defects in design, material and workmanship and remain so for 12 months.",
      matches: [
        {
          docName: "Technical Specification v2.0",
          text: "All components must maintain structural integrity and functional performance for a minimum period of 1 year from the date of commissioning.",
          score: 0.92,
          reasoning: "Strong semantic match: '12 months' vs '1 year', and 'free from defects' aligns with 'maintain structural integrity'.",
          tag: 'Match'
        },
        {
          docName: "Safety Analysis Report",
          text: "Component durability is estimated at 50,000 cycles under normal operating conditions.",
          score: 0.65,
          reasoning: "Related concept (durability/defects) but defines lifespan in cycles rather than time.",
          tag: 'Somewhat match'
        }
      ]
    },
    {
      id: 'gm2',
      sourceText: "Payment terms shall be Net 60 days from receipt of a valid invoice.",
      matches: [
        {
          docName: "Service Agreement v3.0",
          text: "Invoices are payable within 60 days of submission to the accounts payable department.",
          score: 0.98,
          reasoning: "Exact match on payment duration (60 days) and trigger event (submission/receipt).",
          tag: 'Match'
        },
        {
          docName: "Product Requirements Doc",
          text: "Cost estimates should include a 10% contingency for price fluctuations.",
          score: 0.25,
          reasoning: "Both mention financial terms but topics (payment timeline vs cost estimation) are unrelated.",
          tag: 'No Matches found'
        }
      ]
    },
    {
      id: 'gm3',
      sourceText: "The maximum operating temperature must not exceed 85°C to prevent thermal degradation.",
      matches: [
        {
          docName: "Technical Specification v2.0",
          text: "Thermal cutoff engagement occurs at 90°C ± 2°C.",
          score: 0.78,
          reasoning: "High similarity in topic (temperature limits) but specific values differ (85°C vs 90°C), suggesting a potential conflict.",
          tag: 'Somewhat match'
        },
        {
          docName: "Safety Analysis Report",
          text: "Thermal runaway events were observed at temperatures exceeding 120°C.",
          score: 0.72,
          reasoning: "Discusses temperature limits but in the context of failure modes rather than operating constraints.",
          tag: 'Somewhat match'
        }
      ]
    }
  ];



  // Helper to find segment data
  const getSegmentById = (id: string) => {
    return mockGranularMatches.find(m => m.id === id);
  };

  const startReview = () => {
    if (flaggedSegments.length === 0) return;
    setIsReviewMode(true);
    setCurrentReviewIndex(0);
  };

  const currentReviewId = flaggedSegments[currentReviewIndex];
  const currentReviewItem = getSegmentById(currentReviewId);

  // Pagination State
  const [granularPage, setGranularPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Calculate Metrics
  const matchStats = useMemo(() => {
    let matches = 0;
    let somewhat = 0;
    let none = 0;

    mockGranularMatches.forEach(item => {
      const bestMatch = item.matches[0]?.tag;
      if (bestMatch === 'Match') matches++;
      else if (bestMatch === 'Somewhat match') somewhat++;
      else none++;
    });

    return { matches, somewhat, none };
  }, []);

  const paginatedMatches = useMemo(() => {
    const start = (granularPage - 1) * ITEMS_PER_PAGE;
    return mockGranularMatches.slice(start, start + ITEMS_PER_PAGE);
  }, [granularPage]);

  const totalPages = Math.ceil(mockGranularMatches.length / ITEMS_PER_PAGE);

  const handleReviewAction = (action: string) => {
    if (!currentReviewItem) return;
    setFeedbackData(prev => ({ ...prev, [currentReviewItem.id]: action }));
  };

  const closeReview = () => {
    setIsReviewMode(false);
    setFeedbackData({});
  };

  const toggleFlag = (segmentId: string) => {
    setFlaggedSegments(prev =>
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const submitReview = () => {
    alert('Review feedback submitted for ' + flaggedSegments.length + ' items.');
    closeReview();
    setFlaggedSegments([]); // Clear flags after processing
  };


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
    <div className="flex h-full flex-col bg-white text-volcanic-900 overflow-hidden relative">

      {/* Review Mode Overlay */}
      {isReviewMode && currentReviewItem && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
          <div className="flex-shrink-0 px-8 py-4 border-b border-marble-200 bg-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-volcanic-100 flex items-center justify-center font-bold text-volcanic-600">
                {currentReviewIndex + 1}
              </div>
              <div>
                <h2 className="text-h5 font-variable text-volcanic-900">Reviewing Item {currentReviewIndex + 1} of {flaggedSegments.length}</h2>
                <p className="text-xs text-volcanic-500">ID: {currentReviewItem.id}</p>
              </div>
            </div>
            <button onClick={closeReview} className="px-4 py-2 rounded-lg text-sm font-medium text-volcanic-600 hover:bg-marble-100 transition">Exit Review</button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 flex items-start justify-center bg-marble-50">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-marble-200 overflow-hidden">

              {/* Snapshot */}
              <div className="p-8 border-b border-marble-200">
                <h3 className="text-lg font-bold text-volcanic-900 mb-4">Comparison Context</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-marble-50 rounded-xl border border-marble-200">
                    <p className="text-[10px] font-bold text-volcanic-500 uppercase mb-2">Source Segment</p>
                    <p className="text-sm text-volcanic-900 leading-relaxed font-medium">"{currentReviewItem.sourceText}"</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-700 uppercase mb-2">Top Match ({currentReviewItem.matches[0].docName})</p>
                    <p className="text-sm text-volcanic-900 leading-relaxed font-medium">"{currentReviewItem.matches[0].text}"</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700">{(currentReviewItem.matches[0].score * 100).toFixed(0)}% Match</span>
                      <span className="text-xs text-volcanic-600 italic">- {currentReviewItem.matches[0].reasoning}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-8 bg-white">
                <h3 className="text-p font-bold text-volcanic-900 mb-6">Verify this Match</h3>

                <div className="grid grid-cols-1 gap-4">
                  {/* Confirm */}
                  <div className={cn("rounded-xl border-2 p-4 transition", feedbackData[currentReviewItem.id] === 'confirm' ? "border-emerald-500 bg-emerald-50" : "border-marble-200 hover:border-emerald-300")}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="radio" name="action" checked={feedbackData[currentReviewItem.id] === 'confirm'} onChange={() => handleReviewAction('confirm')} className="mt-1" />
                      <div>
                        <span className="font-bold text-volcanic-900 block">Confirm Match</span>
                        <span className="text-sm text-volcanic-600">The similarity and reasoning are correct.</span>
                      </div>
                    </label>
                  </div>

                  {/* Adjust */}
                  <div className={cn("rounded-xl border-2 p-4 transition", feedbackData[currentReviewItem.id] === 'adjust' ? "border-blue-500 bg-blue-50" : "border-marble-200 hover:border-blue-300")}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="radio" name="action" checked={feedbackData[currentReviewItem.id] === 'adjust'} onChange={() => handleReviewAction('adjust')} className="mt-1" />
                      <div>
                        <span className="font-bold text-volcanic-900 block">Adjust Tag/Score</span>
                        <span className="text-sm text-volcanic-600">Match is valid but classified incorrectly (e.g. should be 'Somewhat match').</span>
                      </div>
                    </label>
                  </div>

                  {/* Reject */}
                  <div className={cn("rounded-xl border-2 p-4 transition", feedbackData[currentReviewItem.id] === 'reject' ? "border-red-500 bg-red-50" : "border-marble-200 hover:border-red-300")}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="radio" name="action" checked={feedbackData[currentReviewItem.id] === 'reject'} onChange={() => handleReviewAction('reject')} className="mt-1" />
                      <div>
                        <span className="font-bold text-volcanic-900 block">Reject Match</span>
                        <span className="text-sm text-volcanic-600">False positive, hallucination, or irrelevant match.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-6 bg-marble-50 border-t border-marble-200 flex justify-end gap-4">
                <button disabled={currentReviewIndex === 0} onClick={() => setCurrentReviewIndex(i => i - 1)} className="px-4 py-2 disabled:opacity-50 font-bold text-volcanic-600">Previous</button>
                {currentReviewIndex < flaggedSegments.length - 1 ? (
                  <button onClick={() => setCurrentReviewIndex(i => i + 1)} className="px-6 py-2 bg-volcanic-900 text-white rounded-lg font-bold">Next Item</button>
                ) : (
                  <button onClick={submitReview} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg">Submit Review Package</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


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

            {/* Overall Metrics Dashboard */}
            <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-6">
              <div className="flex flex-col gap-6">

                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label text-blue-800 uppercase tracking-widest font-bold">Overall Metrics</p>
                    <div className="flex items-baseline gap-4 mt-2">
                      <p className="text-5xl font-bold text-blue-700">
                        {(selectedJob.similarityScore * 100).toFixed(0)}%
                      </p>
                      <p className="text-lg font-medium text-blue-900 border-l-2 border-blue-300 pl-4">Overall Similarity Score</p>
                    </div>
                    <p className="text-sm text-blue-900 mt-3 max-w-2xl leading-relaxed opacity-80">
                      {selectedJob.summary}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-2 justify-end">
                      <span className="text-[10px] font-bold uppercase text-volcanic-500">Flagged Items</span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">{flaggedSegments.length}</span>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center gap-2 justify-center shadow-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Report
                    </button>
                    {flaggedSegments.length > 0 && (
                      <button
                        onClick={startReview}
                        className="px-4 py-2 rounded-lg bg-volcanic-900 text-white font-bold hover:bg-volcanic-800 transition shadow-md flex items-center gap-2 animate-pulse-slow justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Start Review ({flaggedSegments.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Match Stats Summary */}
                <div className="grid grid-cols-3 gap-4 border-t border-blue-200 pt-6">
                  <div className="bg-white/60 rounded-xl p-4 border border-blue-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-volcanic-900">{matchStats.matches}</p>
                      <p className="text-xs font-bold uppercase text-volcanic-500 tracking-wider">Exact Matches</p>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-xl p-4 border border-blue-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-volcanic-900">{matchStats.somewhat}</p>
                      <p className="text-xs font-bold uppercase text-volcanic-500 tracking-wider">Somewhat Matches</p>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-xl p-4 border border-blue-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-marble-200 flex items-center justify-center text-volcanic-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-volcanic-900">{matchStats.none}</p>
                      <p className="text-xs font-bold uppercase text-volcanic-500 tracking-wider">No Matches</p>
                    </div>
                  </div>
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

            {/* Granular Segment Analysis */}
            <div className="rounded-xl border border-marble-300 bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h5 font-variable text-volcanic-900">Granular Segment Analysis</h2>
                <span className="text-sm text-volcanic-500 font-medium">Page {granularPage} of {totalPages}</span>
              </div>

              <div className="space-y-6">
                {paginatedMatches.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-xl border border-marble-200 bg-secondary-50/30">
                    {/* Source Segment */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-volcanic-500 uppercase tracking-wider">Source Segment</p>
                        <button
                          onClick={() => toggleFlag(item.id)}
                          className={cn(
                            "text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border",
                            flaggedSegments.includes(item.id)
                              ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                              : "bg-white border-orange-200 text-orange-700 hover:bg-orange-50"
                          )}
                        >
                          <svg className="w-3.5 h-3.5" fill={flaggedSegments.includes(item.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8l-2 2H5l-2-2z" className={flaggedSegments.includes(item.id) ? "hidden" : "block"} />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" className={flaggedSegments.includes(item.id) ? "block" : "hidden"} />
                          </svg>
                          {flaggedSegments.includes(item.id) ? 'Flagged' : 'Flag'}
                        </button>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-marble-200 shadow-sm text-sm text-volcanic-900 font-medium leading-relaxed">
                        "{item.sourceText}"
                      </div>
                    </div>

                    {/* Matches */}
                    <div className="lg:col-span-8 space-y-4">
                      <p className="text-xs font-bold text-volcanic-500 uppercase tracking-wider mb-2">Top Similar Matches</p>
                      {item.matches.map((match, idx) => (
                        <div key={idx} className="relative p-4 bg-white rounded-lg border border-marble-200 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {match.docName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                match.tag === 'Match' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                match.tag === 'Somewhat match' && "bg-amber-50 text-amber-700 border-amber-200",
                                match.tag === 'No Matches found' && "bg-marble-100 text-volcanic-500 border-marble-300"
                              )}>
                                {match.tag}
                              </span>
                              <span className="text-sm font-bold text-volcanic-900">
                                {(match.score * 100).toFixed(0)}% Match
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-volcanic-800 mb-3 ml-2 border-l-2 border-blue-200 pl-3">"{match.text}"</p>
                          <div className="text-xs text-volcanic-500 bg-marble-50 p-2 rounded flex gap-2">
                            <span className="font-bold">Reasoning:</span>
                            <span className="italic">{match.reasoning}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-marble-200">
                  <button
                    onClick={() => setGranularPage(p => Math.max(1, p - 1))}
                    disabled={granularPage === 1}
                    className="px-4 py-2 text-sm font-medium text-volcanic-700 bg-white border border-marble-300 rounded-lg hover:bg-marble-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-volcanic-600">
                    Page {granularPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setGranularPage(p => Math.min(totalPages, p + 1))}
                    disabled={granularPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-volcanic-700 bg-white border border-marble-300 rounded-lg hover:bg-marble-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
