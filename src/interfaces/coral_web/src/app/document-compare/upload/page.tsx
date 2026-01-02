'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { cn } from '@/utils/cn';
import { useFileActions, useListFiles } from '@/hooks/files';
import { useConversationStore } from '@/stores';
import { formatFileSize } from '@/utils';
import { MOCK_FILES } from '@/mocks/mockFiles';

const navLinks = [
  { href: '/document-compare', label: 'Home' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Document validator' },
  { href: '/document-compare/compare', label: 'Delta Compare' },
  { href: '/document-compare/deep-dive', label: 'Similarity Matcher' },
];

export default function DocumentUploadPage() {
  const [viewMode, setViewMode] = useState<'table' | 'finder'>('table');
  const { conversation } = useConversationStore();
  const { data: serverFiles = [] } = useListFiles(conversation.id, { enabled: !!conversation.id });

  // Use mock data if server list is empty (for demo)
  const files = serverFiles.length > 0 ? serverFiles : MOCK_FILES;

  const { uploadFiles, deleteFile } = useFileActions();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Auto-select first file for preview
  useEffect(() => {
    if (files.length > 0 && !selectedFileId) {
      setSelectedFileId(files[0].id);
    }
  }, [files, selectedFileId]);

  const selectedFile = files.find(f => f.id === selectedFileId) || files[0];

  const handleViewerUpload = async (filesToUpload?: FileList | null) => {
    if (!filesToUpload) return;
    const fileArray = Array.from(filesToUpload);
    await uploadFiles(fileArray, conversation.id);
  };

  const handleDelete = async (fileId: string) => {
    if (!conversation.id) return;
    await deleteFile({ conversationId: conversation.id, fileId });
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
      <div className="flex-1 p-6 lg:p-10">
        <header className="mb-8">
          <p className="text-label text-volcanic-300 uppercase tracking-widest">Workspace</p>
          <h1 className="text-h3 font-variable text-volcanic-200">Upload Documents</h1>
          <p className="text-p text-volcanic-400 mt-2">Manage your comparison batch in a unified workspace.</p>
        </header>

        <section className="grid lg:grid-cols-3 gap-8">
          {/* Row 1: Drop Zone & Folder Summary */}
          <div className="lg:col-span-2">
            <div className="relative group h-full rounded-3xl border-2 border-dashed border-marble-400 bg-secondary-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 p-10 text-center cursor-pointer flex flex-col items-center justify-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-h5 text-volcanic-100 font-medium">Drag & Drop PDFs here</h3>
              <p className="text-p-sm text-volcanic-400 mt-2 max-w-sm mx-auto">
                Support for PDF files up to 50MB. Drag multiple files to create a batch.
              </p>
              <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-p-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
                Browse Files
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => handleViewerUpload(e.target.files)}
                />
              </label>
            </div>
          </div>

          <aside className="lg:col-span-1 h-full">
            <div className="h-full rounded-2xl border border-blue-100 bg-blue-50/50 p-6 flex flex-col justify-center">
              <h3 className="text-label text-blue-800 uppercase tracking-widest mb-4">Folder Summary</h3>
              <div className="flex items-center justify-center py-6">
                {/* CSS-only Donut Chart Placeholder */}
                <div className="relative h-32 w-32 rounded-full border-[8px] border-white shadow-sm flex items-center justify-center bg-blue-100">
                  <span className="text-h4 font-bold text-blue-600">{files.length}</span>
                  <span className="absolute text-p-xs text-blue-400 -bottom-6">Files</span>
                </div>
              </div>
              <ul className="space-y-3 mt-4">
                <li className="flex justify-between text-p-sm">
                  <span className="text-volcanic-500">Total Files</span>
                  <span className="text-volcanic-100 font-medium">{files.length}</span>
                </li>
                <li className="flex justify-between text-p-sm">
                  <span className="text-volcanic-500">Total Size</span>
                  <span className="text-volcanic-100 font-medium">
                    {formatFileSize(files.reduce((acc, f) => acc + (f.file_size || 0), 0))}
                  </span>
                </li>
                <li className="flex justify-between text-p-sm">
                  <span className="text-volcanic-500">Last Modified</span>
                  <span className="text-blue-600 font-medium">Just now</span>
                </li>
              </ul>
            </div>
          </aside>

          {/* Row 2: Document Manager (Full Width) */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-h5 text-volcanic-200">Document Manager</h3>
                <div className="flex items-center gap-2 rounded-lg bg-secondary-50 p-1 border border-marble-400">
                  <button
                    onClick={() => setViewMode('table')}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-label transition-all',
                      viewMode === 'table' ? 'bg-white shadow-sm text-blue-700' : 'text-volcanic-400 hover:text-volcanic-600'
                    )}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('finder')}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-label transition-all',
                      viewMode === 'finder' ? 'bg-white shadow-sm text-blue-700' : 'text-volcanic-400 hover:text-volcanic-600'
                    )}
                  >
                    Finder
                  </button>
                </div>
              </div>

              {viewMode === 'table' ? (
                /* Interactive Table View */
                <div className="overflow-hidden rounded-2xl border border-marble-400 bg-white shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-marble-200 text-label text-volcanic-400 bg-secondary-50/50">
                        <th className="py-3 pl-6 font-medium tracking-wider">Name</th>
                        <th className="py-3 font-medium tracking-wider">Status</th>
                        <th className="py-3 font-medium tracking-wider">Size</th>
                        <th className="py-3 pr-6 text-right font-medium tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map(file => (
                        <tr key={file.id} className="group border-b border-marble-100 last:border-0 hover:bg-secondary-50 transition-colors">
                          <td className="py-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-p-sm font-medium text-volcanic-100">{file.file_name}</p>
                                <p className="text-p-xs text-volcanic-400">PDF</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            {(file as any).status === 'parsed' || (file as any).status === 'PARSED' ? (
                              <span className="px-2 py-1 rounded-full text-[10px] uppercase border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                                Parsed
                              </span>
                            ) : (
                              <Link href="/document-compare/parse">
                                <button className="px-3 py-1.5 rounded-md text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm flex items-center gap-1">
                                  <span>Start Parsing</span>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                                </button>
                              </Link>
                            )}
                          </td>
                          <td className="py-4 text-p-sm text-volcanic-500 font-mono">{formatFileSize(file.file_size || 0)}</td>
                          <td className="py-4 pr-6 text-right">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                              <button
                                onClick={() => handleDelete(file.id)}
                                className="px-3 py-1 rounded-md text-label border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all bg-white shadow-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {files.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-p-sm text-volcanic-400">
                            No files uploaded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Finder Split View */
                <div className="flex h-[500px] overflow-hidden rounded-2xl border border-marble-400 bg-white shadow-sm">
                  {/* List Pane */}
                  <div className="w-1/3 border-r border-marble-300 overflow-y-auto bg-secondary-50/30">
                    <div className="p-3">
                      <h4 className="text-label text-volcanic-400 uppercase tracking-wider mb-2 px-2">Files</h4>
                      <div className="space-y-1">
                        {files.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => setSelectedFileId(file.id)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-p-sm transition-colors flex items-center gap-2",
                              selectedFile?.id === file.id
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "hover:bg-secondary-100 text-volcanic-600"
                            )}
                          >
                            <svg className="w-4 h-4 text-volcanic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="truncate">{file.file_name}</span>
                          </button>
                        ))}
                        {files.length === 0 && (
                          <div className="px-3 py-2 text-p-sm text-volcanic-400">No files</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview Pane */}
                  <div className="w-2/3 flex flex-col items-center justify-center bg-dots-pattern p-8 relative">
                    {/* Paper Preview */}
                    {selectedFile ? (
                      <div className="w-[70%] aspect-[1/1.414] bg-white shadow-2xl border border-marble-200 rounded-lg flex flex-col items-center justify-center p-8 transition-all hover:scale-[1.02]">
                        <div className="h-16 w-16 mb-4 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-h5 text-volcanic-100 text-center mb-1">{selectedFile.file_name}</h3>
                        <p className="text-p-sm text-volcanic-400 mb-6">PDF • {formatFileSize(selectedFile.file_size || 0)}</p>
                        <button className="rounded-full bg-volcanic-900 px-6 py-2 text-p-sm font-medium text-white hover:bg-volcanic-700 transition-colors shadow-lg">
                          Open Preview
                        </button>
                      </div>
                    ) : (
                      <p className="text-p text-volcanic-400">Select a file to preview</p>
                    )}
                    <div className="absolute bottom-4 text-p-xs text-volcanic-400">
                      Finder Preview Mode
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
