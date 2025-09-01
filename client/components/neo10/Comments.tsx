import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
}

interface UserLite { id: string; name: string; avatar_url?: string }

export default function Comments({ postId }: { postId: string }) {
  const [items, setItems] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [friends, setFriends] = useState<UserLite[]>([]);
  const [showSug, setShowSug] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/posts/${postId}/comments`).catch(() => null);
    const data = res && res.ok ? await res.json() : { comments: [] };
    setItems(data.comments || []);
  };

  useEffect(() => { load(); }, [postId]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const r = await fetch(`/api/friends/suggestions`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
        const d = r.ok ? await r.json() : { users: [] };
        setFriends(d.users || []);
      } catch {}
    })();
  }, []);

  const mentionQuery = useMemo(() => {
    const m = text.match(/(^|\s)@([A-Za-z0-9_]{1,20})$/);
    return m ? m[2].toLowerCase() : "";
  }, [text]);
  const filtered = useMemo(() => {
    if (!mentionQuery) return [] as UserLite[];
    return friends.filter((u) => u.name.toLowerCase().includes(mentionQuery)).slice(0,5);
  }, [mentionQuery, friends]);

  const insertMention = (name: string) => {
    setText((t) => t.replace(/(@[A-Za-z0-9_]{0,20})$/, `@${name} `));
    setShowSug(false);
  };

  const submit = async () => {
    const content = text.trim(); if (!content) return;
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ content }),
      });
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (res.ok) { setText(""); load(); }
    } catch {}
  };

  return (
    <div className="border-t p-3 space-y-3">
      <div className="space-y-3">
        {items.map((c) => (
          <div key={c.id} className="flex items-start gap-2">
            <Avatar className="h-7 w-7"><AvatarImage src={c.user_avatar || "https://i.pravatar.cc/100"} /><AvatarFallback>{c.user_name?.[0] || "U"}</AvatarFallback></Avatar>
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <div className="font-medium">{c.user_name}</div>
              <div className="whitespace-pre-wrap">{c.content}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); setShowSug(true); }}
          placeholder="Write a comment..."
          className="flex-1 h-9 rounded-full border bg-background px-3 text-sm"
        />
        <Button size="sm" onClick={submit}>Post</Button>
        {showSug && filtered.length > 0 && (
          <div className="absolute bottom-10 left-3 z-20 rounded-md border bg-card shadow w-56">
            {filtered.map((u) => (
              <button key={u.id} onClick={() => insertMention(u.name)} className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted/60 text-sm">
                <Avatar className="h-6 w-6"><AvatarImage src={u.avatar_url || ""} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
                <span>{u.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
