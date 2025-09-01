import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadAsset } from "@/lib/upload";

export default function ChatHead() {
  const [open, setOpen] = useState(false);
  const [conv, setConv] = useState<any>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/messages/conversations", { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) return;
      const d = await res.json();
      if (d.conversations?.[0]) { setConv(d.conversations[0]); const m = await fetch(`/api/messages/${d.conversations[0].id}`, { headers: { Authorization: `Bearer ${getToken()}` } }); const md = await m.json(); setMsgs(md.messages || []); }
    } catch {}
  };
  useEffect(()=>{ load(); }, []);

  const send = async (body: any) => {
    if (!conv) return;
    await fetch(`/api/messages/${conv.id}`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${getToken()}` }, body: JSON.stringify(body) });
    const m = await fetch(`/api/messages/${conv.id}`, { headers: { Authorization: `Bearer ${getToken()}` } }); const md = await m.json(); setMsgs(md.messages || []); setText("");
  };

  if (!conv) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <div className="w-80 rounded-xl border bg-card shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="font-semibold truncate">{conv.peer_name || 'Chat'}</div>
            <button onClick={()=>setOpen(false)} className="text-sm">−</button>
          </div>
          <div className="max-h-60 overflow-auto p-2 space-y-2">
            {msgs.map((m)=> (
              <div key={m.id} className={`max-w-[80%] rounded-lg p-2 ${m.mine? 'bg-primary text-primary-foreground ml-auto':'bg-muted'}`}>
                {m.content ? <div className="text-sm whitespace-pre-wrap">{m.content}</div> : null}
                {m.attachment_url ? <a href={m.attachment_url} target="_blank" className="underline text-xs">Attachment</a> : null}
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex items-center gap-2">
            <Input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Message" onKeyDown={(e)=>{ if(e.key==='Enter'&&text.trim()) send({ content:text }); }} />
            <Button size="sm" onClick={()=>text.trim()&&send({ content:text })}>Send</Button>
          </div>
        </div>
      ) : null}
      <button onClick={()=>setOpen(!open)} className="grid place-items-center h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg">✉️</button>
    </div>
  );
}
