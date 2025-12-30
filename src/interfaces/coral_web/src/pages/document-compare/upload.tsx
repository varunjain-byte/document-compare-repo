import { DehydratedState, QueryClient, dehydrate } from '@tanstack/react-query';
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';

import { CohereClient } from '@/cohere-client';
import { Layout, LayoutSection } from '@/components/Layout';
import { appSSR } from '@/pages/_app';

const uploadCards = [
  { title: 'Agreement A', detail: 'PDF, 42 pages', status: 'Not uploaded' },
  { title: 'Agreement B', detail: 'PDF, 37 pages', status: 'Not uploaded' },
  { title: 'Annex C', detail: 'PDF, 18 pages', status: 'Not uploaded' },
];

const navLinks = [
  { href: '/document-compare', label: 'Portal' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Structured Format' },
  { href: '/document-compare/compare', label: 'Compare' },
  { href: '/document-compare/deep-dive', label: 'Deep dive' },
];

const DocumentUploadPage: NextPage = () => {
  return (
    <Layout title="Upload">
      <LayoutSection.LeftDrawer>
        <aside className="flex h-full flex-col gap-6 px-4 py-6">
          <Link href="/document-compare" className="flex items-center">
            <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
          </Link>
          <div className="space-y-2">
            <p className="text-label uppercase tracking-[0.3em] text-blue-700">Upload</p>
            <h2 className="text-h5 font-variable text-volcanic-900">Comparison Set</h2>
            <p className="text-p-sm text-volcanic-600">
              Add PDFs to a named set before parsing and comparing.
            </p>
          </div>
          <div className="rounded-2xl border border-marble-400 bg-white p-4">
            <p className="text-label text-volcanic-600">Navigation</p>
            <div className="mt-3 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = link.href === '/document-compare/upload';
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
          <div className="pointer-events-none absolute -top-32 right-8 h-72 w-72 rounded-full bg-blue-200/70 blur-3xl" />
          <div className="relative flex flex-col gap-8 p-6 lg:p-10">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-label text-volcanic-600">Upload set</p>
                <h1 className="text-h3 font-variable text-volcanic-900">
                  Create a comparison batch
                </h1>
                <p className="text-p text-volcanic-700">
                  Name the batch and upload the PDFs you want to compare.
                </p>
              </div>
              <button className="rounded-full bg-blue-700 px-5 py-2 text-p text-white shadow-md transition hover:bg-blue-900">
                New batch
              </button>
            </header>

            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-marble-400 bg-white p-6 shadow-sm">
                <p className="text-label text-volcanic-600">Batch details</p>
                <h2 className="text-h4 font-variable text-volcanic-900">ZF Supplier Review</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {['Batch ID: ZF-2024-048', 'Owner: Procurement', 'Region: EMEA', 'Due: 12 Mar'].map(
                    (item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-marble-300 bg-secondary-50 px-4 py-3 text-p-sm text-volcanic-700"
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-full bg-blue-700 px-4 py-2 text-p-sm text-white">
                    Upload PDFs
                  </button>
                  <button className="rounded-full border border-blue-200 px-4 py-2 text-p-sm text-blue-700">
                    Connect SharePoint
                  </button>
                  <button className="rounded-full border border-blue-200 px-4 py-2 text-p-sm text-blue-700">
                    Import from Drive
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-marble-400 bg-white p-6 shadow-sm">
                <p className="text-label text-volcanic-600">Files in batch</p>
                <h2 className="text-h4 font-variable text-volcanic-900">Upload checklist</h2>
                <div className="mt-4 space-y-3">
                  {uploadCards.map((card) => (
                    <div
                      key={card.title}
                      className="flex items-center justify-between rounded-xl border border-marble-300 bg-secondary-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-p text-volcanic-800">{card.title}</p>
                        <p className="text-p-xs text-volcanic-600">{card.detail}</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-label text-blue-700">
                        {card.status}
                      </span>
                    </div>
                  ))}
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

export default DocumentUploadPage;
