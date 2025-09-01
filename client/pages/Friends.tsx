import Layout from "@/components/neo10/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

interface UserMini { id: string; name: string; avatar_url?: string; }

export default function Friends() {
  const [requests, setRequests] = useState<UserMini[]>([]);
  const [suggestions, setSuggestions] = useState<UserMini[]>([]);
  const [friends, setFriends] = useState<UserMini[]>([]);

  const load = async () => {
    try {
      const h = { Authorization: `Bearer ${getToken()}` } as any;
      const [rq, sg, fr] = await Promise.all([
        fetch("/api/friends/requests", { headers: h }).catch(()=>null),
        fetch("/api/friends/suggestions", { headers: h }).catch(()=>null),
        fetch("/api/friends/list", { headers: h }).catch(()=>null),
      ]);
      if (rq && rq.ok) setRequests((await rq.json()).requests || []);
      if (sg && sg.ok) setSuggestions((await sg.json()).users || []);
      if (fr && fr.ok) setFriends((await fr.json()).friends || []);
    } catch {}
  };
  useEffect(()=>{ load(); }, []);

  const accept = async (id: string) => { await fetch(`/api/users/${id}/accept`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } }); load(); };
  const remove = async (id: string) => { await fetch(`/api/friends/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } }); load(); };
  const request = async (id: string) => { await fetch(`/api/users/${id}/follow`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } }); load(); };

  const Row = ({u, actions}:{u:UserMini; actions:React.ReactNode}) => (
    <div className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/60">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10"><AvatarImage src={u.avatar_url || "https://i.pravatar.cc/100?img=12"} alt={u.name} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
        <div className="font-medium">{u.name}</div>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="rounded-xl border bg-card p-3">
          <h2 className="font-semibold mb-2">Friend requests</h2>
          <div className="divide-y">
            {requests.map(u => <Row key={u.id} u={u} actions={<><Button size="sm" onClick={()=>accept(u.id)}>Confirm</Button><Button size="sm" variant="outline" onClick={()=>remove(u.id)}>Remove</Button></>} />)}
            {!requests.length && <div className="text-sm text-muted-foreground">No requests</div>}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-3">
          <h2 className="font-semibold mb-2">Suggestions</h2>
          <div className="divide-y">
            {suggestions.map(u => <Row key={u.id} u={u} actions={<Button size="sm" onClick={()=>request(u.id)}>Add friend</Button>} />)}
            {!suggestions.length && <div className="text-sm text-muted-foreground">No suggestions</div>}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-3">
          <h2 className="font-semibold mb-2">Friends</h2>
          <div className="divide-y">
            {friends.map(u => <Row key={u.id} u={u} actions={<Button size="sm" variant="outline" onClick={()=>remove(u.id)}>Unfriend</Button>} />)}
            {!friends.length && <div className="text-sm text-muted-foreground">No friends yet</div>}
          </div>
        </section>
      </div>
    </Layout>
  );
}
