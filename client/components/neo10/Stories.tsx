import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uploadAsset } from "@/lib/upload";
import { getToken } from "@/lib/auth";

interface Story { id: string; name: string; avatar?: string; image_url?: string; video_url?: string; }

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/stories");
      const data = await res.json();
      const mapped: Story[] = (data.stories || []).map((s: any) => ({ id: s.id, name: s.name || "Story", avatar: s.avatar_url || undefined, image_url: s.image_url || undefined, video_url: s.video_url || undefined }));
      setStories(mapped);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const pick = () => fileRef.current?.click();
  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadAsset(f);
    const body: any = f.type.startsWith("video") ? { video_url: url } : { image_url: url };
    await fetch("/api/stories", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(body) });
    await load();
  };

  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto">
      <button onClick={pick} className="relative flex w-28 shrink-0 flex-col overflow-hidden rounded-xl border bg-card text-left">
        <div className="h-32 w-full bg-muted/60" />
        <div className="p-2 text-sm">Create story</div>
        <div className="absolute bottom-2 left-2 grid place-items-center size-7 rounded-full bg-primary text-primary-foreground border-2 border-white shadow">
          <Plus className="size-4" />
        </div>
        <input ref={fileRef} type="file" accept="image/*,video/*" onChange={onPick} className="hidden" />
      </button>
      {stories.map((s) => (
        <div key={s.id} className="relative w-28 shrink-0 overflow-hidden rounded-xl border">
          {s.image_url ? (
            <img src={s.image_url} alt={s.name} className="h-40 w-28 object-cover" />
          ) : (
            <video src={s.video_url} className="h-40 w-28 object-cover" autoPlay muted loop playsInline />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/0" />
          <div className="absolute bottom-0 p-2 text-xs font-medium text-white drop-shadow">{s.name}</div>
        </div>
      ))}
    </div>
  );
}
