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

export function ReactionButton({ postId, initialCount = 0, initialReaction }: { postId: string; initialCount?: number; initialReaction?: ReactionType }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [selected, setSelected] = useState<ReactionType | null>(initialReaction || null);
  let pressTimer: any = null;

  const send = async (emoji: ReactionType) => {
    setOpen(false);
    setSelected(emoji);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ type: emoji }),
      });
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.created) setCount((c) => (c || 0) + 1);
      }
    } catch {}
  };

  const onPressStart = () => {
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => setOpen(true), 300);
  };
  const onPressEnd = () => {
    if (open) return; // picker opened via long-press
    clearTimeout(pressTimer);
    // quick tap -> default like
    send("♥️");
  };

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        className="flex items-center justify-center gap-2 py-2.5 hover:bg-muted/60 w-full"
        onMouseDown={onPressStart}
        onMouseUp={onPressEnd}
        onTouchStart={onPressStart}
        onTouchEnd={onPressEnd}
      >
        Like {count ? `(${count})` : ""}
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20">
          <ReactionPicker onPick={send} />
        </div>
      )}
    </div>
  );
}
