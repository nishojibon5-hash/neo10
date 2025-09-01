import Layout from "@/components/neo10/Layout";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

interface N { id: string; type: string; data?: any; created_at: string; }

export default function Notifications() {
  const [items, setItems] = useState<N[]>([]);
  useEffect(() => { (async () => { const r = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${getToken()}` } }); if (r.ok) setItems((await r.json()).notifications || []); })(); }, []);
  return (
    <Layout>
      <div className="rounded-xl border bg-card p-3">
        <h1 className="text-xl font-bold mb-2">Notifications</h1>
        <ul className="divide-y">
          {items.map(n => (
            <li key={n.id} className="py-2 text-sm">
              {n.type === 'friend_request' && <span>New friend request</span>}
              {n.type === 'friend_accept' && <span>Your request was accepted</span>}
              {n.type === 'reaction' && <span>Your post got a reaction</span>}
              <span className="text-muted-foreground ml-2">{new Date(n.created_at).toLocaleString()}</span>
            </li>
          ))}
          {!items.length && <li className="py-2 text-sm text-muted-foreground">No notifications</li>}
        </ul>
      </div>
    </Layout>
  );
}
