import { Plus } from "lucide-react";

const stories = [
  { id: 1, name: "You", img: "https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=500&auto=format&fit=crop" },
  { id: 2, name: "Ayesha", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop" },
  { id: 3, name: "Rahim", img: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=500&auto=format&fit=crop" },
  { id: 4, name: "Nusrat", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=500&auto=format&fit=crop" },
  { id: 5, name: "Hasan", img: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=500&auto=format&fit=crop" },
  { id: 6, name: "Sadia", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=500&auto=format&fit=crop" },
];

export default function Stories() {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto">
      {/* Create story */}
      <button className="relative flex w-28 shrink-0 flex-col overflow-hidden rounded-xl border bg-card text-left">
        <div className="h-32 w-full bg-muted/60" />
        <div className="p-2 text-sm">Create story</div>
        <div className="absolute bottom-2 left-2 grid place-items-center size-7 rounded-full bg-primary text-primary-foreground border-2 border-white shadow">
          <Plus className="size-4" />
        </div>
      </button>
      {stories.map((s) => (
        <div key={s.id} className="relative w-28 shrink-0 overflow-hidden rounded-xl border">
          <img src={s.img} alt={s.name} className="h-40 w-28 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/0" />
          <div className="absolute bottom-0 p-2 text-xs font-medium text-white drop-shadow">{s.name}</div>
        </div>
      ))}
    </div>
  );
}
