'use client';

import { useChat } from '@ai-sdk/react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useListFiles } from '@/hooks/files';
import { useConversationStore } from '@/stores';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { cn } from '@/utils/cn';

// Mock data for parsed documents available for comparison
// Mock availableDocuments removed in favor of real data


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

// Mock history data
const initialMockHistory = [
  {
    id: 'comp1',
    name: 'v2.0 vs v3.0 Comparison',
    versions: ['v2.0', 'v3.0'],
    submittedDate: '2024-12-28 10:15',
    status: 'completed',
    reviewStatus: 'pending', // pending | reviewed | issues_reported
    totalChanges: 18,
    summary: 'Significant changes in Section 2 and 3 regarding payment terms and diagnostic codes.'
  },
  {
    id: 'comp2',
    name: 'v1.0 vs v2.0 Comparison',
    versions: ['v1.0', 'v2.0'],
    submittedDate: '2024-11-15 14:20',
    status: 'completed',
    reviewStatus: 'reviewed',
    totalChanges: 12,
    summary: 'Minor text corrections and logo updates.'
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

import { MOCK_FILES } from '@/mocks/mockFiles';
import { formatFileSize } from '@/utils';

export default function DocumentComparePage() {
  const { conversation } = useConversationStore();
  const { data: serverFiles = [] } = useListFiles(conversation.id, { enabled: !!conversation.id });

  // Use mock data if server list is empty
  const files = serverFiles.length > 0 ? serverFiles : MOCK_FILES;

  // Transform files to satisfy the UI's expected 'Document' interface
  const availableDocuments = useMemo(() => {
    return files
      .filter((f: any) => f.status === 'parsed' || f.status === 'PARSED')
      .map((f: any) => ({
        id: f.id,
        name: f.file_name,
        type: 'PDF',
        size: formatFileSize(f.file_size || 0),
        uploaded: new Date(f.updated_at).toLocaleDateString(),
        version: 'v1.0', // Mock version for now
        pageCount: Math.ceil((f.file_size || 0) / 50000) || 1, // Added for UI
        parsedDate: new Date(f.updated_at).toLocaleDateString() // Added for UI
      }));
  }, [files]);

  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [selectedPage, setSelectedPage] = useState(3); // Default to page with most changes
  const [selectedChange, setSelectedChange] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'selection' | 'history'>('selection');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [flaggedChangeIds, setFlaggedChangeIds] = useState<string[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);

  // New state for history to allow updates
  const [compareHistory, setCompareHistory] = useState(initialMockHistory);

  const toggleFlag = (changeId: string) => {
    setFlaggedChangeIds(prev =>
      prev.includes(changeId)
        ? prev.filter(id => id !== changeId)
        : [...prev, changeId]
    );
  };

  // Function to get data based on active pair
  const getActivePairData = () => {
    // For demo purposes:
    // Pair 1 (index 0): Returns original mockPageComparisons
    // Pair 2+ (index > 0): Returns a modified/empty set or same set to simulate different data
    if (activeVersionIndex === 0) return mockPageComparisons;

    // Simulate different results for second pair (e.g. v2 -> v3 vs v3 -> v4)
    // Here we just return a subset or modified version to show the UI updates
    return mockPageComparisons.map(p => ({
      ...p,
      totalChanges: Math.max(0, p.totalChanges - 1), // Slightly different data
      changes: p.changes.slice(0, 1) // Fewer changes
    }));
  };

  const activeData = getActivePairData();

  // --- Review Mode State ---
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  // Updated type definition to include 'correction'
  const [feedbackData, setFeedbackData] = useState<Record<string, { status: 'correct' | 'issue' | 'correction', category?: string, comment?: string }>>({});

  /* DEBUG: Added logs to trace review start failure */
  const startReview = () => {
    console.log('>>> startReview called');
    console.log('>>> flaggedChangeIds:', flaggedChangeIds);
    if (flaggedChangeIds.length === 0) return;

    setIsReviewMode(true);
    setCurrentReviewIndex(0);

    const firstId = flaggedChangeIds[0];
    const firstFlaggedChange = getChangeById(firstId);
    console.log('>>> firstId:', firstId);
    console.log('>>> firstFlaggedChange:', firstFlaggedChange);

    if (firstFlaggedChange) {
      setSelectedPage(firstFlaggedChange.location.page);
      setSelectedChange(firstFlaggedChange);
    } else {
      console.error('>>> Could not find change object for ID:', firstId);
    }
  };

  const closeReview = () => {
    setIsReviewMode(false);
    setFeedbackData({});
  };

  const getChangeById = (id: string) => {
    console.log('>>> getChangeById searching for:', id);
    if (!activeData) {
      console.error('>>> activeData is undefined!');
      return null;
    }
    for (const page of activeData) {
      const change = page.changes.find((c: any) => c.id === id);
      if (change) return change;
    }
    console.warn('>>> Change not found in activeData');
    return null;
  };

  const handleReviewAction = (action: 'correct' | 'issue' | 'correction', data?: { category?: string, comment?: string }) => {
    const currentId = flaggedChangeIds[currentReviewIndex];
    setFeedbackData(prev => ({
      ...prev,
      [currentId]: { status: action, ...data }
    }));

    // Auto-advance logic removed to allow user to make corrections without instant navigation
    // Next/Prev buttons manage navigation now.
  };

  // --- Chatbot / Copilot State (Vercel AI SDK) ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState('');

  // @ts-ignore
  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
    body: {
      // Pass current change context to the backend
      changeContext: isReviewMode && flaggedChangeIds[currentReviewIndex]
        ? getChangeById(flaggedChangeIds[currentReviewIndex])
        : null
    },
    onError: (err: Error) => {
      console.error('Chat Error:', err);
      alert('Failed to connect to AI. Check API Key.');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    // Check if sendMessage supports object or just string. 
    // Usually in Vercel AI SDK 'append' takes object, 'sendMessage' might be similar on AbstractChat?
    // Let's assume sendMessage takes a message object like append.
    // @ts-ignore
    sendMessage({
      role: 'user',
      content: input
    });
    setInput('');
  };

  // Handle Preset Actions
  const handlePresetAction = (action: 'explain' | 'draft_issue') => {
    if (!currentReviewChange) return;

    if (action === 'explain') {
      // @ts-ignore
      sendMessage({
        role: 'user',
        content: `Explain this change: "${currentReviewChange.title}"`
      });
    } else if (action === 'draft_issue') {
      // @ts-ignore
      sendMessage({
        role: 'user',
        content: `Draft an issue report for this change: "${currentReviewChange.title}"`
      });
    }
  };

  // ... (submitReview remains same) ...

  // ... (existing submitReview) ...
  const submitReview = () => {
    // Construct payload
    const payload = {
      reviewer: 'current_user', // Mock
      timestamp: new Date().toISOString(),
      reviews: flaggedChangeIds.map(id => ({
        changeId: id,
        ...feedbackData[id],
        // Include snapshot of the change data context
        changeSnapshot: getChangeById(id)
      }))
    };

    // Determine overall status based on feedback
    const hasIssues = Object.values(feedbackData).some(f => f.status === 'issue');
    const newStatus = hasIssues ? 'issues_reported' : 'reviewed';

    console.log('>>> SUBMITTING FEEDBACK PACKAGE:', payload);
    alert('Feedback submitted to App Team! (Check console for payload)');

    // Update History (Simulated on first item)
    setCompareHistory(prev => prev.map((item, idx) =>
      idx === 0 ? { ...item, reviewStatus: newStatus } : item
    ));

    closeReview();
    setFlaggedChangeIds([]); // Clear flags after processing
  };

  const currentReviewId = flaggedChangeIds[currentReviewIndex];
  const currentReviewChange = getChangeById(currentReviewId);


  const toggleVersion = (versionId: string) => {
    setSelectedVersions(prev => {
      let newSelection;
      if (prev.includes(versionId)) {
        newSelection = prev.filter(id => id !== versionId);
      } else {
        newSelection = [...prev, versionId];
      }
      // Sort selection by availableDocuments order to maintain logical sequence (v1 -> v2 -> v3)
      return newSelection.sort((a, b) => {
        const indexA = availableDocuments.findIndex(d => d.id === a);
        const indexB = availableDocuments.findIndex(d => d.id === b);
        return indexA - indexB;
      });
    });
  };

  const handleCompare = () => {
    if (selectedVersions.length >= 2) {
      setComparing(true);
      setActiveVersionIndex(0); // Reset to first pair
      // Reset filters when starting new comparison
      setFilterType(null);
      // Auto-select first change
      const firstPageWithChanges = mockPageComparisons.find(p => p.changes.length > 0);
      if (firstPageWithChanges && firstPageWithChanges.changes[0]) {
        setSelectedChange(firstPageWithChanges.changes[0]);
      }
    }
  };

  const getTotalChanges = () => {
    const currentData = getActivePairData();
    return currentData.reduce((sum, page) => sum + page.totalChanges, 0);
  };

  const getChangesByType = (type: string) => {
    const currentData = getActivePairData();
    return currentData.reduce((sum, page) =>
      sum + page.changes.filter(c => c.type === type).length, 0
    );
  };

  const getFilteredChanges = (page: any) => {
    if (!filterType) return page.changes;
    return page.changes.filter((c: any) => c.type === filterType);
  };

  const getFlaggedCount = () => {
    return flaggedChangeIds.length;
  };


  const currentPageData = activeData.find(p => p.pageNumber === selectedPage);
  const filteredCurrentPageChanges = currentPageData ? getFilteredChanges(currentPageData) : [];

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
    <div className="flex h-full flex-col bg-white text-volcanic-900 overflow-hidden relative">

      {/* Review Mode Overlay */}
      {isReviewMode && currentReviewChange && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
          {/* Review Header */}
          <div className="flex-shrink-0 px-8 py-4 border-b border-marble-200 bg-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-volcanic-100 flex items-center justify-center font-bold text-volcanic-600">
                {currentReviewIndex + 1}
              </div>
              <div>
                <h2 className="text-h5 font-variable text-volcanic-900">Reviewing Item {currentReviewIndex + 1} of {flaggedChangeIds.length}</h2>
                <p className="text-xs text-volcanic-500">Page {currentReviewChange.location.page} • {currentReviewChange.location.section}</p>
              </div>
            </div>
            <button
              onClick={closeReview}
              className="px-4 py-2 rounded-lg text-sm font-medium text-volcanic-600 hover:bg-marble-100 transition"
            >
              Exit Review
            </button>
          </div>

          {/* Review Content - Centered Card */}
          <div className="flex-1 overflow-y-auto p-8 flex items-start justify-center bg-marble-50 relative">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-marble-200 overflow-hidden relative z-10 transition-all duration-300"
              style={{ marginRight: isChatOpen ? '340px' : '0' }}> {/* Shift for chat */}

              {/* Snapshot of the Change */}
              <div className="p-8 border-b border-marble-200">
                <div className="flex items-center gap-3 mb-4">
                  {/* DYNAMIC BADGE: Checks for correction overrides first */}
                  {(() => {
                    const correction = feedbackData[currentReviewId];
                    // Use override category if it exists and action is 'correction', else use original type
                    const displayType = (correction?.status === 'correction' && correction.category)
                      ? correction.category
                      : currentReviewChange.type;

                    return (
                      <span className={cn(
                        "px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide transition-colors duration-300",
                        displayType === 'major' && "bg-red-100 text-red-700",
                        displayType === 'minor' && "bg-yellow-100 text-yellow-700",
                        displayType === 'new' && "bg-emerald-100 text-emerald-700",
                        displayType === 'deleted' && "bg-volcanic-200 text-volcanic-700",
                        displayType === 'false_positive' && "bg-gray-100 text-gray-500 line-through"
                      )}>
                        {displayType.replace('_', ' ')}
                      </span>
                    );
                  })()}

                  <h3 className="text-lg font-bold text-volcanic-900">{currentReviewChange.title}</h3>
                </div>

                {/* Simplified view of the content for review */}
                <div className="p-4 bg-marble-50 rounded-xl border border-marble-200 mb-4">
                  <p className="text-sm text-volcanic-600 mb-2 italic">Reasoning: {currentReviewChange.reasoning}</p>
                  {/* We could render the full diff components here again, but for brevity using simplified text */}
                  <div className="grid grid-cols-2 gap-4 text-sm font-mono mt-4">
                    <div className="p-3 bg-red-50 text-red-800 rounded border border-red-100">
                      <p className="text-[10px] font-bold opacity-70 mb-1">BEFORE</p>
                      {typeof currentReviewChange.before === 'string' ? currentReviewChange.before : 'Complex Object (Table/Image)'}
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded border border-emerald-100">
                      <p className="text-[10px] font-bold opacity-70 mb-1">AFTER</p>
                      {typeof currentReviewChange.after === 'string' ? currentReviewChange.after : 'Complex Object (Table/Image)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Triage Actions */}
              <div className="p-8 bg-white">
                <h3 className="text-p font-bold text-volcanic-900 mb-6">Review Actions</h3>

                <div className="grid grid-cols-1 gap-6">
                  {/* Action Group: Validate */}
                  <div className={cn(
                    "rounded-xl border-2 transition p-4",
                    feedbackData[currentReviewId]?.status === 'correct'
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-marble-200 bg-white"
                  )}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="pt-1">
                        <input
                          type="radio"
                          name="review_action"
                          checked={feedbackData[currentReviewId]?.status === 'correct'}
                          onChange={() => handleReviewAction('correct')}
                          className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-volcanic-900 block">Mark as Valid</span>
                        <span className="text-sm text-volcanic-600">The detected change and its severity are correct.</span>
                      </div>
                    </label>
                  </div>

                  {/* Action Group: Correct Severity */}
                  <div className={cn(
                    "rounded-xl border-2 transition p-4",
                    feedbackData[currentReviewId]?.status === 'correction'
                      ? "border-blue-500 bg-blue-50"
                      : "border-marble-200 bg-white"
                  )}>
                    <label className="flex items-start gap-3 cursor-pointer mb-3">
                      <div className="pt-1">
                        <input
                          type="radio"
                          name="review_action"
                          checked={feedbackData[currentReviewId]?.status === 'correction'}
                          onChange={() => handleReviewAction('correction', { category: 'minor' })} // Default to minor
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-volcanic-900 block">Modify Severity / Label</span>
                        <span className="text-sm text-volcanic-600">The change is valid, but the classification is wrong.</span>
                      </div>
                    </label>

                    {feedbackData[currentReviewId]?.status === 'correction' && (
                      <div className="ml-8 grid grid-cols-2 md:grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-1">
                        {[
                          { val: 'major', label: 'Major', color: 'red' },
                          { val: 'minor', label: 'Minor', color: 'yellow' },
                          { val: 'new', label: 'New', color: 'emerald' },
                          { val: 'false_positive', label: 'False Positive', color: 'gray' },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => handleReviewAction('correction', { ...feedbackData[currentReviewId], category: opt.val })}
                            className={cn(
                              "px-3 py-2 rounded-lg text-xs font-bold uppercase border-2 transition",
                              feedbackData[currentReviewId]?.category === opt.val
                                ? `border-${opt.color}-500 bg-${opt.color}-100 text-${opt.color}-700`
                                : "border-marble-300 bg-white text-volcanic-500 hover:border-marble-400"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Group: Report Data Issue */}
                  <div className={cn(
                    "rounded-xl border-2 transition p-4",
                    feedbackData[currentReviewId]?.status === 'issue'
                      ? "border-red-500 bg-red-50"
                      : "border-marble-200 bg-white"
                  )}>
                    <label className="flex items-start gap-3 cursor-pointer mb-3">
                      <div className="pt-1">
                        <input
                          type="radio"
                          name="review_action"
                          checked={feedbackData[currentReviewId]?.status === 'issue'}
                          onChange={() => handleReviewAction('issue', { category: 'extraction_error' })}
                          className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-volcanic-900 block">Report Data Extraction Issue</span>
                        <span className="text-sm text-volcanic-600">The document was parsed incorrectly (PDF extraction error).</span>
                      </div>
                    </label>

                    {feedbackData[currentReviewId]?.status === 'issue' && (
                      <div className="ml-8 space-y-3 animate-in fade-in slide-in-from-top-1">
                        <select
                          className="w-full p-2.5 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                          onChange={(e) => handleReviewAction('issue', { ...feedbackData[currentReviewId], category: e.target.value })}
                          value={feedbackData[currentReviewId]?.category || 'extraction_error'}
                        >
                          <option value="extraction_error">Wrong Text/Extraction (Typos by parser)</option>
                          <option value="section_mismatch">Wrong Section / Header assignment</option>
                          <option value="merge_error">Invalid Comparison (Merged across pages)</option>
                          <option value="hallucination">Hallucination (Content does not exist)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Optional Comment for ALL actions */}
                  <div className="mt-2">
                    <label className="block text-xs font-bold text-volcanic-500 uppercase mb-1 ml-1">Additional Comments (Optional)</label>
                    <textarea
                      placeholder="Add any specific details here..."
                      className="w-full p-3 text-sm border border-marble-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none bg-white text-volcanic-900"
                      onChange={(e) => handleReviewAction(
                        feedbackData[currentReviewId]?.status || 'correct', // preserve status
                        { ...feedbackData[currentReviewId], comment: e.target.value }
                      )}
                      value={feedbackData[currentReviewId]?.comment || ''}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 bg-marble-50 border-t border-marble-200 flex justify-end gap-4">
                {currentReviewIndex > 0 && (
                  <button
                    onClick={() => setCurrentReviewIndex(p => p - 1)}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-volcanic-600 hover:bg-marble-200 transition"
                  >
                    Previous
                  </button>
                )}

                {currentReviewIndex < flaggedChangeIds.length - 1 ? (
                  <button
                    onClick={() => setCurrentReviewIndex(p => p + 1)}
                    className="px-6 py-2 rounded-lg bg-volcanic-900 text-white text-sm font-bold hover:bg-volcanic-800 transition"
                  >
                    Skip / Next
                  </button>
                ) : (
                  <button
                    onClick={submitReview}
                    className="px-8 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
                  >
                    <span>Submit Feedback Package</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>

            </div>

            {/* --- Review Copilot (Chatbot) --- */}
            {/* Toggle Button (Floating) */}
            <button
              onClick={() => setIsChatOpen(prev => !prev)}
              className={cn(
                "absolute bottom-8 right-8 z-50 p-4 rounded-full shadow-xl transition-all duration-300 flex items-center gap-2 group",
                isChatOpen ? "bg-white text-blue-600" : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
              )}
            >
              <div className={cn("transition-transform duration-300", isChatOpen && "rotate-180")}>
                {isChatOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                )}
              </div>
              {!isChatOpen && <span className="font-bold pr-2 group-hover:block hidden animate-in fade-in slide-in-from-right-2">Ask Copilot</span>}
            </button>

            {/* Chat Panel (Slide-over) */}
            <div className={cn(
              "absolute top-0 right-0 h-full w-[350px] bg-white border-l border-marble-200 shadow-2xl z-40 transform transition-transform duration-300 flex flex-col",
              isChatOpen ? "translate-x-0" : "translate-x-full"
            )}>
              <div className="p-4 border-b border-marble-200 bg-marble-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="font-bold text-volcanic-900">Review Copilot</h3>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-marble-50">
                {messages.length === 0 && (
                  <div className="p-4 text-center text-sm text-volcanic-500">
                    <p>Hello! I'm your Review Copilot. I can help interpret changes or draft issue reports. Ask me anything!</p>
                  </div>
                )}
                {messages.map((msg: any, i: number) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] p-3 rounded-2xl text-sm",
                      msg.role === 'user'
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white border border-marble-200 text-volcanic-800 rounded-bl-none shadow-sm"
                    )}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions / Inputs */}
              <div className="p-4 border-t border-marble-200 bg-white space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <button
                    onClick={() => handlePresetAction('explain')}
                    className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap hover:bg-blue-100 transition border border-blue-100"
                  >
                    ✨ Explain this
                  </button>
                  <button
                    onClick={() => handlePresetAction('draft_issue')}
                    className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap hover:bg-red-100 transition border border-red-100"
                  >
                    📝 Draft Issue
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-marble-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={input}
                    onChange={handleInputChange}
                  />
                  <button
                    type="submit"
                    disabled={!input?.trim()}
                    className="absolute right-2 top-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* (Moved to top level) */}


      {/* Tab Navigation (Visible only when not comparing) */}
      {!comparing && (
        <div className="border-b border-marble-300 bg-white px-6 pt-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('selection')}
              className={cn(
                "px-4 py-2 text-p-sm font-medium rounded-t-lg transition",
                activeTab === 'selection'
                  ? "bg-white text-blue-700 border-t-2 border-x-2 border-blue-500 border-b-0"
                  : "text-volcanic-600 hover:text-blue-600"
              )}
            >
              New Comparison
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-4 py-2 text-p-sm font-medium rounded-t-lg transition",
                activeTab === 'history'
                  ? "bg-white text-blue-700 border-t-2 border-x-2 border-blue-500 border-b-0"
                  : "text-volcanic-600 hover:text-blue-600"
              )}
            >
              Run History ({compareHistory.length})
            </button>
          </div>
        </div>
      )}

      {!comparing ? (
        // Selection/History View
        activeTab === 'selection' ? (
          <>
            {/* Review Mode Overlay */}
            {isReviewMode && currentReviewChange && (
              <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
                {/* Review Header */}
                <div className="flex-shrink-0 px-8 py-4 border-b border-marble-200 bg-white shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-volcanic-100 flex items-center justify-center font-bold text-volcanic-600">
                      {currentReviewIndex + 1}
                    </div>
                    <div>
                      <h2 className="text-h5 font-variable text-volcanic-900">Reviewing Item {currentReviewIndex + 1} of {flaggedChangeIds.length}</h2>
                      <p className="text-xs text-volcanic-500">Page {currentReviewChange.location.page} • {currentReviewChange.location.section}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeReview}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-volcanic-600 hover:bg-marble-100 transition"
                  >
                    Exit Review
                  </button>
                </div>

                {/* Review Content - Centered Card */}
                <div className="flex-1 overflow-y-auto p-8 flex items-start justify-center bg-marble-50">
                  <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-marble-200 overflow-hidden">

                    {/* Snapshot of the Change */}
                    <div className="p-8 border-b border-marble-200">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide",
                          currentReviewChange.type === 'major' && "bg-red-100 text-red-700",
                          currentReviewChange.type === 'minor' && "bg-yellow-100 text-yellow-700",
                          currentReviewChange.type === 'new' && "bg-emerald-100 text-emerald-700",
                          currentReviewChange.type === 'deleted' && "bg-volcanic-200 text-volcanic-700"
                        )}>
                          {currentReviewChange.type}
                        </span>
                        <h3 className="text-lg font-bold text-volcanic-900">{currentReviewChange.title}</h3>
                      </div>

                      {/* Simplified view of the content for review */}
                      <div className="p-4 bg-marble-50 rounded-xl border border-marble-200 mb-4">
                        <p className="text-sm text-volcanic-600 mb-2 italic">Reasoning: {currentReviewChange.reasoning}</p>
                        {/* We could render the full diff components here again, but for brevity using simplified text */}
                        <div className="grid grid-cols-2 gap-4 text-sm font-mono mt-4">
                          <div className="p-3 bg-red-50 text-red-800 rounded border border-red-100">
                            <p className="text-[10px] font-bold opacity-70 mb-1">BEFORE</p>
                            {typeof currentReviewChange.before === 'string' ? currentReviewChange.before : 'Complex Object (Table/Image)'}
                          </div>
                          <div className="p-3 bg-emerald-50 text-emerald-800 rounded border border-emerald-100">
                            <p className="text-[10px] font-bold opacity-70 mb-1">AFTER</p>
                            {typeof currentReviewChange.after === 'string' ? currentReviewChange.after : 'Complex Object (Table/Image)'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Triage Actions */}
                    <div className="p-8 bg-white">
                      <h3 className="text-p font-bold text-volcanic-900 mb-4">What is your verdict on this change?</h3>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Option 1: Mark Correct */}
                        <button
                          onClick={() => handleReviewAction('correct')}
                          className={cn(
                            "flex flex-col items-start p-4 rounded-xl border-2 transition text-left hover:shadow-md",
                            feedbackData[currentReviewId]?.status === 'correct'
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-marble-200 hover:border-emerald-300"
                          )}
                        >
                          <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Looks Good
                          </div>
                          <p className="text-xs text-volcanic-600">The comparison is accurate. Remove flag.</p>
                        </button>

                        {/* Option 2: Report Issue */}
                        <div className={cn(
                          "flex flex-col items-start p-4 rounded-xl border-2 transition text-left",
                          feedbackData[currentReviewId]?.status === 'issue'
                            ? "border-red-500 bg-red-50"
                            : "border-marble-200 hover:border-red-300"
                        )}>
                          <button
                            onClick={() => handleReviewAction('issue')}
                            className="w-full text-left"
                          >
                            <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Report Issue
                            </div>
                            <p className="text-xs text-volcanic-600 mb-3">Parsing error, hallucination, or wrong data.</p>
                          </button>

                          {/* Integrated Comment Form for Issues */}
                          {feedbackData[currentReviewId]?.status === 'issue' && (
                            <div className="w-full mt-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                              <select
                                className="w-full p-2 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                onChange={(e) => handleReviewAction('issue', { ...feedbackData[currentReviewId], category: e.target.value })}
                                value={feedbackData[currentReviewId]?.category || ''}
                              >
                                <option value="" disabled>Select Category...</option>
                                <option value="parsing">Parsing / Layout Error</option>
                                <option value="hallucination">Hallucination (Not in Doc)</option>
                                <option value="missing">Missing Information</option>
                                <option value="other">Other</option>
                              </select>
                              <textarea
                                placeholder="Describe the issue..."
                                className="w-full p-2 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
                                onChange={(e) => handleReviewAction('issue', { ...feedbackData[currentReviewId], comment: e.target.value })}
                                value={feedbackData[currentReviewId]?.comment || ''}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-marble-50 border-t border-marble-200 flex justify-end gap-4">
                      {currentReviewIndex > 0 && (
                        <button
                          onClick={() => setCurrentReviewIndex(p => p - 1)}
                          className="px-4 py-2 rounded-lg text-sm font-bold text-volcanic-600 hover:bg-marble-200 transition"
                        >
                          Previous
                        </button>
                      )}

                      {currentReviewIndex < flaggedChangeIds.length - 1 ? (
                        <button
                          onClick={() => setCurrentReviewIndex(p => p + 1)}
                          className="px-6 py-2 rounded-lg bg-volcanic-900 text-white text-sm font-bold hover:bg-volcanic-800 transition"
                        >
                          Skip / Next
                        </button>
                      ) : (
                        <button
                          onClick={submitReview}
                          className="px-8 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
                        >
                          <span>Submit Feedback Package</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

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
          /* Run History View */
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h1 className="text-h3 font-variable text-volcanic-900 mb-2">Comparison History</h1>
                <p className="text-p text-volcanic-600">View and revisit previous delta comparison runs</p>
              </div>

              <div className="space-y-4">
                {compareHistory.map(job => (
                  <div
                    key={job.id}
                    className="rounded-xl border-2 border-marble-200 bg-white p-5 hover:border-emerald-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-p font-bold text-volcanic-900">{job.name}</h3>
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            ✓ Complete
                          </span>

                          {/* Review Status Badge */}
                          {job.reviewStatus === 'reviewed' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold uppercase flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              Reviewed
                            </span>
                          )}
                          {job.reviewStatus === 'issues_reported' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold uppercase flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              Issues Reported
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-volcanic-600 mt-1">Submitted: {job.submittedDate}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {job.versions.map((v, idx) => (
                            <span key={idx} className="px-2 py-1 rounded bg-marble-100 text-xs text-volcanic-700">
                              {v}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-volcanic-700 mt-3 italic">{job.summary}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-xs text-volcanic-600">Total Changes</p>
                          <p className="text-2xl font-bold text-blue-700">{job.totalChanges}</p>
                        </div>
                        <button
                          onClick={() => setComparing(true)}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                        >
                          View Comparison
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      ) : (
        // Comparison Results View - Three Panel Layout
        <>
          {/* Header with version info and Metric */}
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

                {/* Version Chain Navigator */}
                <div className="flex items-center gap-1">
                  {selectedVersions.slice(0, -1).map((vId, idx) => {
                    const docA = availableDocuments.find(d => d.id === vId);
                    const docB = availableDocuments.find(d => d.id === selectedVersions[idx + 1]);
                    const isActivePair = activeVersionIndex === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveVersionIndex(idx)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
                          isActivePair
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-white text-volcanic-600 border-marble-200 hover:bg-marble-50 hover:text-volcanic-900"
                        )}
                      >
                        <span>v{docA?.version}</span>
                        <svg className="w-3 h-3 text-volcanic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span>v{docB?.version}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Metric at top */}
              <div className="flex items-center gap-6 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-volcanic-500">Flagged For Review</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">{getFlaggedCount()}</span>
                </div>

                {flaggedChangeIds.length > 0 && (
                  <button
                    onClick={startReview}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-volcanic-900 text-white hover:bg-volcanic-800 transition shadow-lg animate-pulse-slow"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-bold">START REVIEW ({flaggedChangeIds.length})</span>
                  </button>
                )}

                <div className="h-4 w-px bg-marble-200"></div>
                <div className="text-xs text-volcanic-600 font-medium">
                  {getTotalChanges()} total changes detected
                </div>
              </div>
            </div>
          </header>

          {/* Two-Column Layout with Top Navigation */}
          <div className="flex-1 flex flex-col overflow-hidden bg-marble-980">

            {/* Top Navigation Row: Change Summary & Page Navigator */}
            <div className="flex-shrink-0 border-b border-marble-200 bg-white px-6 py-4 flex items-center justify-between gap-8 shadow-sm z-10">
              {/* Change Summary Pills */}
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-bold text-volcanic-500 uppercase tracking-wider">Filters:</p>
                <div className="flex items-center gap-2">
                  {[
                    { type: 'major', label: 'Major', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', activeBorder: 'border-red-400' },
                    { type: 'minor', label: 'Minor', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', activeBorder: 'border-yellow-400' },
                    { type: 'new', label: 'New', color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', activeBorder: 'border-emerald-400' },
                    { type: 'deleted', label: 'Deleted', color: 'bg-volcanic-400', bgColor: 'bg-marble-100', textColor: 'text-volcanic-700', activeBorder: 'border-volcanic-400' },
                  ].map((item) => {
                    const isActive = filterType === item.type;
                    return (
                      <button
                        key={item.type}
                        onClick={() => setFilterType(isActive ? null : item.type)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-medium",
                          isActive
                            ? `${item.activeBorder} ${item.bgColor} ${item.textColor} shadow-sm ring-1 ring-offset-0 ring-${item.type}-200`
                            : "border-marble-200 bg-white text-volcanic-600 hover:border-marble-400"
                        )}
                      >
                        <span className={cn("w-2 h-2 rounded-full", item.color)}></span>
                        <span>{item.label}</span>
                        <span className="ml-1 opacity-60">({getChangesByType(item.type)})</span>
                      </button>
                    );
                  })}
                </div>
                {filterType && (
                  <button
                    onClick={() => setFilterType(null)}
                    className="text-[10px] text-blue-600 font-bold hover:underline ml-2"
                  >
                    RESET
                  </button>
                )}
              </div>

              {/* Page Navigator */}
              <div className="flex items-center gap-4 border-l border-marble-200 pl-8">
                <p className="text-[10px] font-bold text-volcanic-500 uppercase tracking-wider">Pages:</p>
                <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-md no-scrollbar">
                  {mockPageComparisons.map(page => (
                    <button
                      key={page.pageNumber}
                      onClick={() => setSelectedPage(page.pageNumber)}
                      className={cn(
                        "flex-shrink-0 min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-bold transition relative",
                        selectedPage === page.pageNumber
                          ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-100"
                          : page.totalChanges > 0
                            ? "bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100"
                            : "bg-white border border-marble-200 text-volcanic-400 hover:border-marble-400"
                      )}
                    >
                      {page.pageNumber}
                      {page.totalChanges > 0 && selectedPage !== page.pageNumber && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 border border-white rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub-panels container */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel: Page-wise Comparison (75%) */}
              <div className="flex-[0.75] overflow-y-auto p-8 space-y-6 scroll-smooth">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-marble-200">
                  <div className="flex items-center gap-4">
                    <h3 className="text-h5 font-variable text-volcanic-900">Page {selectedPage} Comparison</h3>
                    <div className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold">
                      {filteredCurrentPageChanges.length} {filteredCurrentPageChanges.length === 1 ? 'change' : 'changes'}
                      {filterType && <span className="ml-1 opacity-70">in {filterType}</span>}
                    </div>
                  </div>
                </div>

                {filteredCurrentPageChanges.length > 0 ? (
                  filteredCurrentPageChanges.map((change: any) => (
                    <div
                      key={change.id}
                      onClick={() => setSelectedChange(change)}
                      className={cn(
                        "p-6 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden shadow-sm",
                        selectedChange?.id === change.id
                          ? "border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-100"
                          : "border-marble-200 bg-white hover:border-blue-300 hover:shadow-md"
                      )}
                    >
                      {/* Flagged Ribbon */}
                      {flaggedChangeIds.includes(change.id) && (
                        <div className="absolute top-0 right-0 z-10">
                          <div className="bg-orange-600 text-white text-[10px] font-bold px-6 py-1 transform rotate-45 translate-x-5 translate-y-1 shadow-sm">
                            FLAGGED
                          </div>
                        </div>
                      )}

                      {/* Change Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide",
                            change.type === 'major' && "bg-red-100 text-red-700",
                            change.type === 'minor' && "bg-yellow-100 text-yellow-700",
                            change.type === 'new' && "bg-emerald-100 text-emerald-700",
                            change.type === 'deleted' && "bg-volcanic-200 text-volcanic-700"
                          )}>
                            {change.type}
                          </span>
                          <div className="h-4 w-px bg-marble-300"></div>
                          <span className="text-sm font-medium text-volcanic-600 font-mono">{change.location.section}</span>
                        </div>
                      </div>

                      <h4 className="text-h6 font-variable text-volcanic-900 mb-2">{change.title}</h4>
                      <p className="text-p-sm text-volcanic-600 mb-6 max-w-3xl leading-relaxed">{change.reasoning}</p>

                      {/* Comparison Assets (Text, Table, Image) */}
                      {/* ... (Existing render logic remains same but container is wider) ... */}
                      {/* Text Comparison */}
                      {change.category === 'text' && (
                        <div className="grid grid-cols-2 gap-4">
                          {change.before && (
                            <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 relative">
                              <p className="text-[10px] font-bold text-red-700 uppercase mb-2">Original Content</p>
                              <p className="text-p-sm text-volcanic-800 line-through opacity-70 leading-relaxed font-mono">{change.before}</p>
                            </div>
                          )}
                          {change.after && (
                            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 relative">
                              <p className="text-[10px] font-bold text-emerald-700 uppercase mb-2">Revised Content</p>
                              <p className="text-p-sm text-volcanic-900 leading-relaxed font-mono">{change.after}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Table Comparison */}
                      {change.category === 'table' && typeof change.before === 'object' && (
                        <div className="rounded-xl border border-marble-200 overflow-hidden bg-white">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-marble-50 text-volcanic-600 border-b border-marble-200">
                                {change.after.headers.map((h: string, i: number) => (
                                  <th key={i} className="px-4 py-3 text-left font-bold">{h}</th>
                                ))}
                                <th className="px-4 py-3 text-left font-bold">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {change.after.rows.map((row: any, i: number) => (
                                <tr key={i} className={cn(
                                  "border-b border-marble-100",
                                  row.change === 'added' && 'bg-emerald-50/30',
                                  row.change === 'modified' && 'bg-yellow-50/30',
                                  row.change === 'removed' && 'bg-red-50/30'
                                )}>
                                  {row.cells.map((c: string, j: number) => (
                                    <td key={j} className="px-4 py-3 text-volcanic-800">{c}</td>
                                  ))}
                                  <td className="px-4 py-3">
                                    {row.change === 'added' && <span className="text-[10px] font-bold text-emerald-700 px-1.5 py-0.5 bg-emerald-100 rounded">ADDED</span>}
                                    {row.change === 'modified' && <span className="text-[10px] font-bold text-orange-600 px-1.5 py-0.5 bg-orange-100 rounded">MODIFIED</span>}
                                    {row.change === 'removed' && <span className="text-[10px] font-bold text-red-600 px-1.5 py-0.5 bg-red-100 rounded">REMOVED</span>}
                                    {!row.change && <span className="text-volcanic-300">—</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Image Comparison */}
                      {change.category === 'image' && (
                        <div className="grid grid-cols-2 gap-8">
                          {[
                            { label: 'Original Asset (v2.0)', data: change.before, type: 'before', color: 'red' },
                            { label: 'Updated Asset (v3.0)', data: change.after, type: 'after', color: 'emerald' }
                          ].map((panel) => (
                            <div key={panel.type} className="flex flex-col gap-3">
                              <p className={cn("text-[11px] font-bold uppercase w-fit px-2 py-0.5 rounded", `text-${panel.color}-700 bg-${panel.color}-50`)}>
                                {panel.label}
                              </p>
                              <div className={cn("border-2 rounded-2xl bg-white h-[400px] flex items-center justify-center p-6 shadow-inner relative group overflow-hidden", `border-${panel.color}-100`)}>
                                <div className="absolute inset-0 bg-marble-50 opacity-30 pointer-events-none"></div>
                                <svg className="w-24 h-24 text-volcanic-200 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {panel.data && (
                                  <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur rounded-lg text-xs text-volcanic-500 font-mono border border-marble-200 shadow-sm transition-opacity group-hover:opacity-100">
                                    {panel.type === 'before' ? 'source_v2.0.pdf' : 'source_v3.0.pdf'}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[60vh] text-volcanic-400">
                    <div className="bg-marble-100 p-8 rounded-full mb-4">
                      <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-h5 font-variable text-volcanic-500 mb-2">No Matches Found</h4>
                    <p className="text-p text-volcanic-400 max-w-md text-center">
                      There are no {filterType} changes listed on Page {selectedPage}. Try switching pages or clearing the filter.
                    </p>
                    <button onClick={() => setFilterType(null)} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Right Panel: Detail View (25%) */}
              <div className="flex-[0.25] border-l border-marble-200 bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.02)] z-10 p-8 overflow-y-auto">
                {selectedChange ? (
                  <div className="space-y-8 h-full flex flex-col">
                    <div>
                      <p className="text-[10px] font-bold text-volcanic-500 uppercase tracking-widest mb-4">Focus Item</p>
                      <h4 className="text-h4 font-variable text-volcanic-900 leading-tight mb-2">{selectedChange.title}</h4>
                      <div className="flex items-center gap-2 text-p-sm text-volcanic-500">
                        <span className="font-mono bg-marble-100 px-2 py-0.5 rounded">{selectedChange.location.section}</span>
                        <span>•</span>
                        <span>Page {selectedChange.location.page}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-secondary-50 p-6 rounded-2xl border border-marble-100">
                        <p className="text-[10px] font-bold text-volcanic-600 uppercase mb-3 tracking-wide">AI reasoning</p>
                        <p className="text-p-sm text-volcanic-800 leading-relaxed font-serif italic">
                          "{selectedChange.reasoning}"
                        </p>
                      </div>

                      <div className="p-1 px-1 py-1">
                        <p className="text-[10px] font-bold text-volcanic-600 uppercase mb-4 tracking-wide">Criticality Score</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-volcanic-700">Priority Level</span>
                            <span className="font-bold text-blue-700">{selectedChange.metadata.impactScore}/10</span>
                          </div>
                          <div className="flex gap-[3px]">
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "flex-1 h-3 rounded-full transition-all duration-500",
                                  i < selectedChange.metadata.impactScore
                                    ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                                    : "bg-marble-200"
                                )}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-marble-100 space-y-3">
                      <button
                        onClick={() => toggleFlag(selectedChange.id)}
                        className={cn(
                          "w-full px-6 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3",
                          flaggedChangeIds.includes(selectedChange.id)
                            ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                            : "bg-white border-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                        )}
                      >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{flaggedChangeIds.includes(selectedChange.id) ? "Remove Flag" : "Flag For Review"}</span>
                      </button>
                      <button className="w-full px-6 py-4 rounded-xl border-2 border-marble-200 bg-white text-volcanic-700 font-bold text-sm hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                        <span>Mark as Resolved</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-volcanic-400 text-center p-8">
                    <div className="bg-marble-50 p-6 rounded-3xl mb-4">
                      <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <p className="text-p-sm font-medium">Select a change in the list to view its deep-dive analysis</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
