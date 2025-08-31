import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import MobileNav from "./MobileNav";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
        <div className="flex items-center gap-3 h-14">
          <Link to="/" className="shrink-0">
            <span className="text-2xl font-black tracking-tight text-primary">NEO10</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 max-w-sm w-full ml-auto">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                className="pl-8 h-9 rounded-full bg-muted/60 focus-visible:ring-1"
                placeholder="Search"
                onKeyDown={(e) => { if (e.key === "Enter") navigate("/search"); }}
              />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button onClick={() => navigate("/create")} className="grid place-items-center h-9 w-9 rounded-full bg-muted/60">
              <Plus className="size-5" />
            </button>
            <button onClick={() => navigate("/search")} className="grid place-items-center h-9 w-9 rounded-full bg-muted/60">
              <Search className="size-5" />
            </button>
            <button onClick={() => navigate("/profile")} className="grid place-items-center h-9 w-9 rounded-full bg-muted/60">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-2 md:hidden border-t">
        <MobileNav />
      </div>
    </header>
  );
}
