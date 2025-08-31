import { ReactNode } from "react";
import Header from "./Header";
import RightSidebar from "./RightSidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-6xl px-2 sm:px-4 pt-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
        <div>{children}</div>
        <aside className="hidden lg:block">
          <RightSidebar />
        </aside>
      </main>
    </div>
  );
}
