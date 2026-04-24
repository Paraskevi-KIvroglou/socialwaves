"use client";
import { useState } from "react";
import { ReportSheet } from "@/components/ReportSheet";

export function ReportCTA({ beachId, beachName }: { beachId: string; beachName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-sand-500 hover:bg-sand-600 text-white font-semibold py-4 shadow-[var(--shadow-pop)] active:scale-[0.99] transition"
      >
        <span className="mr-2" aria-hidden>🦀</span>
        Report this session
      </button>
      <ReportSheet
        open={open}
        onClose={() => setOpen(false)}
        beachId={beachId}
        beachName={beachName}
      />
    </>
  );
}
