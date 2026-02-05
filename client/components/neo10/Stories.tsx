import { Plus } from "lucide-react";
import { useEffect, useRef, useState, memo, useCallback } from "react";
import { uploadAsset } from "@/lib/upload";
import { getToken } from "@/lib/auth";

interface Story {
  id: string;
  name: string;
  avatar?: string;
  image_url?: string;
  video_url?: string;
}

const StoryItem = memo(({ story }: { story: Story }) => (
  <div className="relative w-28 shrink-0 overflow-hidden rounded-xl border">
    {story.image_url ? (
      <img
        src={story.image_url}
        alt={story.name}
        className="h-40 w-28 object-cover"
        loading="lazy"
      />
    ) : (
      <video
        src={story.video_url}
        className="h-40 w-28 object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/0" />
    <div className="absolute bottom-0 p-2 text-xs font-medium text-white drop-shadow">
      {story.name}
    </div>
  </div>
));

StoryItem.displayName = "StoryItem";

export default memo(function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/stories").catch(() => null);
      if (!res || !res.ok) return;
      const data = await res.json();
      const mapped: Story[] = (data.stories || []).map((s: any) => ({
        id: s.id,
        name: s.name || "Story",
        avatar: s.avatar_url || undefined,
        image_url: s.image_url || undefined,
        video_url: s.video_url || undefined,
      }));
      setStories(mapped);
    } catch (err) {
      console.warn("Stories load error:", err);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000); // Refresh every 30s
    return () => clearInterval(timer);
  }, [load]);

  const pick = useCallback(() => fileRef.current?.click(), []);

  const onPick = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;

      setLoading(true);
      try {
        const url = await uploadAsset(f);
        const body: any = f.type.startsWith("video")
          ? { video_url: url }
          : { image_url: url };
        const res = await fetch("/api/stories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || "Share failed");
        }
        await load();
      } catch (err: any) {
        alert(err?.message || "Upload failed");
      } finally {
        setLoading(false);
        e.target.value = "";
      }
    },
    [load]
  );

  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto">
      <button
        onClick={pick}
        disabled={loading}
        className="relative flex w-28 shrink-0 flex-col overflow-hidden rounded-xl border bg-card text-left hover:bg-muted/60 disabled:opacity-50"
      >
        <div className="h-32 w-full bg-muted/60" />
        <div className="p-2 text-sm">{loading ? "Uploading..." : "Create story"}</div>
        <div className="absolute bottom-2 left-2 grid place-items-center size-7 rounded-full bg-primary text-primary-foreground border-2 border-white shadow">
          <Plus className="size-4" />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={onPick}
          className="hidden"
          disabled={loading}
        />
      </button>
      {stories.map((s) => (
        <StoryItem key={s.id} story={s} />
      ))}
    </div>
  );
});
