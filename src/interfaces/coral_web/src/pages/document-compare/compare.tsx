import { DehydratedState, QueryClient, dehydrate } from '@tanstack/react-query';
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';

import { CohereClient } from '@/cohere-client';
import { Layout, LayoutSection } from '@/components/Layout';
import { appSSR } from '@/pages/_app';
import { cn } from '@/utils/cn';

const documents = [
  {
    id: 'doc-a',
    title: 'Agreement A',
    meta: 'PDF · 42 pages · Uploaded 2m ago',
    status: 'Ready',
  },
  {
    id: 'doc-b',
    title: 'Agreement B',
    meta: 'PDF · 37 pages · Uploaded 5m ago',
    status: 'Ready',
  },
  {
    id: 'doc-c',
    title: 'Annex C',
    meta: 'PDF · 18 pages · Missing upload',
    status: 'Missing',
  },
];

const changeBadges = [
  { label: 'Major', className: 'bg-blue-700 text-white' },
  { label: 'Minor', className: 'bg-blue-100 text-blue-700' },
  { label: 'New', className: 'bg-green-100 text-green-700' },
  { label: 'Deleted', className: 'bg-secondary-200 text-volcanic-700' },
];

const diffLines = [
  { type: 'context', text: '2.1 Payment schedule' },
  { type: 'remove', text: '- Net 30 days from invoice receipt.' },
  { type: 'add', text: '+ Net 45 days from invoice receipt.' },
  { type: 'context', text: '2.2 Termination' },
  { type: 'remove', text: '- Either party may terminate with 60 days notice.' },
  { type: 'add', text: '+ Either party may terminate with 90 days notice.' },
];

const topMetrics = [
  { label: 'Major', value: '8', detail: 'High impact' },
  { label: 'Minor', value: '12', detail: 'Low impact' },
  { label: 'New', value: '6', detail: 'Added content' },
  { label: 'Deleted', value: '4', detail: 'Removed content' },
  { label: 'Match score', value: '87%', detail: 'Across docs' },
];

const navLinks = [
  { href: '/document-compare', label: 'Portal' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Structured Format' },
  { href: '/document-compare/compare', label: 'Compare' },
  { href: '/document-compare/deep-dive', label: 'Deep dive' },
];

const evidenceItems = [
  {
    title: 'UDS Diagnostic Table',
    type: 'Table',
    change: 'Major',
    detail: 'New DTC added and response length updated in Doc B.',
  },
  {
    title: 'Figure 6 Process flow',
    type: 'Image',
    change: 'Minor',
    detail: 'Legend updated; layout unchanged.',
  },
  {
    title: 'Clause 5.3 Audit rights',
    type: 'Text',
    change: 'New',
    detail: 'Added in Doc B; aligns with compliance addendum.',
  },
];

const udsRows = [
  {
    service: '0x22',
    name: 'ReadDataByIdentifier',
    id: 'F190',
    a: 'VIN',
    b: 'VIN',
    change: 'Minor',
  },
  {
    service: '0x19',
    name: 'ReadDTCInformation',
    id: '02',
    a: '3 DTCs',
    b: '4 DTCs',
    change: 'Major',
  },
  {
    service: '0x2E',
    name: 'WriteDataByIdentifier',
    id: 'F187',
    a: 'Not supported',
    b: 'Enabled',
    change: 'New',
  },
  {
    service: '0x14',
    name: 'ClearDiagnosticInformation',
    id: 'FF',
    a: 'Allowed',
    b: 'Blocked',
    change: 'Major',
  },
];

const DocumentComparePage: NextPage = () => {
  return (
    <Layout title="Compare documents">
      <LayoutSection.LeftDrawer>
        <aside className="flex h-full flex-col gap-6 px-4 py-6">
          <Link href="/document-compare" className="flex items-center">
            <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
          </Link>
          <div className="space-y-2">
            <p className="text-label uppercase tracking-[0.3em] text-blue-700">Compare</p>
            <h2 className="text-h5 font-variable text-volcanic-900">Diff Workspace</h2>
            <p className="text-p-sm text-volcanic-600">
              Select the documents to compare, then review changes by type.
            </p>
          </div>
          <div className="rounded-2xl border border-marble-400 bg-white p-4">
            <p className="text-label text-volcanic-600">Navigation</p>
            <div className="mt-3 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = link.href === '/document-compare/compare';
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg border px-3 py-2 text-p-sm ${
                      isActive
                        ? 'border-blue-200 bg-secondary-50 text-volcanic-800'
                        : 'border-marble-300 bg-white text-blue-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </LayoutSection.LeftDrawer>
      <LayoutSection.Main>
        <div className="relative flex h-full flex-col overflow-y-auto">
          <div className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-blue-200/60 blur-3xl" />
          <div className="relative flex flex-col gap-6 p-6 lg:p-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-label text-volcanic-600">Document comparison</p>
                <h1 className="text-h3 font-variable text-volcanic-900">
                  Multi-panel compare workspace
                </h1>
                <p className="text-p text-volcanic-700">
                  Pick the files, review inline diffs, then inspect evidence for tables and images.
                </p>
              </div>
              <button className="rounded-full bg-blue-700 px-5 py-2 text-p text-white shadow-md transition hover:bg-blue-900">
                Run comparison
              </button>
            </header>

            <section className="grid gap-3 lg:grid-cols-5">
              {topMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-marble-300 bg-white px-4 py-3 shadow-sm"
                >
                  <p className="text-label text-volcanic-600">{metric.label}</p>
                  <p className="text-h4 font-variable text-blue-900">{metric.value}</p>
                  <p className="text-p-xs text-volcanic-600">{metric.detail}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr_1fr]">
              <div className="flex flex-col gap-4 rounded-2xl border border-marble-400 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-volcanic-600">Document set</p>
                    <h2 className="text-h5 font-variable text-volcanic-900">Select files</h2>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-label text-blue-700">
                    2 selected
                  </span>
                </div>
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div
                      key={doc.id}
                      className={cn(
                        'rounded-xl border p-3 transition',
                        doc.status === 'Missing'
                          ? 'border-secondary-200 bg-secondary-50'
                          : 'border-blue-100 bg-blue-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-p font-medium text-volcanic-900">{doc.title}</p>
                          <p className="text-p-xs text-volcanic-600">{doc.meta}</p>
                        </div>
                        <span
                          className={cn(
                            'rounded-full px-2 py-1 text-label',
                            doc.status === 'Missing'
                              ? 'bg-secondary-200 text-volcanic-600'
                              : 'bg-blue-100 text-blue-700'
                          )}
                        >
                          {doc.status}
                        </span>
                      </div>
                      <button
                        className={cn(
                          'mt-3 w-full rounded-full border px-3 py-1 text-p-sm',
                          index < 2
                            ? 'border-blue-200 text-blue-700'
                            : 'border-secondary-200 text-volcanic-600'
                        )}
                      >
                        {index < 2 ? 'Selected' : 'Select document'}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-marble-300 bg-white p-3">
                  <p className="text-label text-volcanic-600">Comparison mode</p>
                  <div className="mt-3 grid gap-2">
                    {['Clause diff', 'Table alignment', 'Image similarity'].map((mode, idx) => (
                      <div key={mode} className="flex items-center justify-between rounded-lg bg-secondary-50 px-3 py-2">
                        <span className="text-p-sm text-volcanic-700">{mode}</span>
                        <span className="text-label text-blue-700">{idx === 0 ? 'On' : 'On'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-marble-400 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-volcanic-600">Inline diff</p>
                    <h2 className="text-h5 font-variable text-volcanic-900">Clause comparison</h2>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-label text-blue-700">
                    Doc A vs Doc B
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {changeBadges.map((badge) => (
                    <span
                      key={badge.label}
                      className={`rounded-full px-3 py-1 text-label ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
                <div className="flex-1 space-y-2 rounded-xl border border-marble-300 bg-secondary-50 p-4 font-code text-code-sm">
                  {diffLines.map((line, index) => (
                    <div
                      key={`${line.text}-${index}`}
                      className={
                        line.type === 'add'
                          ? 'rounded-md bg-blue-100 px-3 py-2 text-blue-900'
                          : line.type === 'remove'
                            ? 'rounded-md bg-secondary-200 px-3 py-2 text-volcanic-700 line-through'
                            : 'px-3 py-2 text-volcanic-700'
                      }
                    >
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-marble-400 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-volcanic-600">Evidence</p>
                    <h2 className="text-h5 font-variable text-volcanic-900">Table & image changes</h2>
                  </div>
                  <button className="rounded-full border border-blue-200 px-3 py-1 text-p-sm text-blue-700">
                    Export log
                  </button>
                </div>
                <Link
                  href="/document-compare/deep-dive"
                  className="rounded-full bg-blue-700 px-4 py-2 text-center text-p-sm text-white"
                >
                  Open deep dive
                </Link>
                <div className="space-y-3">
                  {evidenceItems.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-marble-300 bg-secondary-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-p text-volcanic-800">{item.title}</p>
                          <p className="text-p-xs text-volcanic-600">{item.type}</p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-label text-blue-700">
                          {item.change}
                        </span>
                      </div>
                      <p className="mt-2 text-p-xs text-volcanic-600">{item.detail}</p>
                      {item.type === 'Table' ? (
                        <div className="mt-3 overflow-hidden rounded-lg border border-marble-300 bg-white">
                          <div className="grid grid-cols-[0.8fr_1.2fr_0.6fr_0.7fr_0.7fr_0.6fr] bg-secondary-50 text-label text-volcanic-600">
                            <div className="px-3 py-2">Service</div>
                            <div className="px-3 py-2">Name</div>
                            <div className="px-3 py-2">DID/Req</div>
                            <div className="px-3 py-2">Doc A</div>
                            <div className="px-3 py-2">Doc B</div>
                            <div className="px-3 py-2">Change</div>
                          </div>
                          {udsRows.map((row) => (
                            <div
                              key={`${row.service}-${row.id}`}
                              className="grid grid-cols-[0.8fr_1.2fr_0.6fr_0.7fr_0.7fr_0.6fr] border-t border-marble-300 text-p-xs text-volcanic-700"
                            >
                              <div className="px-3 py-2">{row.service}</div>
                              <div className="px-3 py-2">{row.name}</div>
                              <div className="px-3 py-2">{row.id}</div>
                              <div className="px-3 py-2">{row.a}</div>
                              <div className="px-3 py-2">{row.b}</div>
                              <div className="px-3 py-2">
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-label text-blue-700">
                                  {row.change}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 h-16 rounded-lg bg-gradient-to-br from-blue-100 via-secondary-100 to-white" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-marble-300 bg-white p-4">
                  <p className="text-label text-volcanic-600">Activity</p>
                  <div className="mt-3 space-y-2 text-p-sm text-volcanic-700">
                    <div className="flex items-center justify-between">
                      <span>Table variance flagged</span>
                      <span className="text-blue-700">Major</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Image similarity below threshold</span>
                      <span className="text-blue-700">Minor</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New clause detected</span>
                      <span className="text-green-700">New</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>
        </div>
      </LayoutSection.Main>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const deps = appSSR.initialize() as {
    queryClient: QueryClient;
    cohereClient: CohereClient;
  };

  return {
    props: {
      appProps: {
        reactQueryState: dehydrate(deps.queryClient),
      },
    },
  };
};

export default DocumentComparePage;
