import { useEffect, useState } from "react";
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

export default function Comments({ postId }: { postId: string }) {
  const [items, setItems] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  const load = async () => {
    const res = await fetch(`/api/posts/${postId}/comments`).catch(() => null);
    const data = res && res.ok ? await res.json() : { comments: [] };
    setItems(data.comments || []);
  };

  useEffect(() => { load(); }, [postId]);

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
      <div className="flex items-center gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." className="flex-1 h-9 rounded-full border bg-background px-3 text-sm" />
        <Button size="sm" onClick={submit}>Post</Button>
      </div>
    </div>
  );
}
