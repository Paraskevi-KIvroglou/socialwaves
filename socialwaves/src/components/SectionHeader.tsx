export function SectionHeader({ title, emoji, action }: { title: string; emoji?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mt-2 mb-1 px-1">
      <h2 className="text-lg font-bold text-slate-900">
        {emoji ? <span aria-hidden className="mr-1.5">{emoji}</span> : null}
        {title}
      </h2>
      {action ? <div className="text-sm text-sky-600 font-medium">{action}</div> : null}
    </div>
  );
}
