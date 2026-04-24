import { TopHeader } from "./TopHeader";
import { BottomTabs } from "./BottomTabs";

export function AppShell({
  children,
  greeting,
}: {
  children: React.ReactNode;
  greeting?: string;
}) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-sky-50 via-white to-white flex flex-col">
      <TopHeader greeting={greeting} />
      <main className="flex-1 mx-auto max-w-md w-full px-4 pb-28 pt-4 space-y-4">
        {children}
      </main>
      <BottomTabs />
    </div>
  );
}
