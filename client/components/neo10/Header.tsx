import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, Users, Video, Store, Bell, MessageSquare, Search, User, PlusCircle, LogOut, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getToken, clearToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import MobileNav from "./MobileNav";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/videos", label: "Videos", icon: Video },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export default function Header() {
  const navigate = useNavigate();
  const [logged, setLogged] = useState<boolean>(Boolean(getToken()));
  useEffect(() => {
    const onChange = () => setLogged(Boolean(getToken()));
    window.addEventListener("auth:change", onChange);
    return () => window.removeEventListener("auth:change", onChange);
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto max-w-6xl flex items-center gap-3 px-2 sm:px-4 h-14">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black md:hidden">NEO10</span>
          <div className="hidden md:grid place-items-center size-9 rounded-full bg-primary text-primary-foreground font-extrabold">N</div>
          <span className="font-extrabold tracking-tight text-lg hidden sm:block">NEO10</span>
        </Link>
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-2 max-w-sm w-full">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-8 h-9 rounded-full bg-muted/60 focus-visible:ring-1"
              placeholder="Search NEO10"
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate("/search");
              }}
            />
          </div>
        </div>
        <nav className="flex items-center gap-1 sm:gap-2 ml-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center justify-center rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  isActive && "text-primary bg-primary/10 hover:bg-primary/15"
                )
              }
              title={label}
            >
              <Icon className="size-5" />
            </NavLink>
          ))}
          <NavLink
            to="/messages"
            className={({ isActive }) =>
              cn(
                "inline-flex items-center justify-center rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/60",
                isActive && "text-primary bg-primary/10 hover:bg-primary/15"
              )
            }
            title="Messages"
          >
            <MessageSquare className="size-5" />
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                "inline-flex items-center justify-center rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/60",
                isActive && "text-primary bg-primary/10 hover:bg-primary/15"
              )
            }
            title="Profile"
          >
            <User className="size-5" />
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) =>
              cn(
                "inline-flex items-center justify-center rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/60",
                isActive && "text-primary bg-primary/10 hover:bg-primary/15"
              )
            }
            title="Create"
          >
            <PlusCircle className="size-5" />
          </NavLink>
          {logged ? (
            <button
              onClick={() => { clearToken(); setLogged(false); }}
              className="inline-flex items-center justify-center rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              title="Logout"
            >
              <LogOut className="size-5" />
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center justify-center rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  isActive && "text-primary bg-primary/10 hover:bg-primary/15"
                )
              }
              title="Login"
            >
              <LogIn className="size-5" />
            </NavLink>
          )}
        </nav>
      </div>
      {/* Mobile nav tabs */}
      <div className="mx-auto max-w-6xl px-2 md:hidden border-t">
        <MobileNav />
      </div>
    </header>
  );
}
