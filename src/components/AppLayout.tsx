
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 md:hidden">
          <MobileNav />
        </div>
        <Navbar />
      </div>
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
}
