import Layout from "@/components/neo10/Layout";
import PostCard, { type Post } from "@/components/neo10/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      if (!token) { navigate("/login"); return; }
      const meRes = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      if (!meRes.ok) { navigate("/login"); return; }
      const me = await meRes.json();
      setUser(me.user);
      const up = await fetch(`/api/users/${me.user.id}`);
      const ud = await up.json();
      setUser(ud.user);
      const pr = await fetch(`/api/users/${me.user.id}/posts`);
      if (pr.ok) {
        const data = await pr.json();
        const mapped: Post[] = (data.posts || []).map((p: any) => ({
          id: p.id,
          author: { id: p.user_id, name: ud.user.name, avatar: ud.user.avatar_url || "https://i.pravatar.cc/100?img=12" },
          content: p.content || "",
          mode: p.content_mode === 'html' ? 'html' : 'text',
          image: p.image_url || undefined,
          video: p.video_url || undefined,
          createdAt: new Date(p.created_at).toLocaleString(),
          likes: 0,
          comments: 0,
          shares: 0,
          monetized: Boolean(p.monetized),
        }));
        setPosts(mapped);
      }
    };
    load();
  }, [navigate]);

  if (!user) return (
    <Layout>
      <div className="mx-auto max-w-2xl p-6 text-center text-sm text-muted-foreground">Loading...</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="rounded-xl border overflow-hidden">
        <div className="h-56 w-full bg-cover bg-center" style={{ backgroundImage: `url(${user.cover_url || 'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1600&auto=format&fit=crop'})` }} />
        <div className="p-4 flex items-center gap-4">
          <Avatar className="h-24 w-24 -mt-16 border-4 border-card rounded-full">
            <AvatarImage src={user.avatar_url || "https://i.pravatar.cc/100?img=68"} alt={user.name} />
            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold leading-tight">{user.name}</h1>
            {user.username ? <p className="text-sm text-muted-foreground">@{user.username}</p> : null}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Add to story</Button>
            <Link to="/profile/edit"><Button>Edit profile</Button></Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-4 mt-4">
        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold mb-2">Intro</h3>
            {user.bio ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Add a short bio from Edit profile.</p>
            )}
          </div>
        </aside>
        <section className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </section>
      </div>
    </Layout>
  );
}
