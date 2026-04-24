"use client";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { ReportKind } from "./types";
import { REPORT_META } from "./reportMeta";

export { REPORT_META };

export function useCreateReport() {
  const create = useMutation(api.reports.create);
  return async function createReport(input: {
    beachSlug: string;
    kind: ReportKind;
    note?: string;
    userHandle: string;
  }) {
    return await create(input);
  };
}
