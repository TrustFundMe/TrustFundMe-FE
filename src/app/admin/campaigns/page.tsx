'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  Ban,
  Eye,
  Folder,
  Pencil,
  Plus,
  Search,
  Tag,
} from 'lucide-react';

type CampaignStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

type CampaignRow = {
  id: string;
  title: string;
  ownerName: string;
  goalAmount: number;
  raisedAmount: number;
  status: CampaignStatus;
  category: string;
  createdAt: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

const mockCampaigns: CampaignRow[] = [
  {
    id: 'c_1001',
    title: 'Help Children Go To School',
    ownerName: 'Nguyen Van A',
    goalAmount: 50000000,
    raisedAmount: 18000000,
    status: 'ACTIVE',
    category: 'Education',
    createdAt: '2026-01-05',
  },
  {
    id: 'c_1002',
    title: 'Medical Support for Elderly',
    ownerName: 'Tran Thi B',
    goalAmount: 80000000,
    raisedAmount: 8000000,
    status: 'PENDING',
    category: 'Health',
    createdAt: '2026-01-12',
  },
  {
    id: 'c_1003',
    title: 'Flood Relief Fund',
    ownerName: 'Le Van C',
    goalAmount: 120000000,
    raisedAmount: 110000000,
    status: 'CLOSED',
    category: 'Disaster Relief',
    createdAt: '2025-12-20',
  },
  {
    id: 'c_1004',
    title: 'Community Food Bank',
    ownerName: 'Pham Thi D',
    goalAmount: 30000000,
    raisedAmount: 4000000,
    status: 'PAUSED',
    category: 'Community',
    createdAt: '2026-01-18',
  },
];

const mockCategories: CategoryRow[] = [
  { id: 'cat_1', name: 'Education', slug: 'education', isActive: true },
  { id: 'cat_2', name: 'Health', slug: 'health', isActive: true },
  { id: 'cat_3', name: 'Disaster Relief', slug: 'disaster-relief', isActive: true },
  { id: 'cat_4', name: 'Community', slug: 'community', isActive: true },
];

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function StatusPill({ status }: { status: CampaignStatus }) {
  const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'ACTIVE':
      return (
        <span className={`${base} bg-green-50 text-green-700`}>
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Active
        </span>
      );
    case 'PENDING':
      return (
        <span className={`${base} bg-amber-50 text-amber-800`}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Pending
        </span>
      );
    case 'PAUSED':
      return (
        <span className={`${base} bg-slate-100 text-slate-700`}>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Paused
        </span>
      );
    case 'CLOSED':
      return (
        <span className={`${base} bg-rose-50 text-rose-700`}>
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          Closed
        </span>
      );
    default:
      return (
        <span className={`${base} bg-blue-50 text-blue-700`}>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Draft
        </span>
      );
  }
}

export default function AdminCampaignsPage() {
  const [tab, setTab] = useState<'CAMPAIGNS' | 'CATEGORIES'>('CAMPAIGNS');

  const [campaignQuery, setCampaignQuery] = useState('');
  const [campaignStatus, setCampaignStatus] = useState<'ALL' | CampaignStatus>('ALL');
  const [campaignCategory, setCampaignCategory] = useState<'ALL' | string>('ALL');
  const [campaigns, setCampaigns] = useState<CampaignRow[]>(mockCampaigns);

  const [catQuery, setCatQuery] = useState('');
  const [categories, setCategories] = useState<CategoryRow[]>(mockCategories);
  const [catDraft, setCatDraft] = useState<{ name: string; slug: string }>({ name: '', slug: '' });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(campaigns.map((c) => c.category))).sort();
    return unique;
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const q = campaignQuery.trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);

      const matchesStatus = campaignStatus === 'ALL' ? true : c.status === campaignStatus;
      const matchesCategory = campaignCategory === 'ALL' ? true : c.category === campaignCategory;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [campaignCategory, campaignQuery, campaignStatus, campaigns]);

  const filteredCategories = useMemo(() => {
    const q = catQuery.trim().toLowerCase();
    return categories.filter((c) => !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [catQuery, categories]);

  const progressPct = (c: CampaignRow) => {
    if (!c.goalAmount) return 0;
    return Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100));
  };

  const approveCampaign = (id: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'ACTIVE' } : c)));
  };

  const pauseCampaign = (id: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'PAUSED' } : c)));
  };

  const closeCampaign = (id: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'CLOSED' } : c)));
  };

  const createCategory = () => {
    const name = catDraft.name.trim();
    const slug = catDraft.slug.trim();
    if (!name || !slug) return;

    setCategories((prev) => [
      {
        id: `cat_${Date.now()}`,
        name,
        slug,
        isActive: true,
      },
      ...prev,
    ]);
    setCatDraft({ name: '', slug: '' });
  };

  const startEditCategory = (cat: CategoryRow) => {
    setEditingCatId(cat.id);
    setCatDraft({ name: cat.name, slug: cat.slug });
  };

  const saveCategory = () => {
    if (!editingCatId) return;
    const name = catDraft.name.trim();
    const slug = catDraft.slug.trim();
    if (!name || !slug) return;

    setCategories((prev) => prev.map((c) => (c.id === editingCatId ? { ...c, name, slug } : c)));
    setEditingCatId(null);
    setCatDraft({ name: '', slug: '' });
  };

  const cancelEditCategory = () => {
    setEditingCatId(null);
    setCatDraft({ name: '', slug: '' });
  };

  const toggleCategoryActive = (id: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  return (
    <div className="max-w-7xl mx-auto">

      {tab === 'CAMPAIGNS' ? (
        <>
          <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  value={campaignQuery}
                  onChange={(e) => setCampaignQuery(e.target.value)}
                  placeholder="Search title, owner, id..."
                  className="w-72 max-w-[70vw] bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>

              <select
                value={campaignStatus}
                onChange={(e) => setCampaignStatus(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="ALL">All status</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="CLOSED">Closed</option>
                <option value="DRAFT">Draft</option>
              </select>

              <select
                value={campaignCategory}
                onChange={(e) => setCampaignCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="ALL">All categories</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 rounded-xl bg-[#F84D43] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
              title="Go to public campaigns page"
            >
              <Plus className="h-4 w-4" />
              Create campaign
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="py-3 pl-5 pr-4 font-medium">Campaign</th>
                    <th className="py-3 pr-4 font-medium">Owner</th>
                    <th className="py-3 pr-4 font-medium">Category</th>
                    <th className="py-3 pr-4 font-medium">Progress</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((c) => {
                    const pct = progressPct(c);
                    return (
                      <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                        <td className="py-4 pl-5 pr-4">
                          <div className="leading-tight">
                            <div className="font-semibold text-slate-900">{c.title}</div>
                            <div className="text-xs text-slate-500">
                              {c.id} • Created {c.createdAt}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-slate-700 whitespace-nowrap">{c.ownerName}</td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            <Tag className="h-3.5 w-3.5" />
                            {c.category}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="min-w-48">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{formatVnd(c.raisedAmount)}</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-[#F84D43]" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="mt-1 text-xs text-slate-500">Goal {formatVnd(c.goalAmount)}</div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <StatusPill status={c.status} />
                        </td>
                        <td className="py-4 pr-5">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <Link
                              href={`/campaigns-details?campaignId=${encodeURIComponent(c.id)}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                              title="View campaign (public)"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Link>

                            {c.status === 'PENDING' && (
                              <button
                                onClick={() => approveCampaign(c.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                                title="Approve / Activate campaign"
                              >
                                <BadgeCheck className="h-4 w-4" />
                                Approve
                              </button>
                            )}

                            {c.status === 'ACTIVE' && (
                              <button
                                onClick={() => pauseCampaign(c.id)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                                title="Pause campaign"
                              >
                                <Ban className="h-4 w-4" />
                                Pause
                              </button>
                            )}

                            {(c.status === 'ACTIVE' || c.status === 'PAUSED') && (
                              <button
                                onClick={() => closeCampaign(c.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#F84D43] px-3 py-2 text-xs font-semibold text-white hover:brightness-95"
                                title="Close campaign"
                              >
                                <Ban className="h-4 w-4" />
                                Close
                              </button>
                            )}

                            <button
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                              title="Edit (placeholder)"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        No campaigns found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
            <div className="text-sm font-semibold text-slate-900">Suggested management capabilities</div>
            <div className="mt-2 text-sm text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
                Approve / reject pending campaigns (hook up to BE later)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
                Pause / close campaigns (policy enforcement)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
                Review owner, goal, raised, suspicious activities
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
                Category assignment & moderation
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
              <div className="text-sm font-semibold text-slate-900">Manage Campaign Categories</div>
              <div className="mt-1 text-sm text-slate-500">Create new category or edit existing ones.</div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Name</div>
                  <input
                    value={catDraft.name}
                    onChange={(e) => setCatDraft((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                    placeholder="e.g. Education"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Slug</div>
                  <input
                    value={catDraft.slug}
                    onChange={(e) => setCatDraft((p) => ({ ...p, slug: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                    placeholder="e.g. education"
                  />
                </div>

                {editingCatId ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveCategory}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <Pencil className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditCategory}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={createCategory}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F84D43] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
                  >
                    <Plus className="h-4 w-4" />
                    Create
                  </button>
                )}
              </div>

              <div className="mt-6 rounded-xl border border-[#F84D43]/20 bg-[#F84D43]/5 p-4">
                <div className="text-sm font-semibold text-slate-900">Use cases</div>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
                    View campaign category list
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
                    Create campaign category
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
                    Edit campaign category
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    value={catQuery}
                    onChange={(e) => setCatQuery(e.target.value)}
                    placeholder="Search category name or slug..."
                    className="w-72 max-w-[70vw] bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>

                <div className="text-sm text-slate-500">Total: {filteredCategories.length}</div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-slate-500">
                        <th className="py-3 pl-5 pr-4 font-medium">Name</th>
                        <th className="py-3 pr-4 font-medium">Slug</th>
                        <th className="py-3 pr-4 font-medium">Active</th>
                        <th className="py-3 pr-5 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((cat) => (
                        <tr key={cat.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                          <td className="py-4 pl-5 pr-4">
                            <div className="font-semibold text-slate-900">{cat.name}</div>
                          </td>
                          <td className="py-4 pr-4 text-slate-700">{cat.slug}</td>
                          <td className="py-4 pr-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cat.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-700'
                                }`}
                            >
                              {cat.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="py-4 pr-5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEditCategory(cat)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => toggleCategoryActive(cat.id)}
                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${cat.isActive
                                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                                  : 'bg-[#F84D43] text-white hover:brightness-95'
                                  }`}
                              >
                                <Ban className="h-4 w-4" />
                                {cat.isActive ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredCategories.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-slate-500">
                            No categories found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
