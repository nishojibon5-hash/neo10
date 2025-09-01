import Layout from "@/components/neo10/Layout";
import PostCard, { type Post } from "@/components/neo10/PostCard";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth";

function FollowButton({ userId }: { userId: string }) {
  const [state, setState] = useState<'idle' | 'pending' | 'following'>('idle');
  const follow = async () => {
    if (state !== 'idle') return;
    try {
      const token = getToken();
      const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (res.ok) setState('pending');
    } catch {}
  };
  return (
    <Button onClick={follow} disabled={state !== 'idle'}>{state === 'pending' ? 'Requested' : 'Follow'}</Button>
  );
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const ur = await fetch(`/api/users/${id}`);
        if (ur.ok) { const uj = await ur.json(); setUser(uj.user); }
        const pr = await fetch(`/api/users/${id}/posts`);
        if (pr.ok) {
          const p = await pr.json();
          const mapped: Post[] = (p.posts || []).map((x: any) => ({
            id: x.id,
            author: { id: x.user_id, name: x.user_name, avatar: x.user_avatar },
            content: x.content || "",
            mode: x.content_mode === 'html' ? 'html' : 'text',
            image: x.image_url || undefined,
            video: x.video_url || undefined,
            createdAt: new Date(x.created_at).toLocaleString(),
            likes: 0, comments: 0, shares: 0,
          }));
          setPosts(mapped);
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, [id]);

  return (
    <Layout>
      {!user && loaded ? (
        <div className="rounded-xl border bg-card p-8">User not found</div>
      ) : !user ? (
        <div className="rounded-xl border bg-card p-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border overflow-hidden">
            <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${user.cover_url || ''})` }} />
            <div className="p-4 flex items-center gap-4">
              <img src={user.avatar_url || 'https://i.pravatar.cc/100'} className="h-20 w-20 rounded-full border-4 border-card -mt-12 bg-muted object-cover" />
              <div className="flex-1">
                <h1 className="text-xl font-bold">{user.name} {user.username && <span className="text-muted-foreground text-sm">@{user.username}</span>}</h1>
                <p className="text-sm text-muted-foreground">{user.bio || '—'}</p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="secondary"><Link to={`/messages?user=${id}`}>Message</Link></Button>
                <FollowButton userId={String(id)} />
              </div>
            </div>
          </div>
          <section className="space-y-4">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </section>
        </div>
      )}
    </Layout>
  );
}
