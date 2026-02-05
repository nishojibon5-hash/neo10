import Layout from "@/components/neo10/Layout";
import { useState, useEffect, memo } from "react";
import { Play } from "lucide-react";
import { getToken } from "@/lib/auth";

interface VideoPost {
  id: string;
  title: string;
  thumbnail?: string;
  video_url?: string;
  author_name: string;
  views: number;
  created_at: string;
}

const VideoCard = memo(({ video }: { video: VideoPost }) => (
  <div className="rounded-lg overflow-hidden bg-card border hover:shadow-lg transition-shadow">
    <div className="relative aspect-video bg-black flex items-center justify-center group">
      {video.thumbnail ? (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black" />
      )}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-all">
        <Play className="w-12 h-12 text-white fill-white opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
    <div className="p-3">
      <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{video.author_name}</p>
      <p className="text-xs text-muted-foreground">{video.views} views</p>
    </div>
  </div>
));

VideoCard.displayName = "VideoCard";

function VideosContent() {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/feed", {
          headers: { Authorization: `Bearer ${getToken()}` },
        }).catch(() => null);
        if (!res || !res.ok) return;
        const data = await res.json();
        const filtered = (data.posts || [])
          .filter((p: any) => p.video_url || p.type === "video" || p.type === "reel")
          .map((p: any) => ({
            id: p.id,
            title: p.content?.substring(0, 50) || "Untitled Video",
            video_url: p.video_url,
            author_name: p.user_name,
            views: Math.floor(Math.random() * 10000),
            created_at: p.created_at,
          }));
        setVideos(filtered);
      } catch (err) {
        console.warn("Videos load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Videos</h1>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-card animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-muted-foreground">No videos yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default memo(VideosContent);
