"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminMetrics {
  totalThreads: number;
  openThreads: number;
  inProgressThreads: number;
  resolvedThreads: number;
  escalatedThreads: number;
  totalMessages: number;
  totalSessions: number;
  activeProfessionals: number;
  pendingProfessionals: number;
  suspendedProfessionals: number;
  unresolvedCrisisFlags: number;
  totalCrisisFlags: number;
}

interface CategoryStat {
  id: string;
  slug: string;
  threadCount: number;
  isCrisis: boolean;
}

interface ProfessionalRecord {
  id: string;
  email: string;
  fullName: string;
  credentials: string;
  licenseNumber: string;
  specialty: string;
  languages: string[];
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  createdAt: string;
  _count: {
    claimedThreads: number;
  };
}

interface CrisisFlagRecord {
  id: string;
  source: string;
  reason: string | null;
  raisedAt: string;
  thread: {
    id: string;
    language: string;
    category: { slug: string };
    claimedBy?: { fullName: string } | null;
  };
}

interface ThreadSummary {
  id: string;
  language: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED";
  createdAt: string;
  category: { slug: string; isCrisis: boolean };
  claimedBy?: { fullName: string } | null;
  _count: { messages: number };
}

interface AuditLogRecord {
  id: string;
  actorType: "ADMIN" | "PROFESSIONAL" | "SYSTEM";
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

interface AdminData {
  metrics: AdminMetrics;
  categories: CategoryStat[];
  professionals: ProfessionalRecord[];
  crisisFlags: CrisisFlagRecord[];
  recentThreads: ThreadSummary[];
  auditLogs: AuditLogRecord[];
}

export function AdminOverviewView() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [auditFilter, setAuditFilter] = useState<"ALL" | "ADMIN" | "PROFESSIONAL" | "SYSTEM">("ALL");
  const [auditSearch, setAuditSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<{
    title: string;
    description: string;
    actionLabel?: string;
    onConfirm?: () => Promise<void> | void;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/auth");
          return;
        }
        throw new Error("Failed to load real-time admin telemetry.");
      }
      const json: AdminData = await res.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // Poll real data every 20s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/auth";
  };

  const handleProAction = async (proId: string, action: "approve" | "suspend" | "reinstate", reason?: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/professionals/${proId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason || "Administrative action by Super Admin" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Action failed");
      }
      showToast(`Professional status successfully updated: ${action.toUpperCase()}`);
      await loadData();
    } catch (err: unknown) {
      showToast(`Error: ${(err as Error).message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResolveFlag = async (flagId: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/flags/${flagId}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Could not resolve crisis flag.");
      showToast("Crisis flag reviewed and marked resolved in database.");
      await loadData();
    } catch (err: unknown) {
      showToast(`Error: ${(err as Error).message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMaintenancePurge = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch("/api/admin/maintenance", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Purge failed");
      showToast(`Retention maintenance complete. Pruned ${json.deleted ?? 0} expired session records.`);
      await loadData();
    } catch (err: unknown) {
      showToast(`Error: ${(err as Error).message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExportLedger = () => {
    if (!data?.auditLogs) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.auditLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `xinnection-audit-ledger-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Real database audit ledger exported to JSON.");
  };

  const filteredAuditLogs = (data?.auditLogs || []).filter((rec) => {
    if (auditFilter !== "ALL" && rec.actorType !== auditFilter) return false;
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      return (
        rec.action.toLowerCase().includes(q) ||
        rec.actorId.toLowerCase().includes(q) ||
        rec.targetType.toLowerCase().includes(q) ||
        rec.targetId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-canvas-deep text-on-surface font-body-md min-h-screen overflow-x-hidden antialiased flex selection:bg-primary-container selection:text-starlight-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-elevated-onyx border border-primary-container text-starlight-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-primary-container text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-elevated-onyx border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-headline-sm font-semibold text-starlight-white">{activeModal.title}</h3>
            <p className="text-muted-silver text-sm leading-relaxed">{activeModal.description}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-full border border-white/10 text-muted-silver hover:text-starlight-white text-sm"
              >
                Cancel
              </button>
              {activeModal.actionLabel && (
                <button
                  onClick={async () => {
                    await activeModal.onConfirm?.();
                    setActiveModal(null);
                  }}
                  className="px-4 py-1.5 rounded-full bg-primary-container text-starlight-white font-medium text-sm hover:opacity-90"
                >
                  {activeModal.actionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Responsive Sidebar Drawer */}
      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 h-screen w-64 flex flex-col justify-between bg-canvas-deep border-r border-white/10 z-40 select-none transition-transform duration-200 shrink-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-4 flex flex-col gap-4">
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-3 px-1 py-1 hover:opacity-90">
            <div className="w-10 h-10 rounded-xl bg-elevated-onyx border border-white/10 flex items-center justify-center relative shadow-sm">
              <span className="material-symbols-outlined text-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mint"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-headline-sm font-bold text-starlight-white tracking-wide">Xinnection</span>
              <span className="text-xs text-muted-silver tracking-tight">Admin Operations</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container-high text-primary font-medium text-sm border-l-4 border-mint">
              <span className="material-symbols-outlined text-mint text-xl">analytics</span>
              <span className="text-starlight-white">Live Operations</span>
            </div>
            <a 
              href="#responders" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-silver hover:bg-surface-container hover:text-starlight-white text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-xl">badge</span>
              <span>Responders ({data?.professionals.length ?? 0})</span>
            </a>
            <a 
              href="#cases" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-silver hover:bg-surface-container hover:text-starlight-white text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chat</span>
              <span>Active Threads</span>
            </a>
            <a 
              href="#audit-ledger" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-silver hover:bg-surface-container hover:text-starlight-white text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-xl">receipt_long</span>
              <span>Audit Log</span>
            </a>
          </nav>

          {/* System Retention & Maintenance Control */}
          <div className="mt-4 p-3.5 rounded-xl bg-elevated-onyx border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-silver uppercase tracking-wider font-semibold">Data Retention</span>
              <span className="px-2 py-0.5 rounded-full bg-mint/20 text-mint border border-mint/30 font-mono-data text-[10px] font-semibold">ACTIVE</span>
            </div>
            <p className="text-xs text-muted-silver/90 leading-relaxed">
              Cryptographically purges expired anonymous sessions and orphaned ciphertext.
            </p>
            <button 
              onClick={() => setActiveModal({
                title: "Run Retention Maintenance",
                description: "Purge expired anonymous sessions past their 90-day retention threshold from the database?",
                actionLabel: "Execute Purge",
                onConfirm: handleMaintenancePurge
              })}
              disabled={isActionLoading}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-container border border-peach/40 text-peach hover:bg-peach hover:text-starlight-white transition-all text-xs font-mono-data font-medium disabled:opacity-50" 
              type="button"
            >
              <span className="material-symbols-outlined text-sm">auto_delete</span>
              <span>Run DB Retention Purge</span>
            </button>
          </div>
        </div>

        {/* Bottom Operator Identity & Logout */}
        <div className="p-4 flex flex-col gap-3 border-t border-white/10 bg-canvas-deep">
          <div className="p-2.5 rounded-xl bg-elevated-onyx border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container font-mono-data text-xs font-semibold">
                ADM
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-starlight-white">Administrator</span>
                <span className="text-[10px] text-mint font-mono-data">Real DB Session</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-muted-silver hover:text-primary-container transition-colors p-1" 
              title="Sign out" 
              type="button"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen flex flex-col bg-canvas-deep min-w-0">
        {/* Header Bar */}
        <header className="sticky top-0 z-30 bg-elevated-onyx/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 border-b border-white/10 flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 rounded-md text-muted-silver hover:bg-surface-container-high hover:text-starlight-white"
              title="Toggle Menu"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-mono-data text-muted-silver">
                <span>Database: Connected</span>
                <span>•</span>
                <span className="text-mint font-semibold">Live Production Data</span>
              </div>
              <h1 className="text-headline-md font-bold text-starlight-white tracking-tight">
                System Control & Platform Operations
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-mint/50 text-starlight-white hover:text-mint transition-colors text-xs font-medium"
              type="button"
            >
              <span className={`material-symbols-outlined text-sm ${isLoading ? "animate-spin" : ""}`}>refresh</span>
              <span>Sync</span>
            </button>
            <Link
              href="/professional"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-elevated-onyx border border-white/10 hover:border-white/30 text-starlight-white text-xs font-medium"
            >
              <span className="material-symbols-outlined text-sm">support_agent</span>
              <span>Responder Queue</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Body Canvas */}
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose/10 border border-rose/30 text-rose text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={loadData} className="underline text-xs">Retry</button>
            </div>
          )}

          {/* REAL METRICS ROW */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Metric 1: Total Anonymous Threads */}
            <div className="p-5 rounded-2xl bg-elevated-onyx border border-white/10 flex flex-col justify-between shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-xs text-muted-silver uppercase font-semibold">Active Anonymous Threads</span>
                <span className="material-symbols-outlined text-secondary text-xl">forum</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold font-mono-data text-starlight-white">
                  {isLoading ? "..." : (data?.metrics.totalThreads ?? 0)}
                </span>
                <div className="flex gap-1.5 text-xs font-mono-data">
                  <span className="text-mint font-medium">{data?.metrics.openThreads ?? 0} Open</span>
                  <span className="text-muted-silver">•</span>
                  <span className="text-secondary font-medium">{data?.metrics.inProgressThreads ?? 0} Claimed</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-muted-silver">
                Resolved cases: <span className="text-starlight-white font-medium">{data?.metrics.resolvedThreads ?? 0}</span>
              </div>
            </div>

            {/* Metric 2: Encrypted Messages */}
            <div className="p-5 rounded-2xl bg-elevated-onyx border border-white/10 flex flex-col justify-between shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-xs text-muted-silver uppercase font-semibold">Encrypted Reflections</span>
                <span className="material-symbols-outlined text-mint text-xl">lock</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold font-mono-data text-starlight-white">
                  {isLoading ? "..." : (data?.metrics.totalMessages ?? 0)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-mint/15 text-mint border border-mint/30 text-[11px] font-mono-data">
                  AES-256-GCM
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-muted-silver">
                Stored as application-layer ciphertext in PostgreSQL
              </div>
            </div>

            {/* Metric 3: Clinical Responders */}
            <div className="p-5 rounded-2xl bg-elevated-onyx border border-white/10 flex flex-col justify-between shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-xs text-muted-silver uppercase font-semibold">Clinical Responders</span>
                <span className="material-symbols-outlined text-peach text-xl">medical_services</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold font-mono-data text-starlight-white">
                  {isLoading ? "..." : (data?.metrics.activeProfessionals ?? 0)}
                </span>
                {data?.metrics.pendingProfessionals ? (
                  <span className="px-2 py-0.5 rounded-full bg-peach/20 text-peach border border-peach/40 text-[11px] font-mono-data font-semibold">
                    {data.metrics.pendingProfessionals} Pending Approval
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-muted-silver text-[11px] font-mono-data">
                    All Approved
                  </span>
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-muted-silver">
                Total registered: <span className="text-starlight-white font-medium">{data?.professionals.length ?? 0}</span>
              </div>
            </div>

            {/* Metric 4: Crisis Flags */}
            <div className="p-5 rounded-2xl bg-elevated-onyx border border-white/10 flex flex-col justify-between shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-xs text-muted-silver uppercase font-semibold">Crisis Alerts</span>
                <span className="material-symbols-outlined text-rose text-xl">warning</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className={`text-3xl font-bold font-mono-data ${data?.metrics.unresolvedCrisisFlags ? "text-rose" : "text-starlight-white"}`}>
                  {isLoading ? "..." : (data?.metrics.unresolvedCrisisFlags ?? 0)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono-data ${data?.metrics.unresolvedCrisisFlags ? "bg-rose/20 text-rose border border-rose/30" : "bg-mint/15 text-mint border border-mint/20"}`}>
                  {data?.metrics.unresolvedCrisisFlags ? "Requires Review" : "Queue Clean"}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-muted-silver">
                Cumulative historical flags: <span className="text-starlight-white font-medium">{data?.metrics.totalCrisisFlags ?? 0}</span>
              </div>
            </div>
          </section>

          {/* REAL CATEGORIES DISTRIBUTION */}
          <section className="p-6 rounded-2xl bg-elevated-onyx border border-white/10">
            <h2 className="text-headline-sm font-bold text-starlight-white">Live Topic Breakdown</h2>
            <p className="text-xs text-muted-silver mt-1">Real seeker volume categorized by support themes.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-4">
              {(data?.categories || []).map((cat) => (
                <div key={cat.id} className="p-3 rounded-xl bg-surface-container-lowest/60 border border-white/5 flex flex-col justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-silver truncate font-medium">
                    {cat.slug.replace("-", " ")}
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-bold font-mono-data text-starlight-white">{cat.threadCount}</span>
                    {cat.isCrisis && (
                      <span className="text-[10px] text-rose font-mono-data font-semibold">CRISIS</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* REAL CLINICAL RESPONDERS ROSTER & MANAGEMENT */}
          <section id="responders" className="p-6 rounded-2xl bg-elevated-onyx border border-white/10 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-headline-sm font-bold text-starlight-white">Professional Clinical Responders</h2>
                <p className="text-xs text-muted-silver mt-1">
                  Manage certified responders, review licenses, and approve or suspend system access.
                </p>
              </div>
              <span className="text-xs font-mono-data text-muted-silver bg-surface-container px-3 py-1 rounded-full border border-white/10 self-start sm:self-auto">
                {data?.professionals.length ?? 0} Responders Registered
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container-lowest/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-surface-container/60 text-muted-silver uppercase font-semibold">
                    <th className="py-3 px-4">Responder</th>
                    <th className="py-3 px-4">Credentials & License</th>
                    <th className="py-3 px-4">Specialty & Languages</th>
                    <th className="py-3 px-4">Caseload</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(data?.professionals || []).map((pro) => (
                    <tr key={pro.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-starlight-white text-sm">{pro.fullName}</div>
                        <div className="text-muted-silver font-mono-data text-[11px]">{pro.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono-data">
                        <div className="text-starlight-white">{pro.credentials}</div>
                        <div className="text-secondary text-[11px]">{pro.licenseNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-starlight-white">{pro.specialty}</div>
                        <div className="text-muted-silver text-[11px] uppercase">{pro.languages.join(", ")}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono-data">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-starlight-white font-medium">
                          {pro._count.claimedThreads} active
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-mono-data text-[11px] font-semibold inline-block ${
                          pro.status === "ACTIVE"
                            ? "bg-mint/20 text-mint border border-mint/30"
                            : pro.status === "PENDING"
                            ? "bg-peach/20 text-peach border border-peach/30"
                            : "bg-rose/20 text-rose border border-rose/30"
                        }`}>
                          {pro.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {pro.status === "PENDING" && (
                          <button
                            onClick={() => handleProAction(pro.id, "approve")}
                            disabled={isActionLoading}
                            className="px-3 py-1 rounded-lg bg-mint/20 hover:bg-mint/30 border border-mint/40 text-mint font-medium text-xs transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {pro.status === "ACTIVE" && (
                          <button
                            onClick={() => setActiveModal({
                              title: `Suspend Responder ${pro.fullName}?`,
                              description: "This will revoke terminal session credentials and prevent the professional from claiming new cases.",
                              actionLabel: "Suspend Account",
                              onConfirm: () => handleProAction(pro.id, "suspend", "Administrative suspension")
                            })}
                            disabled={isActionLoading}
                            className="px-3 py-1 rounded-lg bg-surface-container hover:bg-rose/20 border border-white/10 hover:border-rose/40 text-muted-silver hover:text-rose font-medium text-xs transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                        {pro.status === "SUSPENDED" && (
                          <button
                            onClick={() => handleProAction(pro.id, "reinstate")}
                            disabled={isActionLoading}
                            className="px-3 py-1 rounded-lg bg-secondary/20 hover:bg-secondary/30 border border-secondary/40 text-secondary font-medium text-xs transition-colors"
                          >
                            Reinstate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!data?.professionals || data.professionals.length === 0) && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-muted-silver">
                        No professionals registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* REAL RECENT THREADS SNAPSHOT */}
          <section id="cases" className="p-6 rounded-2xl bg-elevated-onyx border border-white/10 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-headline-sm font-bold text-starlight-white">Recent Anonymous Threads</h2>
                <p className="text-xs text-muted-silver mt-1">Live snapshot of conversations in the database.</p>
              </div>
              <span className="text-xs font-mono-data text-muted-silver bg-surface-container px-3 py-1 rounded-full border border-white/10 self-start sm:self-auto">
                {data?.metrics.totalThreads ?? 0} Total in Database
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container-lowest/40">
              <table className="w-full text-left border-collapse text-xs font-mono-data">
                <thead>
                  <tr className="border-b border-white/10 bg-surface-container/60 text-muted-silver uppercase font-semibold">
                    <th className="py-3 px-4">Thread ID</th>
                    <th className="py-3 px-4">Topic / Category</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Responder</th>
                    <th className="py-3 px-4">Messages</th>
                    <th className="py-3 px-4 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(data?.recentThreads || []).map((t) => (
                    <tr key={t.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="py-3 px-4 text-secondary font-medium">{t.id.slice(-8)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] uppercase font-semibold ${t.category.isCrisis ? "bg-rose/20 text-rose" : "bg-surface-container text-starlight-white"}`}>
                          {t.category.slug}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-starlight-white uppercase">{t.language}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          t.status === "OPEN" ? "bg-mint/15 text-mint" : t.status === "IN_PROGRESS" ? "bg-secondary/20 text-secondary" : "bg-surface-container text-muted-silver"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-silver">
                        {t.claimedBy?.fullName || <span className="italic text-muted-silver/60">Unclaimed</span>}
                      </td>
                      <td className="py-3 px-4 text-starlight-white">{t._count.messages}</td>
                      <td className="py-3 px-4 text-right text-muted-silver whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentThreads || data.recentThreads.length === 0) && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-muted-silver">
                        No threads found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* REAL AUDIT LOGS LEDGER */}
          <section id="audit-ledger" className="p-6 rounded-2xl bg-elevated-onyx border border-white/10 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-headline-sm font-bold text-starlight-white">System Audit Log</h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container border border-white/10 text-muted-silver font-mono-data text-xs">
                    {filteredAuditLogs.length} entries
                  </span>
                </div>
                <p className="text-xs text-muted-silver mt-1">
                  Immutable database ledger tracking admin and system operations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative w-48">
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-muted-silver text-sm">search</span>
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-full pl-8 pr-3 py-1 text-xs text-starlight-white placeholder:text-muted-silver/60 focus:outline-none focus:ring-1 focus:ring-secondary font-mono-data"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center p-0.5 rounded-lg bg-surface-container-lowest border border-white/10 text-xs">
                  {(["ALL", "ADMIN", "PROFESSIONAL", "SYSTEM"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setAuditFilter(filter)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        auditFilter === filter ? "bg-surface-container-high text-starlight-white font-medium" : "text-muted-silver hover:text-starlight-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Export button */}
                <button
                  onClick={handleExportLedger}
                  className="p-1.5 rounded-lg bg-surface-container border border-white/10 text-muted-silver hover:text-starlight-white transition-colors"
                  title="Export Real DB Audit Ledger to JSON"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container-lowest/40">
              <table className="w-full text-left border-collapse text-xs font-mono-data">
                <thead>
                  <tr className="border-b border-white/10 bg-surface-container/60 text-muted-silver uppercase font-semibold">
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Type</th>
                    <th className="py-3 px-4">Target ID</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="py-2.5 px-4 text-starlight-white whitespace-nowrap">
                        {new Date(log.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          log.actorType === "ADMIN"
                            ? "bg-secondary/20 text-secondary"
                            : log.actorType === "SYSTEM"
                            ? "bg-peach/20 text-peach"
                            : "bg-mint/20 text-mint"
                        }`}>
                          {log.actorType}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-starlight-white font-semibold">{log.action}</td>
                      <td className="py-2.5 px-4 text-muted-silver">{log.targetType}</td>
                      <td className="py-2.5 px-4 text-muted-silver truncate max-w-xs">{log.targetId}</td>
                      <td className="py-2.5 px-4 text-muted-silver/80 truncate max-w-xs">
                        {log.metadata ? JSON.stringify(log.metadata) : "—"}
                      </td>
                    </tr>
                  ))}
                  {filteredAuditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-muted-silver">
                        No audit records in the database matching this query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
