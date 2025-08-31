import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Plus, MoreHorizontal, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MobileNav from "./MobileNav";
import { getUser, clearToken } from "@/lib/auth";

function MenuContent({ onNavigate }: { onNavigate: (to: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <SheetHeader>
        <SheetTitle>Menu</SheetTitle>
      </SheetHeader>
      <nav className="flex-1 py-2">
        <button onClick={() => onNavigate('/profile')} className="w-full text-left px-3 py-2 hover:bg-muted/60 rounded-md">Profile</button>
        <button onClick={() => onNavigate('/friends')} className="w-full text-left px-3 py-2 hover:bg-muted/60 rounded-md">Friends</button>
        <button onClick={() => onNavigate('/videos')} className="w-full text-left px-3 py-2 hover:bg-muted/60 rounded-md">Videos</button>
        <button onClick={() => onNavigate('/marketplace')} className="w-full text-left px-3 py-2 hover:bg-muted/60 rounded-md">Marketplace</button>
        <button onClick={() => onNavigate('/ads/create')} className="w-full text-left px-3 py-2 hover:bg-muted/60 rounded-md">Create Ads</button>
        <button onClick={() => onNavigate('/ads/dashboard')} className="w-full text-left px-3 py-2 hover:bg-muted/60 rounded-md">Ads Dashboard</button>
        <button onClick={() => onNavigate('/settings')} className="w-full text-left px-3 py-2 hover:bg-muted/60 rounded-md">Settings</button>
      </nav>
      <div className="border-t py-2">
        <button onClick={() => { clearToken(); onNavigate('/login'); }} className="w-full text-left px-3 py-2 hover:bg-muted/60 rounded-md">Log out</button>
      </div>
    </div>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const canGoBack = location.pathname !== "/";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
        <div className="flex items-center gap-3 h-14">
          {canGoBack ? (
            <button onClick={() => navigate(-1)} className="grid place-items-center h-9 w-9 rounded-full hover:bg-muted/60">
              <ChevronLeft className="size-5" />
            </button>
          ) : (
            <Link to="/" className="shrink-0">
              <span className="text-2xl font-black tracking-tight text-primary">NEO10</span>
            </Link>
          )}

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

          <div className="ml-auto hidden md:flex items-center gap-2">
            <button onClick={() => navigate("/create")} className="grid place-items-center h-9 w-9 rounded-full bg-muted/60">
              <Plus className="size-5" />
            </button>
            <Link to="/profile" className="rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={(user?.avatar_url as string) || "https://i.pravatar.cc/100?img=68"} alt={user?.name || "You"} />
                <AvatarFallback>{(user?.name || "U").slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <button className="grid place-items-center h-9 w-9 rounded-full bg-muted/60">
                  <MoreHorizontal className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <MenuContent onNavigate={(to) => navigate(to)} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button onClick={() => navigate("/create")} className="grid place-items-center h-9 w-9 rounded-full bg-muted/60">
              <Plus className="size-5" />
            </button>
            <button onClick={() => navigate("/search")} className="grid place-items-center h-9 w-9 rounded-full bg-muted/60">
              <Search className="size-5" />
            </button>
            <Link to="/profile" className="rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={(user?.avatar_url as string) || "https://i.pravatar.cc/100?img=68"} alt={user?.name || "You"} />
                <AvatarFallback>{(user?.name || "U").slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <button className="grid place-items-center h-9 w-9 rounded-full bg-muted/60">
                  <MoreHorizontal className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <MenuContent onNavigate={(to) => navigate(to)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-2 md:hidden border-t">
        <MobileNav />
      </div>
    </header>
  );
}
