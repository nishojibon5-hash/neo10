import { useState } from "react";

const EMOJIS = ["😆","🥲","🫦","🥴","😡","♥️","🤔","😮"] as const;
export type ReactionType = typeof EMOJIS[number];

export function ReactionPicker({ onPick }: { onPick: (r: ReactionType) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-card border px-2 py-1 shadow-sm">
      {EMOJIS.map((e) => (
        <button key={e} className="text-xl leading-none hover:scale-110 transition" onClick={() => onPick(e)} aria-label={`React ${e}`}>
          {e}
        </button>
      ))}
    </div>
  );
}

export function ReactionButton({ postId, initialCount = 0 }: { postId: string; initialCount?: number }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCount);

  const send = async (emoji: ReactionType) => {
    setOpen(false);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ type: emoji }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (res.ok) setCount((c) => (c || 0) + 1);
    } catch {}
  };

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center justify-center gap-2 py-2.5 hover:bg-muted/60 w-full" onClick={() => setOpen((p) => !p)}>
        Like
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20">
          <ReactionPicker onPick={send} />
        </div>
      )}
    </div>
  );
}
