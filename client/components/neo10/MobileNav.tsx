import { Link } from "react-router-dom";
import { Home, Users, MessageCircle, Video, Bell, User } from "lucide-react";

function IconItem({ to, children, badge }: { to: string; children: React.ReactNode; badge?: string }) {
  return (
    <Link to={to} className="relative flex-1 grid place-items-center py-2">
      {children}
      {badge && (
        <span className="absolute -top-1.5 right-3 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 text-center shadow">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function MobileNav() {
  return (
    <div className="md:hidden grid grid-cols-6 text-gray-700">
      <IconItem to="/"><Home className="size-6" /></IconItem>
      <IconItem to="/friends"><Users className="size-6" /></IconItem>
      <IconItem to="/messages" badge=""><MessageCircle className="size-6" /></IconItem>
      <IconItem to="/videos" badge="8"><Video className="size-6" /></IconItem>
      <IconItem to="/notifications"><Bell className="size-6" /></IconItem>
      <IconItem to="/profile"><User className="size-6" /></IconItem>
    </div>
  );
}
