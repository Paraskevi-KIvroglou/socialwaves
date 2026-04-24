"use client";
import type { Report, ReportKind } from "./types";
import { REPORT_META } from "./reportMeta";

export { REPORT_META };

const KEY = "socialwave.reports.v1";

export function loadLocalReports(): Report[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Report[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalReport(input: {
  beachId: string;
  kind: ReportKind;
  note?: string;
  userHandle: string;
}): Report {
  const report: Report = {
    id: `r_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    beachId: input.beachId,
    kind: input.kind,
    note: input.note,
    userHandle: input.userHandle,
    createdAt: new Date().toISOString(),
  };
  const existing = loadLocalReports();
  const next = [report, ...existing].slice(0, 200);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return report;
}

