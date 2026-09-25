"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuditRecord {
  id: string;
  timestamp: string;
  eventType: string;
  initiator: string;
  protocol: string;
  status: string;
  category: "Security" | "Shards" | "Rotations" | "All";
  hash: string;
  merkleProof: string;
}

const AUDIT_RECORDS: AuditRecord[] = [
  {
    id: "rec-1",
    timestamp: "2024-10-24 14:32:08",
    eventType: "Zero-Log Buffer Shred",
    initiator: "anon-node-8891 // SHA256",
    protocol: "Tor Ingress // Onion-v3",
    status: "Success / Purged",
    category: "Security",
    hash: "0x8f2a1b94c3d8e5f2a10b9c8d7e6f5a4b3c2d1e0f",
    merkleProof: "0x3f...9e1a (Path: L-R-L-R, Depth: 8)"
  },
  {
    id: "rec-2",
    timestamp: "2024-10-24 14:31:45",
    eventType: "Key Rotation (EU-West)",
    initiator: "sys-mesh-lon-02",
    protocol: "WireGuard // Direct Peer",
    status: "In Progress (94%)",
    category: "Rotations",
    hash: "0x9812bf002e1c4a5b6d7e8f90123456789abcdef0",
    merkleProof: "0x7c...2b88 (Path: R-L-R-L, Depth: 8)"
  },
  {
    id: "rec-3",
    timestamp: "2024-10-24 14:30:19",
    eventType: "High-Risk Escalation Handshake",
    initiator: "ingress-edge-4410 // REJECT",
    protocol: "IPv6 Unknown Relay",
    status: "Blocked / Rate-Limited",
    category: "Security",
    hash: "0x11223344556677889900aabbccddeeff00112233",
    merkleProof: "0x1a...4f55 (Path: L-L-R-R, Depth: 8)"
  },
  {
    id: "rec-4",
    timestamp: "2024-10-24 14:28:50",
    eventType: "Admin MFA Challenge",
    initiator: "sys-secops-09 // FIDO2",
    protocol: "Internal Hardware Bus",
    status: "Audited",
    category: "Security",
    hash: "0x55aa66bb77cc88dd99ee00ff1122334455667788",
    merkleProof: "0x9e...7a33 (Path: R-R-L-L, Depth: 8)"
  },
  {
    id: "rec-5",
    timestamp: "2024-10-24 14:26:12",
    eventType: "Shamir Shard Re-sync (AP-N)",
    initiator: "node-ap-north-01",
    protocol: "BGP Multi-Path failover",
    status: "Success / Purged",
    category: "Shards",
    hash: "0xaabbccddeeff00112233445566778899aabbccdd",
    merkleProof: "0x4d...1e90 (Path: L-R-R-L, Depth: 8)"
  },
];

export function AdminOverviewView() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<"All Events" | "Security" | "Shards" | "Rotations">("All Events");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inspectedRecord, setInspectedRecord] = useState<AuditRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<{
    title: string;
    description: string;
    actionLabel?: string;
    onConfirm?: () => void;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/auth";
  };

  const handleExportLedger = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AUDIT_RECORDS, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `xinnection-audit-ledger-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Audit ledger exported to JSON.");
  };

  const filteredRecords = AUDIT_RECORDS.filter((rec) => {
    if (selectedFilter !== "All Events" && rec.category !== selectedFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.eventType.toLowerCase().includes(q) ||
        rec.initiator.toLowerCase().includes(q) ||
        rec.protocol.toLowerCase().includes(q) ||
        rec.hash.toLowerCase().includes(q)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-elevated-onyx border border-outline-variant/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-headline-sm font-semibold text-starlight-white">{activeModal.title}</h3>
            <p className="text-muted-silver text-sm leading-relaxed">{activeModal.description}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-full border border-outline-variant/40 text-muted-silver hover:text-starlight-white text-sm"
              >
                Cancel
              </button>
              {activeModal.actionLabel && (
                <button
                  onClick={() => {
                    activeModal.onConfirm?.();
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

      {/* Cryptographic Inspector Modal */}
      {inspectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-elevated-onyx border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-mint text-xl">verified</span>
                <h3 className="text-headline-sm font-semibold text-starlight-white">Ledger Verification Inspector</h3>
              </div>
              <button
                onClick={() => setInspectedRecord(null)}
                className="text-muted-silver hover:text-starlight-white p-1 rounded-full"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="space-y-3 font-mono-data text-xs">
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-white/5 space-y-1.5">
                <div className="text-muted-silver text-[11px]">EVENT IDENTITY</div>
                <div className="text-starlight-white font-semibold text-sm">{inspectedRecord.eventType}</div>
                <div className="text-muted-silver text-[11px]">{inspectedRecord.timestamp} UTC</div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-white/5 space-y-1.5">
                <div className="text-muted-silver text-[11px]">SHA-256 DIGEST HASH</div>
                <div className="text-mint break-all select-all font-semibold">{inspectedRecord.hash}</div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-white/5 space-y-1.5">
                <div className="text-muted-silver text-[11px]">MERKLE TREE ROOT PROOF</div>
                <div className="text-secondary break-all">{inspectedRecord.merkleProof}</div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-white/5 space-y-1.5">
                <div className="text-muted-silver text-[11px]">ROUTING & PROTOCOL</div>
                <div className="text-starlight-white">{inspectedRecord.protocol} • Initiator: {inspectedRecord.initiator}</div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inspectedRecord.hash);
                  showToast("Hash copied to clipboard.");
                }}
                className="px-4 py-1.5 rounded-full bg-surface-container-high border border-white/10 text-starlight-white text-xs hover:bg-surface-container mr-2"
              >
                Copy Hash
              </button>
              <button
                onClick={() => setInspectedRecord(null)}
                className="px-4 py-1.5 rounded-full bg-primary-container text-starlight-white text-xs hover:opacity-90 font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SHARED COMPONENT: SideNavBar (Responsive Drawer)          */}
      {/* ========================================================= */}
      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 h-screen w-64 flex flex-col justify-between bg-canvas-deep border-r border-white/10 z-40 select-none transition-transform duration-200 shrink-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Top & Primary Navigation Stack */}
        <div className="p-space-md flex flex-col gap-space-md">
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-3 px-space-xs py-space-xs hover:opacity-90">
            <div className="w-10 h-10 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex items-center justify-center relative shadow-sm">
              <span className="material-symbols-outlined text-primary-container text-2xl" data-icon="security" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mint"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-headline-sm font-headline-sm text-starlight-white tracking-wide">Xinnection</span>
              </div>
              <span className="text-body-sm font-body-sm text-muted-silver tracking-tight">System Control Console</span>
            </div>
          </Link>
          
          {/* Navigation Tabs */}
          <nav className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT bg-surface-container-high text-primary font-headline-sm border-l-4 border-mint">
              <span className="material-symbols-outlined text-mint text-xl" data-icon="monitor_heart">monitor_heart</span>
              <span className="text-starlight-white font-headline-sm text-sm">Network Health</span>
            </div>
            <Link 
              href="#audit-logs" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT text-on-surface-variant font-body-md hover:bg-surface-container hover:text-on-surface transition-colors duration-150 active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-muted-silver text-xl" data-icon="receipt_long">receipt_long</span>
              <span className="font-body-md text-sm">Audit Logs</span>
            </Link>
            <Link 
              href="/admin/onboarding" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT text-on-surface-variant font-body-md hover:bg-surface-container hover:text-on-surface transition-colors duration-150 active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-muted-silver text-xl" data-icon="badge">badge</span>
              <span className="font-body-md text-sm">Node Enrollment</span>
            </Link>
            <button 
              onClick={() => {
                setIsSidebarOpen(false);
                showToast("Key Rotations: All 5 shard rings currently active and balanced.");
              }}
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT text-on-surface-variant font-body-md hover:bg-surface-container hover:text-on-surface transition-colors duration-150 active:scale-[0.99] text-left"
            >
              <span className="material-symbols-outlined text-muted-silver text-xl" data-icon="vpn_key">vpn_key</span>
              <span className="font-body-md text-sm">Key Rotations</span>
            </button>
            <button 
              onClick={() => {
                setIsSidebarOpen(false);
                showToast("Threat Intel: 0 anomalous ingress nodes detected in past 24h.");
              }}
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT text-on-surface-variant font-body-md hover:bg-surface-container hover:text-on-surface transition-colors duration-150 active:scale-[0.99] text-left"
            >
              <span className="material-symbols-outlined text-muted-silver text-xl" data-icon="security">security</span>
              <span className="font-body-md text-sm">Threat Intel</span>
            </button>
          </nav>
          
          {/* Quick Operational Utility Panel */}
          <div className="mt-4 p-3 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-body-sm font-label">
              <span className="text-muted-silver uppercase tracking-wider text-[11px]">Shift Protocol</span>
              <span className="px-2 py-0.5 rounded-full bg-mint/20 text-mint border border-mint/30 font-mono-data text-[10px] font-semibold">SYNCHRONIZED</span>
            </div>
            <p className="text-body-sm text-on-surface-variant text-[11px] leading-relaxed">
              Zero-Log Buffer shredding verified on all nodes. Next scheduled scrub in 18m.
            </p>
            <button 
              onClick={() => setActiveModal({
                title: "Emergency Key Shredder",
                description: "Immediately purge all in-memory ephemeral decryption keys across active edge nodes?",
                actionLabel: "Shred Keys Now",
                onConfirm: () => showToast("Emergency Key Shredder executed across all edge instances.")
              })}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-DEFAULT bg-surface-container border border-peach/40 text-peach hover:bg-peach hover:text-starlight-white transition-all text-xs font-mono-data font-medium" 
              type="button"
            >
              <span className="material-symbols-outlined text-sm" data-icon="delete_forever">delete_forever</span>
              <span>Emergency Key Shredder</span>
            </button>
          </div>
        </div>
        
        {/* Bottom Footer Links & Operator Identity Profile */}
        <div className="p-space-md flex flex-col gap-3 border-t border-white/10 bg-canvas-deep">
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => showToast("Diagnostics: 100% network nodes healthy.")}
              className="flex items-center gap-space-sm px-space-md py-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container hover:text-starlight-white transition-colors duration-150 text-left"
            >
              <span className="material-symbols-outlined text-lg" data-icon="tune">tune</span>
              <span className="text-body-sm">Diagnostics</span>
            </button>
            <Link 
              href="/admin/onboarding"
              className="flex items-center gap-space-sm px-space-md py-1.5 rounded-DEFAULT text-muted-silver hover:bg-surface-container hover:text-starlight-white transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-lg" data-icon="settings">settings</span>
              <span className="text-body-sm">Settings</span>
            </Link>
          </div>

          {/* Verified Operator Profile Badge */}
          <div className="p-2.5 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-secondary-container/20 border border-secondary/40 flex items-center justify-center text-secondary font-mono-data text-xs font-semibold">
                U09
              </div>
              <div className="flex flex-col">
                <span className="text-body-sm font-label text-starlight-white leading-tight font-medium">Admin SecOps // U09</span>
                <div className="flex items-center gap-1 text-[10px] text-mint font-mono-data">
                  <span className="material-symbols-outlined text-[12px]" data-icon="verified_user">verified_user</span>
                  <span>YubiKey FIDO2</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-muted-silver hover:text-primary-container transition-colors p-1" 
              title="Disconnect session" 
              type="button"
            >
              <span className="material-symbols-outlined text-lg" data-icon="logout">logout</span>
            </button>
          </div>

          {/* CTA Emergency Lock */}
          <button 
            onClick={() => setActiveModal({
              title: "Trigger Emergency System Lockdown",
              description: "This locks the administrative console and requires physical hardware FIDO2 re-attestation to unlock.",
              actionLabel: "Lockdown Console",
              onConfirm: () => {
                showToast("Console locked. Redirecting to onboarding attestation...");
                setTimeout(() => router.push("/admin/onboarding"), 1200);
              }
            })}
            className="w-full flex items-center justify-center gap-2 py-2 px-space-md rounded-DEFAULT bg-primary-container text-starlight-white font-headline-sm text-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-md" 
            type="button"
          >
            <span className="material-symbols-outlined text-base" data-icon="lock">lock</span>
            <span>Emergency Lock</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* ========================================================= */}
      {/* MAIN WORKSPACE & CENTRAL COCKPIT AREA                     */}
      {/* ========================================================= */}
      <main className="flex-1 min-h-screen flex flex-col bg-canvas-deep min-w-0">
        {/* Top Cockpit Header Bar */}
        <header className="sticky top-0 z-30 bg-elevated-onyx/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 border-b border-white/10 flex justify-between items-center w-full">
          {/* Breadcrumb & Search */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 rounded-md text-muted-silver hover:bg-surface-container-high hover:text-starlight-white"
              title="Toggle Menu"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-mono-data text-muted-silver">
                <span>Admin</span>
                <span>/</span>
                <span>Telemetry</span>
                <span>/</span>
                <span className="text-primary-fixed">Global Overview</span>
              </div>
              <h1 className="text-headline-md font-headline-md text-starlight-white tracking-tight mt-0.5">
                System Control & Telemetry
              </h1>
            </div>
            {/* Global Status Pill Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint/10 border border-mint/30 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-mint"></span>
              </span>
              <span className="text-xs font-mono-data font-medium text-mint tracking-tight">Status: All Systems Nominal</span>
            </div>
          </div>
          
          {/* Actions & Ingress Stream */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search bar */}
            <div className="relative hidden xl:block w-56">
              <span className="material-symbols-outlined absolute left-3 top-2 text-muted-silver text-sm" data-icon="search">search</span>
              <input 
                className="w-full bg-surface-container-lowest border border-white/10 rounded-full pl-9 pr-3 py-1 text-xs text-on-surface placeholder:text-muted-silver/60 focus:outline-none focus:ring-1 focus:ring-secondary font-mono-data" 
                placeholder="Search hash, node UUID..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Secondary Action */}
            <button 
              onClick={() => {
                showToast("Key rotation sequence initiated across cluster. Quorum healthy.");
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-secondary text-secondary hover:bg-secondary/10 transition-colors text-xs font-body-md font-medium active:scale-95" 
              type="button"
            >
              <span className="material-symbols-outlined text-sm" data-icon="autorenew">autorenew</span>
              <span className="hidden sm:inline">Force Key Rotation</span>
            </button>
            {/* Primary Action */}
            <button 
              onClick={() => setActiveModal({
                title: "Emergency Cluster Lockdown",
                description: "This will isolate all incoming ingress nodes, lock sessions, and require manual cryptographic re-attestation.",
                actionLabel: "Lockdown Cluster",
                onConfirm: () => showToast("Emergency cluster lockdown triggered.")
              })}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-container text-starlight-white hover:bg-primary-container/90 transition-all text-xs font-body-md font-semibold shadow-sm active:scale-95" 
              type="button"
            >
              <span className="material-symbols-outlined text-sm" data-icon="gpp_bad">gpp_bad</span>
              <span className="hidden sm:inline">Emergency Lockdown</span>
            </button>
            {/* Trailing Indicators */}
            <div className="flex items-center gap-1 ml-1 border-l border-white/10 pl-2">
              <button 
                onClick={() => showToast("Active incidents: 0 critical alerts.")}
                className="p-1.5 rounded-full text-muted-silver hover:text-starlight-white hover:bg-surface-container transition-colors relative" 
                title="Active Incidents" 
                type="button"
              >
                <span className="material-symbols-outlined text-lg" data-icon="notifications_active">notifications_active</span>
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-peach"></span>
              </button>
              <button 
                onClick={() => showToast("DNS Grid: 100% authoritative answers across anycast.")}
                className="p-1.5 rounded-full text-muted-silver hover:text-starlight-white hover:bg-surface-container transition-colors" 
                title="DNS Grid" 
                type="button"
              >
                <span className="material-symbols-outlined text-lg" data-icon="dns">dns</span>
              </button>
            </div>
          </div>
        </header>

        {/* Cockpit Scrollable Content Canvas */}
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-space-lg">
          {/* ======================================================= */}
          {/* ROW 1: High-Level Cockpit Metric Cards (4 Columns)     */}
          {/* ======================================================= */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="p-5 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-body-sm font-label text-muted-silver">Encrypted Sessions (24h)</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-mint/15 text-mint border border-mint/20 text-xs font-mono-data font-semibold">
                  <span className="material-symbols-outlined text-[13px]" data-icon="trending_up">trending_up</span>
                  <span>+14.2%</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-headline-xl font-headline-xl font-bold font-mono-data text-starlight-white tracking-tight">4,821</span>
                <div className="h-6 w-20 flex items-end gap-1">
                  <span className="w-1.5 h-2 bg-mint/40 rounded-t-sm"></span>
                  <span className="w-1.5 h-3 bg-mint/60 rounded-t-sm"></span>
                  <span className="w-1.5 h-4 bg-mint/50 rounded-t-sm"></span>
                  <span className="w-1.5 h-3.5 bg-mint/70 rounded-t-sm"></span>
                  <span className="w-1.5 h-5 bg-mint/80 rounded-t-sm"></span>
                  <span className="w-1.5 h-6 bg-mint rounded-t-sm shadow-[0_0_8px_rgba(5,150,105,0.6)]"></span>
                </div>
              </div>
              <div className="mt-2 text-xs font-body-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-mint"></span>
                <span>Multi-hop onion routing active</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-5 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-body-sm font-label text-muted-silver">Responder Utilization</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20 text-xs font-mono-data">OPTIMAL</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-headline-xl font-headline-xl font-bold font-mono-data text-starlight-white tracking-tight">78%</span>
                <div className="w-24 bg-surface-container rounded-full h-2 overflow-hidden flex">
                  <div className="bg-secondary h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{ width: "78%" }}></div>
                </div>
              </div>
              <div className="mt-2 text-xs font-body-sm text-on-surface-variant flex items-center justify-between">
                <span>18 of 23 Nodes Active</span>
                <span className="font-mono-data text-secondary">5 Standby</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-5 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-body-sm font-label text-muted-silver">Avg Queue Latency</span>
                <span className="text-xs font-mono-data text-mint font-medium px-2 py-0.5 rounded-full bg-mint/10 border border-mint/20">Target &lt; 2m</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-headline-xl font-headline-xl font-bold font-mono-data text-starlight-white tracking-tight">1m 04s</span>
                <span className="material-symbols-outlined text-mint text-2xl" data-icon="speed">speed</span>
              </div>
              <div className="mt-2 text-xs font-body-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-mint" data-icon="check_circle">check_circle</span>
                <span>Zero congestion spikes in buffer</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-5 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-body-sm font-label text-muted-silver">Ephemeral Shards Purged</span>
                <span className="material-symbols-outlined text-rose text-lg" data-icon="auto_delete">auto_delete</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-headline-xl font-headline-xl font-bold font-mono-data text-starlight-white tracking-tight">12,490</span>
                <span className="text-xs font-mono-data text-rose font-medium">Auto-Tear</span>
              </div>
              <div className="mt-2 text-xs font-body-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-tertiary" data-icon="verified">verified</span>
                <span className="truncate">Zero-Knowledge Guarantee: 100% Verified</span>
              </div>
            </div>
          </section>

          {/* ======================================================= */}
          {/* ROW 2: Middle Section (Asymmetric Grid 7/12 & 5/12)     */}
          {/* ======================================================= */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Global Relay Nodes & Ephemeral Mesh (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between relative overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between z-10">
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-starlight-white">Global Relay Nodes & Ephemeral Mesh</h2>
                  <p className="text-body-sm text-muted-silver mt-0.5">Real-time telemetry across cross-region decentralized proxies</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high border border-white/10 font-mono-data text-xs text-starlight-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-mint"></span>
                    <span>4 Active</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high border border-peach/30 font-mono-data text-xs text-peach flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-peach"></span>
                    <span>1 Syncing</span>
                  </span>
                </div>
              </div>

              {/* Stylized Dark Mesh Interactive Network Map Canvas */}
              <div className="my-6 h-64 w-full relative bg-surface-container-lowest/60 rounded-DEFAULT border border-white/5 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(#FAFAFA 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
                <svg className="absolute inset-0 w-full h-full stroke-white/10 fill-none" preserveAspectRatio="none" viewBox="0 0 700 280">
                  <path d="M 120,60 Q 180,50 240,90 T 320,130 T 400,80 T 520,70 T 630,110" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" strokeWidth="1.5"></path>
                  <path d="M 140,160 Q 220,170 300,200 T 480,210 T 600,190" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" strokeWidth="1.5"></path>
                  <path d="M 130,95 Q 260,30 360,85" stroke="rgba(5, 150, 105, 0.4)" strokeDasharray="6 3" strokeWidth="1.5"></path>
                  <path d="M 360,85 Q 480,40 580,105" stroke="rgba(5, 150, 105, 0.4)" strokeDasharray="6 3" strokeWidth="1.5"></path>
                  <path d="M 130,95 Q 220,70 330,75" stroke="rgba(234, 88, 12, 0.5)" strokeDasharray="3 3" strokeWidth="1.5"></path>
                  <path d="M 360,85 Q 310,180 230,220" stroke="rgba(5, 150, 105, 0.4)" strokeDasharray="6 3" strokeWidth="1.5"></path>
                </svg>

                {/* Node 1 */}
                <div onClick={() => showToast("Node US-West: 22ms latency, 100% packets routed.")} className="absolute left-[18%] top-[34%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full bg-mint/30 animate-ping" style={{ animationDuration: "2.8s" }}></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-mint border-2 border-canvas-deep shadow-[0_0_10px_#059669]"></span>
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-elevated-onyx/90 border border-mint/40 text-[10px] font-mono-data text-starlight-white shadow">
                    US-West (OR) <span className="text-mint font-semibold">22ms</span>
                  </div>
                </div>

                {/* Node 2 */}
                <div onClick={() => showToast("Node EU-West: Re-keying cycle at 94% completion.")} className="absolute left-[47%] top-[27%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-peach/30 animate-ping" style={{ animationDuration: "2.8s" }}></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-peach border-2 border-canvas-deep shadow-[0_0_10px_#EA580C]"></span>
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-elevated-onyx/90 border border-peach/50 text-[10px] font-mono-data text-starlight-white shadow flex items-center gap-1">
                    <span>EU-West (LON)</span>
                    <span className="text-peach font-semibold animate-pulse">Re-keying 94%</span>
                  </div>
                </div>

                {/* Node 3 */}
                <div onClick={() => showToast("Node EU-Central: 14ms latency, ultra-low jitter.")} className="absolute left-[52%] top-[31%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full bg-mint/30 animate-ping" style={{ animationDuration: "2.8s" }}></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-mint border-2 border-canvas-deep shadow-[0_0_10px_#059669]"></span>
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-elevated-onyx/90 border border-mint/40 text-[10px] font-mono-data text-starlight-white shadow">
                    EU-Central (FRA) <span className="text-mint font-semibold">14ms</span>
                  </div>
                </div>

                {/* Node 4 */}
                <div onClick={() => showToast("Node AP-North: 48ms latency, zero packet loss.")} className="absolute left-[83%] top-[38%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full bg-mint/30 animate-ping" style={{ animationDuration: "2.8s" }}></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-mint border-2 border-canvas-deep shadow-[0_0_10px_#059669]"></span>
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-elevated-onyx/90 border border-mint/40 text-[10px] font-mono-data text-starlight-white shadow">
                    AP-North (HND) <span className="text-mint font-semibold">48ms</span>
                  </div>
                </div>

                {/* Node 5 */}
                <div onClick={() => showToast("Node SA-East: 61ms latency, mesh backup active.")} className="absolute left-[33%] top-[78%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full bg-mint/30 animate-ping" style={{ animationDuration: "2.8s" }}></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-mint border-2 border-canvas-deep shadow-[0_0_10px_#059669]"></span>
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-elevated-onyx/90 border border-mint/40 text-[10px] font-mono-data text-starlight-white shadow">
                    SA-East (GRU) <span className="text-mint font-semibold">61ms</span>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Micro Stats */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5 font-mono-data">
                <div className="flex flex-col">
                  <span className="text-body-sm text-muted-silver text-xs">Total Node Throughput</span>
                  <span className="text-sm font-semibold text-starlight-white mt-0.5">8.42 Gbps / burst</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-body-sm text-muted-silver text-xs">Mesh Packet Dispersion</span>
                  <span className="text-sm font-semibold text-mint mt-0.5">99.98% Non-Correlated</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-body-sm text-muted-silver text-xs">Dynamic Re-route Lag</span>
                  <span className="text-sm font-semibold text-secondary mt-0.5">&lt; 180μs automated</span>
                </div>
              </div>
            </div>

            {/* Right: Real-time Cryptographic Health & Rotations (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-headline-sm font-headline-sm text-starlight-white">Cryptographic Health</h2>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 border border-secondary/30 text-secondary text-xs font-mono-data">AES-256-GCM</span>
                </div>
                <p className="text-body-sm text-muted-silver mt-0.5">Automated Shamir Sharding & Onion Ingress Ledger</p>

                {/* Key Lifespan Progress Gauge */}
                <div className="mt-5 p-4 rounded-DEFAULT bg-surface-container-lowest border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-body-md text-starlight-white font-medium">Ephemeral Root Key Lifespan</span>
                    <span className="font-mono-data text-peach font-semibold">04m : 12s remaining</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-secondary via-tertiary to-peach h-full rounded-full transition-all duration-300" style={{ width: "68%" }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono-data text-muted-silver mt-0.5">
                    <span>Cycle #9812-B</span>
                    <span>Auto-Re-key at 00m : 00s</span>
                  </div>
                </div>

                {/* Shamir Secret Sharing Breakdown Card */}
                <div className="mt-4 p-4 rounded-DEFAULT bg-surface-container-lowest border border-white/5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-mint text-base" data-icon="vpn_key">vpn_key</span>
                      <span className="text-xs font-headline-sm text-starlight-white">Shamir Shard Threshold (5-of-9)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-mint/20 text-mint text-[11px] font-mono-data font-semibold">QUORUM HEALTHY</span>
                  </div>
                  {/* Shard visual matrix pills */}
                  <div className="grid grid-cols-9 gap-1.5 mt-1">
                    <div className="h-6 rounded bg-mint/30 border border-mint/60 flex items-center justify-center font-mono-data text-[10px] text-mint font-bold" title="Node US-W">S1</div>
                    <div className="h-6 rounded bg-mint/30 border border-mint/60 flex items-center justify-center font-mono-data text-[10px] text-mint font-bold" title="Node EU-C">S2</div>
                    <div className="h-6 rounded bg-mint/30 border border-mint/60 flex items-center justify-center font-mono-data text-[10px] text-mint font-bold" title="Node AP-N">S3</div>
                    <div className="h-6 rounded bg-mint/30 border border-mint/60 flex items-center justify-center font-mono-data text-[10px] text-mint font-bold" title="Node SA-E">S4</div>
                    <div className="h-6 rounded bg-mint/30 border border-mint/60 flex items-center justify-center font-mono-data text-[10px] text-mint font-bold" title="Node CA-C">S5</div>
                    <div className="h-6 rounded bg-peach/20 border border-peach/50 flex items-center justify-center font-mono-data text-[10px] text-peach font-bold" title="London Re-key">S6</div>
                    <div className="h-6 rounded bg-surface-container border border-white/10 flex items-center justify-center font-mono-data text-[10px] text-muted-silver" title="Standby">S7</div>
                    <div className="h-6 rounded bg-surface-container border border-white/10 flex items-center justify-center font-mono-data text-[10px] text-muted-silver" title="Standby">S8</div>
                    <div className="h-6 rounded bg-surface-container border border-white/10 flex items-center justify-center font-mono-data text-[10px] text-muted-silver" title="Standby">S9</div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-mono-data leading-tight">
                    Quorum requirement met. 5 valid cryptographic fragments currently holding decryption bridge.
                  </p>
                </div>
              </div>
              
              {/* Ingress Protocol Bar */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono-data">
                <span className="text-muted-silver">Tor Ingress Bandwidth</span>
                <div className="flex items-center gap-2">
                  <span className="text-secondary font-semibold">1,489 pkts/sec</span>
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================= */}
          {/* ROW 3: Recent Audit Logs & Incident Ledger             */}
          {/* ======================================================= */}
          <section id="audit-logs" className="p-6 rounded-DEFAULT bg-elevated-onyx border border-white/10 flex flex-col gap-4">
            {/* Table Header & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-headline-sm font-headline-sm text-starlight-white">Recent Audit Logs & Incident Ledger</h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container border border-white/10 text-muted-silver font-mono-data text-xs">
                    {filteredRecords.length} displayed
                  </span>
                </div>
                <p className="text-body-sm text-muted-silver mt-0.5">High-fidelity cryptographic trace logs. Zero persistent PII stored.</p>
              </div>
              {/* Category Filter Tabs & Fast Search */}
              <div className="flex items-center gap-3">
                <div className="flex items-center p-1 rounded-DEFAULT bg-surface-container-lowest border border-white/5 text-xs font-body-md">
                  {(["All Events", "Security", "Shards", "Rotations"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedFilter(tab)}
                      className={`px-3 py-1 rounded transition-colors ${selectedFilter === tab ? "bg-surface-container-high text-starlight-white font-medium shadow-sm" : "text-muted-silver hover:text-starlight-white"}`}
                      type="button"
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleExportLedger}
                  className="p-2 rounded-DEFAULT bg-surface-container border border-white/10 text-muted-silver hover:text-starlight-white transition-colors" 
                  title="Export Ledger" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg" data-icon="download">download</span>
                </button>
              </div>
            </div>

            {/* High Density Professional Data Table (8pt density) */}
            <div className="overflow-x-auto rounded-DEFAULT border border-white/5 bg-surface-container-lowest/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-surface-container/60 text-muted-silver text-xs font-label">
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Timestamp (UTC)</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Event Type</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Initiator Hash / UUID</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Routing Protocol</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Ledger Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono-data text-xs">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-surface-container/40 transition-colors">
                      <td className="py-3 px-4 text-starlight-white whitespace-nowrap">{rec.timestamp}</td>
                      <td className="py-3 px-4 font-body-md font-medium text-starlight-white flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${rec.category === "Security" ? "bg-mint" : rec.category === "Rotations" ? "bg-peach" : "bg-secondary"}`}></span>
                        <span>{rec.eventType}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-silver truncate max-w-xs">{rec.initiator}</td>
                      <td className="py-3 px-4 text-on-surface-variant font-mono-data text-[12px]">{rec.protocol}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          rec.status.includes("Success") || rec.status.includes("Purged")
                            ? "bg-mint/20 text-mint border border-mint/30"
                            : rec.status.includes("Blocked")
                            ? "bg-rose/20 text-rose border border-rose/30"
                            : "bg-secondary/20 text-secondary border border-secondary/30"
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => setInspectedRecord(rec)}
                          className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-white/10 text-secondary text-[11px] transition-all" 
                          type="button"
                        >
                          Inspect Hash
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-silver">
                        No audit records match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Pagination & Ledger Integrity Hash */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-silver gap-2 pt-1 font-mono-data">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-mint" data-icon="lock_clock">lock_clock</span>
                <span>Ledger Merkle Root: 0x9f7b...e4a1</span>
                <span className="text-mint font-semibold">[VERIFIED IMMUTABLE]</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Showing {filteredRecords.length} records</span>
                <div className="flex gap-1 ml-2">
                  <button 
                    onClick={() => showToast("Page 1 of 1")}
                    className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-white/10 text-starlight-white disabled:opacity-30" 
                    type="button"
                  >
                    Prev
                  </button>
                  <button 
                    onClick={() => showToast("Page 1 of 1")}
                    className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-white/10 text-starlight-white" 
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
