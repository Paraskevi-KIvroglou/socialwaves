"use client";
import { useEffect, useRef, useState } from "react";
import type { ReportKind, Report } from "@/lib/types";
import { useCreateReport } from "@/lib/reports";
import { getSession } from "@/lib/mockAuth";
import { ReportButtons } from "./ReportButtons";

export function ReportSheet({
  open,
  onClose,
  beachId,
  beachName,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  beachId: string;
  beachName: string;
  onSubmitted?: (r: Report) => void;
}) {
  const createReport = useCreateReport();
  const ref = useRef<HTMLDialogElement>(null);
  const [kind, setKind] = useState<ReportKind | undefined>();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "done">("idle");

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setKind(undefined);
      setNote("");
      setStatus("idle");
    }
  }, [open]);

  async function handleSubmit() {
    if (!kind) return;
    const user = getSession();
    const id = await createReport({
      beachSlug: beachId,
      kind,
      note: note.trim() || undefined,
      userHandle: user?.handle ?? "anon_surfer",
    });
    setStatus("done");
    onSubmitted?.({
      id: String(id),
      beachId,
      kind,
      note: note.trim() || undefined,
      userHandle: user?.handle ?? "anon_surfer",
      createdAt: new Date().toISOString(),
    });
    setTimeout(() => onClose(), 900);
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="bg-transparent p-0 w-full max-w-md m-0 ml-auto mr-auto mt-auto mb-0 backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
    >
      <div className="rounded-t-3xl bg-white p-5 pb-8 shadow-[0_-20px_60px_rgba(14,165,233,0.25)]">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 mb-4" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">How was {beachName}?</h2>
            <p className="text-sm text-slate-500">Your report helps fellow surfers.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-slate-100 text-slate-500 text-lg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {status === "done" ? (
          <div className="mt-6 rounded-2xl bg-sand-100 border border-sand-200 p-4 text-center">
            <div className="text-3xl">🙏</div>
            <div className="mt-2 font-semibold text-sand-800">Thanks for the stoke report!</div>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <ReportButtons onSelect={setKind} selected={kind} />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-500 mb-1" htmlFor="note">
                Optional note
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Glassy waist-high, 8s period, barely anyone out…"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm focus:bg-white resize-none"
                rows={3}
                maxLength={240}
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!kind}
              className="mt-4 w-full rounded-2xl bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 shadow-[var(--shadow-soft)] active:scale-[0.99]"
            >
              Post report 🦀
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}
