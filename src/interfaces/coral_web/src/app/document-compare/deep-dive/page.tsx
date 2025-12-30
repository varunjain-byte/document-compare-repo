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

const versionChain = [
  { tag: 'v2', label: 'Baseline', meta: 'Oct 12', active: false },
  { tag: 'v3', label: 'Review', meta: 'Nov 05', active: false },
  { tag: 'v4', label: 'Current Draft', meta: 'Active', active: true },
];

const changeSummary = [
  { label: 'Total changes', value: '24' },
  { label: 'New', value: '12' },
  { label: 'Modified', value: '8' },
  { label: 'Deleted', value: '4' },
];

const changeCards = [
  {
    id: 'REQ-004',
    title: 'Clause 2.1 Payment schedule',
    type: 'Clause',
    impact: 'Major',
    detail: 'Net 30 → Net 45 days; penalty clause updated.',
  },
  {
    id: 'TABLE-UDS-01',
    title: 'UDS Diagnostic Table row updates',
    type: 'Table',
    impact: 'Major',
    detail: 'New DTC added and response length updated in Doc B.',
  },
  {
    id: 'IMG-06',
    title: 'Process flow figure',
    type: 'Image',
    impact: 'Minor',
    detail: 'Legend clarified; layout unchanged across versions.',
  },
];

const navLinks = [
  { href: '/document-compare', label: 'Portal' },
  { href: '/document-compare/upload', label: 'Upload' },
  { href: '/document-compare/parse', label: 'Parse PDFs' },
  { href: '/document-compare/structure', label: 'Document validator' },
  { href: '/document-compare/compare', label: 'Compare' },
  { href: '/document-compare/deep-dive', label: 'Deep dive' },
];

export default function DocumentDeepDivePage() {
  const leftDrawerElement = (
    <aside className="flex h-full flex-col gap-6 px-4 py-6 text-volcanic-900">
      <Link href="/document-compare" className="flex items-center">
        <img src="/images/zf-logo.png" alt="ZF Logo" className="h-10 w-auto" />
      </Link>
      <div className="space-y-2 text-volcanic-900">
        <p className="text-label uppercase tracking-[0.3em] text-blue-700">Deep dive</p>
        <h2 className="text-h5 font-variable text-volcanic-900">Evidence review</h2>
        <p className="text-p-sm text-volcanic-600">
          Detailed diffs for tables and images in the selected comparison set.
        </p>
      </div>
      <div className="rounded-2xl border border-marble-500 bg-white p-4">
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
      <div className="relative flex flex-col gap-8 p-6 lg:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-label text-volcanic-600">Deep dive</p>
            <h1 className="text-h3 font-variable text-volcanic-900">Evidence review workspace</h1>
            <p className="text-p text-volcanic-700">
              Version chain, change filters, and focused diffs for tables and images.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full border border-marble-500 px-4 py-2 text-p text-volcanic-800 transition hover:border-blue-700 hover:text-blue-800">
              Change log
            </button>
            <button className="rounded-full bg-blue-700 px-5 py-2 text-p text-white shadow-md transition hover:bg-blue-900">
              Export deep dive
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-marble-400 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex-1">
              <p className="text-label text-volcanic-600">Comparing version chain</p>
              <div className="mt-3 flex flex-col gap-3 rounded-xl border border-marble-300 bg-secondary-50 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  {versionChain.map((item) => (
                    <div
                      key={item.tag}
                      className={`flex min-w-[160px] items-center gap-3 rounded-lg border bg-white px-3 py-2 shadow-sm ${
                        item.active ? 'border-blue-400 ring-1 ring-blue-100' : 'border-marble-300'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-label font-semibold ${
                          item.active
                            ? 'bg-blue-700 text-white'
                            : 'bg-secondary-100 text-volcanic-700 border border-marble-300'
                        }`}
                      >
                        {item.tag}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-p-sm font-semibold text-volcanic-900">{item.label}</span>
                        <span
                          className={`text-label ${item.active ? 'text-blue-700' : 'text-volcanic-600'}`}
                        >
                          {item.meta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 xl:pb-0">
              {changeSummary.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-[140px] rounded-lg border border-marble-300 bg-white px-4 py-3 shadow-sm"
                >
                  <p className="text-label text-volcanic-600">{stat.label}</p>
                  <div className="mt-1 flex items-end gap-1">
                    <span className="text-2xl font-semibold text-volcanic-900">{stat.value}</span>
                    <span className="mb-1 text-label text-volcanic-600">items</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sticky top-4 z-10 rounded-xl border border-marble-400 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {['All changes', 'New', 'Modified', 'Removed'].map((filter, index) => {
                const isActive = index === 0;
                return (
                  <button
                    key={filter}
                    className={`rounded-full px-4 py-2 text-p-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-700 text-white shadow-sm ring-1 ring-blue-200'
                        : 'border border-marble-400 text-volcanic-800 hover:border-blue-700 hover:text-blue-800'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select className="rounded-lg border border-marble-400 bg-secondary-50 px-3 py-2 text-p-sm text-volcanic-800 focus:border-blue-700 focus:outline-none">
                <option>Jump to requirement</option>
                <option>REQ-004: Payment schedule</option>
                <option>TABLE-UDS-01: UDS diagnostics</option>
              </select>
              <input
                placeholder="Filter by ID..."
                className="rounded-lg border border-marble-400 bg-secondary-50 px-3 py-2 text-p-sm text-volcanic-800 focus:border-blue-700 focus:outline-none"
              />
              <button className="rounded-lg border border-marble-400 px-3 py-2 text-p-sm text-volcanic-800 transition hover:border-blue-700 hover:text-blue-800">
                Sort by impact
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          {changeCards.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl border border-marble-400 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-secondary-100 px-3 py-1 text-label text-volcanic-700">
                    {card.id}
                  </span>
                  <div className="flex flex-col">
                    <p className="text-label text-volcanic-600">{card.type}</p>
                    <h3 className="text-p font-semibold text-volcanic-900">{card.title}</h3>
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-label text-blue-700">{card.impact}</span>
              </div>
              <p className="mt-3 text-p-sm text-volcanic-700">{card.detail}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-marble-400 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label text-volcanic-600">Table diff</p>
                <h2 className="text-h4 font-variable text-volcanic-900">UDS Diagnostic Table</h2>
                <p className="text-p-sm text-volcanic-700">New DTC added and response length updated in Doc B.</p>
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
                <p className="text-p-sm text-volcanic-700">Legend updated; layout unchanged across variants.</p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-label text-blue-700">{imageItems.length} variants</span>
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
