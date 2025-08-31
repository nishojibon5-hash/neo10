import { Link } from "react-router-dom";
import { MessageSquare, Settings, ShieldCheck, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const shortcuts = [
  { to: "/ads/create", label: "Create Ads", icon: MessageSquare },
  { to: "/messages", label: "Messenger", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/privacy", label: "Privacy", icon: ShieldCheck },
  { to: "/help", label: "Help Center", icon: HelpCircle },
];

export default function RightSidebar() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://i.pravatar.cc/100?img=68" alt="Md Salman" />
            <AvatarFallback>MS</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold leading-tight">Md Salman</p>
            <p className="text-xs text-muted-foreground">View your profile</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-3 border-b font-semibold">Shortcuts</div>
        <ul className="p-2">
          {shortcuts.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60"
              >
                <Icon className="size-5 text-muted-foreground" />
                <span className="text-sm">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
