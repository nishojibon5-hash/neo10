import Layout from "@/components/neo10/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getToken, getUser } from "@/lib/auth";
import { uploadAsset } from "@/lib/upload";

interface Conversation { id: string; peer_id: string; peer_name: string; peer_avatar?: string; }
interface Message { id: string; sender_id: string; content?: string; content_type?: string; attachment_url?: string; attachment_type?: string; created_at: string; }

export default function Messages() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConvs = async () => {
    const res = await fetch("/api/messages/conversations", { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) { const d = await res.json(); setConvs(d.conversations || []); if (!active && d.conversations?.[0]) setActive(d.conversations[0]); }
  };
  const loadMsgs = async (id: string) => {
    const res = await fetch(`/api/messages/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) { const d = await res.json(); setMsgs(d.messages || []); setTimeout(()=>bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); }
  };

  useEffect(() => { loadConvs(); }, []);
  useEffect(() => { if (active) loadMsgs(active.id); }, [active?.id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const uid = params.get('user') || params.get('userId');
    (async () => {
      if (!uid) return;
      try {
        const r = await fetch(`/api/messages/ensure/${uid}`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } });
        if (r.ok) {
          await loadConvs();
          const d = await r.json().catch(()=>({}));
          const convId = d.id as string | undefined;
          if (convId) setActive((prev)=> prev && prev.id===convId ? prev : { id: convId, peer_id: uid, peer_name: '' });
        }
      } catch {}
    })();
  }, []);

  const send = async (payload: Partial<Message>) => {
    if (!active) return;
    const body: any = { content: payload.content ?? undefined, content_type: payload.content_type ?? undefined, attachment_url: payload.attachment_url ?? undefined, attachment_type: payload.attachment_type ?? undefined };
    const res = await fetch(`/api/messages/${active.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(body) });
    if (res.ok) { await loadMsgs(active.id); setText(""); }
  };

  const pickFile = async (accept: string, type: 'image'|'video'|'audio') => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = accept;
    input.onchange = async () => {
      const f = input.files?.[0]; if (!f) return; const url = await uploadAsset(f); await send({ attachment_url: url, attachment_type: type });
    };
    input.click();
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] gap-3">
        <aside className="rounded-xl border bg-card overflow-hidden">
          <div className="p-2 font-semibold">Chats</div>
          <div className="divide-y max-h-[70vh] overflow-auto">
            {convs.map(c => (
              <button key={c.id} onClick={() => setActive(c)} className={`w-full text-left px-3 py-2 hover:bg-muted/60 ${active?.id===c.id?'bg-muted':''}`}>
                <div className="font-medium">{c.peer_name}</div>
              </button>
            ))}
          </div>
        </aside>
        <section className="rounded-xl border bg-card flex flex-col h-[70vh]">
          {active ? (
            <>
              <div className="p-2 border-b font-semibold">{active.peer_name}</div>
              <div className="flex-1 overflow-auto p-3 space-y-2">
                {msgs.map(m => (
                  <div key={m.id} className={`max-w-[80%] rounded-lg p-2 ${m.sender_id===getUser()?.id? 'bg-primary text-primary-foreground ml-auto':'bg-muted'}`}>
                    {m.content ? <div className="whitespace-pre-wrap text-sm">{m.content}</div> : null}
                    {m.attachment_url ? (
                      m.attachment_type==='video' ? <video src={m.attachment_url} className="rounded mt-1 w-full h-auto" controls />
                      : m.attachment_type==='audio' ? <audio src={m.attachment_url} className="mt-1 w-full" controls />
                      : <img src={m.attachment_url} className="rounded mt-1 w-full h-auto" />
                    ) : null}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-2 border-t flex items-center gap-2">
                <Input value={text} onChange={e=>setText(e.target.value)} placeholder="Message" onKeyDown={(e)=>{ if(e.key==='Enter'&&text.trim()) send({ content: text }); }} />
                <Button onClick={()=>text.trim()&&send({ content: text })}>Send</Button>
                <Button variant="outline" onClick={()=>pickFile('image/*','image')}>Photo</Button>
                <Button variant="outline" onClick={()=>pickFile('video/*','video')}>Video</Button>
                <Button variant="outline" onClick={()=>pickFile('audio/*','audio')}>Audio</Button>
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-sm text-muted-foreground">Select a chat</div>
          )}
        </section>
      </div>
    </Layout>
  );
}
