import Layout from "@/components/neo10/Layout";
import Stories from "@/components/neo10/Stories";
import Composer from "@/components/neo10/Composer";
import PostCard, { type Post } from "@/components/neo10/PostCard";
import { useEffect, useState, useCallback, memo, Suspense, lazy } from "react";

const LoadingPost = memo(() => (
  <div className="rounded-xl border bg-card p-4 animate-pulse">
    <div className="h-10 bg-muted rounded-full w-20 mb-3" />
    <div className="h-4 bg-muted rounded w-full mb-2" />
    <div className="h-4 bg-muted rounded w-3/4" />
  </div>
));

const defaultFeed: Post[] = [
  {
    id: "1",
    author: {
      name: "Ayesha Khan",
      avatar: "https://i.pravatar.cc/100?img=15",
    },
    content: "আজকে ঢাকার আকাশটা দারুণ সুন্দর! ☁️",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
    createdAt: "1h",
    likes: 120,
    comments: 24,
    shares: 12,
  },
  {
    id: "2",
    author: { name: "Rahim Uddin", avatar: "https://i.pravatar.cc/100?img=24" },
    content: "Weekend trip with friends!",
    image:
      "https://images.unsplash.com/photo-1520975922284-ec47b4b66804?q=80&w=1400&auto=format&fit=crop",
    createdAt: "3h",
    likes: 89,
    comments: 17,
    shares: 9,
  },
  {
    id: "3",
    author: { name: "JOY BANGLA", avatar: "https://i.pravatar.cc/100?img=12" },
    content:
      "Welcome to JOY BANGLA — a fast, modern, Facebook Lite inspired experience.",
    createdAt: "5h",
    likes: 56,
    comments: 6,
    shares: 2,
  },
];

function IndexContent() {
  const [feed, setFeed] = useState<Post[]>(defaultFeed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/feed").catch(() => null);
      if (!res || !res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      const mapped: Post[] = (data.posts || []).map((p: any) => ({
        id: p.id,
        author: {
          id: p.user_id,
          name: p.user_name,
          avatar: p.user_avatar || "https://i.pravatar.cc/100?img=12",
        },
        content: p.content || "",
        mode: p.content_mode === "html" ? "html" : "text",
        image: p.image_url || undefined,
        video: p.video_url || undefined,
        createdAt: new Date(p.created_at).toLocaleString(),
        likes: Number(p.likes || 0),
        comments: Number(p.comments || 0),
        shares: 0,
        monetized: Boolean(p.monetized),
      }));
      if (mapped.length) setFeed(mapped);
      setLoading(false);
    } catch (err) {
      console.warn("Feed loading error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("feed:refresh", handler);
    return () => window.removeEventListener("feed:refresh", handler);
  }, [load]);

  return (
    <Layout>
      <div className="space-y-4">
        <Stories />
        <Composer />
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingPost key={i} />
            ))}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {feed.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default memo(IndexContent);
