'use client';

import Link from 'next/link';

import { Layout } from '@/components/Layout';

const udsRows = [
  { service: '0x22', name: 'ReadDataByIdentifier', id: 'F190', a: 'VIN', b: 'VIN', change: 'Minor' },
  { service: '0x19', name: 'ReadDTCInformation', id: '02', a: '3 DTCs', b: '4 DTCs', change: 'Major' },
  { service: '0x2E', name: 'WriteDataByIdentifier', id: 'F187', a: 'Not supported', b: 'Enabled', change: 'New' },
  { service: '0x14', name: 'ClearDiagnosticInformation', id: 'FF', a: 'Allowed', b: 'Blocked', change: 'Major' },
];

const imageItems = [
  { label: 'Doc A', change: 'Minor', detail: 'Legend updated; layout unchanged.' },
  { label: 'Doc B', change: 'Minor', detail: 'Legend updated; layout unchanged.' },
  { label: 'Doc C', change: 'New', detail: 'New overlay added for error flow.' },
];

const navLinks = [
  { href: '/document-compare', label: 'Portal' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Structured Format' },
  { href: '/document-compare/compare', label: 'Compare' },
  { href: '/document-compare/deep-dive', label: 'Deep dive' },
];

export default function DocumentDeepDivePage() {
  const leftDrawerElement = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-2">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">Deep dive</p>
        <h2 className="text-h5 font-variable text-volcanic-900">Evidence review</h2>
        <p className="text-p-sm text-volcanic-600">
          Detailed diffs for tables and images in the selected comparison set.
        </p>
      </div>
      <div className="rounded-2xl border border-marble-400 bg-white p-4">
        <p className="text-label text-volcanic-600">Navigation</p>
        <div className="mt-3 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = link.href === '/document-compare/deep-dive';
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
  );

  const mainElement = (
    <div className="relative flex h-full flex-col overflow-y-auto bg-white text-volcanic-900">
      <div className="relative flex flex-col gap-6 p-6 lg:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-label text-volcanic-600">Deep dive</p>
            <h1 className="text-h3 font-variable text-volcanic-900">Table and image diffs</h1>
            <p className="text-p text-volcanic-700">
              Focused review for UDS diagnostics tables and image changes.
            </p>
          </div>
          <button className="rounded-full bg-blue-700 px-5 py-2 text-p text-white shadow-md transition hover:bg-blue-900">
            Export deep dive
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-marble-400 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label text-volcanic-600">Table diff</p>
                <h2 className="text-h4 font-variable text-volcanic-900">UDS Diagnostic Table</h2>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-label text-blue-700">
                Doc A vs Doc B
              </span>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-marble-300 bg-white">
              <div className="grid grid-cols-[0.8fr_1.4fr_0.6fr_0.7fr_0.7fr_0.6fr] bg-secondary-50 text-label text-volcanic-600">
                <div className="px-3 py-2">Service</div>
                <div className="px-3 py-2">Name</div>
                <div className="px-3 py-2">DID/Req</div>
                <div className="px-3 py-2">Doc A</div>
                <div className="px-3 py-2">Doc B</div>
                <div className="px-3 py-2">Change</div>
              </div>
              {udsRows.map((row) => (
                <div
                  key={`${row.service}-${row.id}-deep`}
                  className="grid grid-cols-[0.8fr_1.4fr_0.6fr_0.7fr_0.7fr_0.6fr] border-t border-marble-300 text-p-xs text-volcanic-700"
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
          </div>

          <div className="rounded-2xl border border-marble-400 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label text-volcanic-600">Image diff</p>
                <h2 className="text-h4 font-variable text-volcanic-900">Figure 6</h2>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-label text-blue-700">3 variants</span>
            </div>
            <div className="mt-4 space-y-3">
              {imageItems.map((item) => (
                <div key={item.label} className="rounded-xl border border-marble-300 bg-secondary-50 p-4">
                  <div className="flex items-center justify-between text-p-xs text-volcanic-600">
                    <span>{item.label}</span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-label text-blue-700">
                      {item.change}
                    </span>
                  </div>
                  <div className="mt-3 h-24 rounded-lg bg-gradient-to-br from-blue-100 via-secondary-100 to-white" />
                  <p className="mt-2 text-p-xs text-volcanic-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return <Layout leftDrawerElement={leftDrawerElement} mainElement={mainElement} />;
}
