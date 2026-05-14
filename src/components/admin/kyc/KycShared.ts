export type KycState = "submitted" | "in_review" | "info_requested" | "approved" | "rejected" | "expired";

export type KycDoc = { name: string; type: "ID Front" | "ID Back" | "Selfie" | "Address" | "Tax ID" | "Source of Funds"; status: "Pending" | "Verified" | "Rejected"; uploaded: string };

export type KycRecord = {
  id: string;
  user: string;
  email: string;
  country: string;
  level: "Basic" | "Standard" | "Enhanced";
  state: KycState;
  riskScore: number;
  pep: boolean;
  sanctions: boolean;
  submitted: string;
  expiresAt?: string;
  reviewer?: string;
  rejectionCode?: string;
  rejectionNote?: string;
  resubmitCount: number;
  docs: KycDoc[];
};

export const seedKyc: KycRecord[] = [
  { id: "KYC-7001", user: "Sofia Almeida", email: "sofia@lusitana.vc", country: "PT", level: "Standard", state: "submitted", riskScore: 22, pep: false, sanctions: false, submitted: "2025-05-13", resubmitCount: 0, docs: [
    { name: "passport.pdf", type: "ID Front", status: "Pending", uploaded: "2025-05-13" },
    { name: "selfie.jpg", type: "Selfie", status: "Pending", uploaded: "2025-05-13" },
    { name: "utility-bill.pdf", type: "Address", status: "Pending", uploaded: "2025-05-13" },
  ]},
  { id: "KYC-7002", user: "Marcus Chen", email: "marcus@northbeam.com", country: "US", level: "Enhanced", state: "in_review", riskScore: 14, pep: false, sanctions: false, submitted: "2025-05-12", reviewer: "fatima@zynk.ing", resubmitCount: 0, docs: [
    { name: "drivers-license-front.jpg", type: "ID Front", status: "Verified", uploaded: "2025-05-12" },
    { name: "drivers-license-back.jpg", type: "ID Back", status: "Verified", uploaded: "2025-05-12" },
    { name: "selfie-liveness.mp4", type: "Selfie", status: "Verified", uploaded: "2025-05-12" },
    { name: "w9.pdf", type: "Tax ID", status: "Pending", uploaded: "2025-05-12" },
  ]},
  { id: "KYC-7003", user: "Ahmed Al-Rashid", email: "ahmed@wadi.ae", country: "AE", level: "Enhanced", state: "info_requested", riskScore: 38, pep: true, sanctions: false, submitted: "2025-05-11", reviewer: "fatima@zynk.ing", resubmitCount: 1, rejectionCode: "INCOMPLETE_EVIDENCE", rejectionNote: "Source-of-funds document missing.", docs: [
    { name: "emirates-id.pdf", type: "ID Front", status: "Verified", uploaded: "2025-05-11" },
    { name: "selfie.jpg", type: "Selfie", status: "Verified", uploaded: "2025-05-11" },
  ]},
  { id: "KYC-7004", user: "Hannah Müller", email: "hannah@berliner-angels.de", country: "DE", level: "Standard", state: "rejected", riskScore: 78, pep: false, sanctions: false, submitted: "2025-05-08", reviewer: "david@zynk.ing", resubmitCount: 2, rejectionCode: "DOC_FRAUD_SUSPECTED", rejectionNote: "Tampered ID detected by Onfido (confidence 0.91).", docs: [
    { name: "id-front.jpg", type: "ID Front", status: "Rejected", uploaded: "2025-05-08" },
  ]},
  { id: "KYC-7005", user: "Yuki Tanaka", email: "yuki@mori.jp", country: "JP", level: "Standard", state: "approved", riskScore: 12, pep: false, sanctions: false, submitted: "2025-04-29", reviewer: "fatima@zynk.ing", resubmitCount: 0, expiresAt: "2026-04-29", docs: [
    { name: "mynumber-card.pdf", type: "ID Front", status: "Verified", uploaded: "2025-04-29" },
    { name: "selfie.jpg", type: "Selfie", status: "Verified", uploaded: "2025-04-29" },
    { name: "address.pdf", type: "Address", status: "Verified", uploaded: "2025-04-29" },
  ]},
  { id: "KYC-7006", user: "Priya Sharma", email: "priya@altair.in", country: "IN", level: "Basic", state: "expired", riskScore: 30, pep: false, sanctions: false, submitted: "2024-04-12", reviewer: "fatima@zynk.ing", resubmitCount: 0, expiresAt: "2025-04-12", docs: [
    { name: "aadhaar.pdf", type: "ID Front", status: "Verified", uploaded: "2024-04-12" },
  ]},
];

export const stateColor: Record<KycState, string> = {
  submitted: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  in_review: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  info_requested: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-destructive/15 text-destructive",
  expired: "bg-muted text-muted-foreground",
};

export const REJECTION_CODES = [
  "DOC_BLURRY",
  "DOC_EXPIRED",
  "DOC_FRAUD_SUSPECTED",
  "DOC_MISMATCH_NAME",
  "SELFIE_LIVENESS_FAILED",
  "INCOMPLETE_EVIDENCE",
  "AML_SANCTIONS_HIT",
  "AML_PEP_UNDISCLOSED",
  "JURISDICTION_BLOCKED",
  "AGE_BELOW_MIN",
] as const;

import { useSyncExternalStore } from "react";

let _records: KycRecord[] = seedKyc;
const _listeners = new Set<() => void>();
const _emit = () => _listeners.forEach((l) => l());

export const kycStore = {
  get: () => _records,
  setAll: (r: KycRecord[]) => { _records = r; _emit(); },
  update: (id: string, patch: Partial<KycRecord>) => {
    _records = _records.map((r) => (r.id === id ? { ...r, ...patch } : r));
    _emit();
  },
  subscribe: (l: () => void) => { _listeners.add(l); return () => { _listeners.delete(l); }; },
};

export function useKycRecords() {
  return useSyncExternalStore(kycStore.subscribe, kycStore.get, kycStore.get);
}
