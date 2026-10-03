"use client";

import React, { useEffect, useState } from "react";
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
  _count: { claimedThreads: number };
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

interface AdminData {
  metrics: AdminMetrics;
  categories: CategoryStat[];
  professionals: ProfessionalRecord[];
  crisisFlags: CrisisFlagRecord[];
}

export function AdminOverviewView() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"METRICS" | "RESPONDERS" | "FLAGS">("METRICS");
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
        throw new Error("Failed to load admin data.");
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
    const interval = setInterval(loadData, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, []);

  const handleProAction = async (proId: string, action: "approve" | "suspend" | "reinstate", reason?: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/professionals/${proId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason || "Administrative action" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Action failed");
      }
      showToast(`Responder status updated to ${action.toUpperCase()}`);
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
      if (!res.ok) throw new Error("Could not resolve flag.");
      showToast("Flag resolved.");
      await loadData();
    } catch (err: unknown) {
      showToast(`Error: ${(err as Error).message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-canvas-deep">
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

      <header className="px-6 h-16 shrink-0 border-b border-white/10 flex items-center justify-between bg-elevated-onyx">
        <h1 className="text-lg font-bold text-starlight-white">System Operations</h1>
        <button 
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-mint/50 text-starlight-white hover:text-mint transition-colors text-xs font-medium"
        >
          <span className={`material-symbols-outlined text-sm ${isLoading ? "animate-spin" : ""}`}>refresh</span>
          <span>Sync Data</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
        {error && (
          <div className="p-4 mb-4 rounded-xl bg-rose/10 border border-rose/30 text-rose text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadData} className="underline text-xs">Retry</button>
          </div>
        )}

        <div className="flex gap-2 border-b border-white/10 pb-4 mb-6">
          <button
            onClick={() => setActiveTab("METRICS")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "METRICS" ? "bg-surface-container-high text-starlight-white" : "text-muted-silver hover:text-starlight-white hover:bg-surface-container"
            }`}
          >
            Platform Metrics
          </button>
          <button
            onClick={() => setActiveTab("RESPONDERS")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "RESPONDERS" ? "bg-surface-container-high text-starlight-white" : "text-muted-silver hover:text-starlight-white hover:bg-surface-container"
            }`}
          >
            Responders ({data?.professionals.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("FLAGS")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "FLAGS" ? "bg-rose/20 text-rose border border-rose/30" : "text-muted-silver hover:text-starlight-white hover:bg-surface-container"
            }`}
          >
            Crisis Flags
            {data?.metrics.unresolvedCrisisFlags ? (
              <span className="w-2 h-2 rounded-full bg-rose animate-pulse ml-1"></span>
            ) : null}
          </button>
        </div>

        {activeTab === "METRICS" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-elevated-onyx border border-white/10 flex flex-col justify-between shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="text-xs text-muted-silver uppercase font-semibold">Active Threads</span>
                  <span className="material-symbols-outlined text-secondary text-xl">forum</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-bold font-mono-data text-starlight-white">
                    {isLoading ? "..." : (data?.metrics.totalThreads ?? 0)}
                  </span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-elevated-onyx border border-white/10 flex flex-col justify-between shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="text-xs text-muted-silver uppercase font-semibold">Total Messages</span>
                  <span className="material-symbols-outlined text-mint text-xl">lock</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-bold font-mono-data text-starlight-white">
                    {isLoading ? "..." : (data?.metrics.totalMessages ?? 0)}
                  </span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-elevated-onyx border border-white/10 flex flex-col justify-between shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="text-xs text-muted-silver uppercase font-semibold">Responders</span>
                  <span className="material-symbols-outlined text-peach text-xl">medical_services</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-bold font-mono-data text-starlight-white">
                    {isLoading ? "..." : (data?.metrics.activeProfessionals ?? 0)}
                  </span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-elevated-onyx border border-white/10 flex flex-col justify-between shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="text-xs text-muted-silver uppercase font-semibold">Unresolved Flags</span>
                  <span className="material-symbols-outlined text-rose text-xl">warning</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className={`text-3xl font-bold font-mono-data ${data?.metrics.unresolvedCrisisFlags ? "text-rose" : "text-starlight-white"}`}>
                    {isLoading ? "..." : (data?.metrics.unresolvedCrisisFlags ?? 0)}
                  </span>
                </div>
              </div>
            </section>

            <section className="p-6 rounded-2xl bg-elevated-onyx border border-white/10">
              <h2 className="text-sm font-bold text-starlight-white">Category Breakdown</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                {(data?.categories || []).map((cat) => (
                  <div key={cat.id} className="p-3 rounded-xl bg-surface-container-lowest/60 border border-white/5 flex flex-col justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-muted-silver truncate font-medium">
                      {cat.slug.replace("-", " ")}
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-lg font-bold font-mono-data text-starlight-white">{cat.threadCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "RESPONDERS" && (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-elevated-onyx animate-in fade-in slide-in-from-bottom-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-surface-container/30 text-muted-silver uppercase font-semibold">
                  <th className="py-3 px-4">Responder</th>
                  <th className="py-3 px-4">Credentials</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(data?.professionals || []).map((pro) => (
                  <tr key={pro.id} className="hover:bg-surface-container/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-starlight-white text-sm">{pro.fullName}</div>
                      <div className="text-muted-silver font-mono-data text-[11px]">{pro.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-starlight-white">{pro.credentials}</div>
                      <div className="text-secondary text-[11px] font-mono-data">{pro.licenseNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-mono-data text-[10px] font-semibold inline-block ${
                        pro.status === "ACTIVE" ? "bg-mint/20 text-mint border border-mint/30"
                        : pro.status === "PENDING" ? "bg-peach/20 text-peach border border-peach/30"
                        : "bg-rose/20 text-rose border border-rose/30"
                      }`}>
                        {pro.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {pro.status === "PENDING" && (
                        <button
                          onClick={() => handleProAction(pro.id, "approve")}
                          disabled={isActionLoading}
                          className="px-3 py-1.5 rounded-lg bg-mint/20 hover:bg-mint/30 border border-mint/40 text-mint font-medium text-xs transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {pro.status === "ACTIVE" && (
                        <button
                          onClick={() => setActiveModal({
                            title: `Suspend Responder ${pro.fullName}?`,
                            description: "This will suspend their account.",
                            actionLabel: "Suspend Account",
                            onConfirm: () => handleProAction(pro.id, "suspend")
                          })}
                          disabled={isActionLoading}
                          className="px-3 py-1.5 rounded-lg bg-surface-container border border-white/10 text-muted-silver hover:text-rose hover:border-rose/40 font-medium text-xs transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {pro.status === "SUSPENDED" && (
                        <button
                          onClick={() => handleProAction(pro.id, "reinstate")}
                          disabled={isActionLoading}
                          className="px-3 py-1.5 rounded-lg bg-secondary/20 hover:bg-secondary/30 border border-secondary/40 text-secondary font-medium text-xs transition-colors"
                        >
                          Reinstate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!data?.professionals || data.professionals.length === 0) && (
                  <tr><td colSpan={4} className="text-center py-6 text-muted-silver">No professionals.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "FLAGS" && (
          <div className="overflow-x-auto rounded-xl border border-rose/20 bg-elevated-onyx animate-in fade-in slide-in-from-bottom-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-rose/20 bg-rose/5 text-rose uppercase font-semibold">
                  <th className="py-3 px-4">Thread ID</th>
                  <th className="py-3 px-4">Raised At</th>
                  <th className="py-3 px-4">Source & Reason</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose/10">
                {(data?.crisisFlags || []).map((flag) => (
                  <tr key={flag.id} className="hover:bg-rose/5 transition-colors">
                    <td className="py-3 px-4 font-mono-data text-starlight-white font-medium">
                      {flag.thread.id.split("-")[0].toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-muted-silver whitespace-nowrap">
                      {new Date(flag.raisedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-rose">{flag.source}</div>
                      <div className="text-starlight-white">{flag.reason || "No explicit reason"}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveModal({
                          title: "Resolve Flag?",
                          description: "Mark this flag as resolved?",
                          actionLabel: "Resolve",
                          onConfirm: () => handleResolveFlag(flag.id)
                        })}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-lg bg-surface-container border border-white/10 hover:bg-surface-container-high text-starlight-white font-medium text-xs transition-colors"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
                {(!data?.crisisFlags || data.crisisFlags.length === 0) && (
                  <tr><td colSpan={4} className="text-center py-10 text-muted-silver">No unresolved crisis flags.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 9999px; }
      `}} />
    </div>
  );
}
