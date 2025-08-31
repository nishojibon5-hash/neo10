import Layout from "@/components/neo10/Layout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

interface Ad { id: string; title: string; status: string; media_url?: string; media_type?: string; impressions?: number; created_at?: string; }

export default function AdsDashboard() {
  const [ads, setAds] = useState<Ad[]>([]);

  const load = async () => {
    const res = await fetch("/api/ads/mine", { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) { const data = await res.json(); setAds(data.ads || []); }
  };

  useEffect(() => { load(); }, []);

  const pause = async (id: string, status: string) => {
    const res = await fetch(`/api/ads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ status }) });
    if (res.ok) load();
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ads Dashboard</h1>
          <a href="/ads/create"><Button>Create new</Button></a>
        </div>
        <div className="grid gap-3">
          {ads.map((a) => (
            <div key={a.id} className="rounded-xl border bg-card p-3 flex gap-3 items-center">
              {a.media_url ? (
                a.media_type === 'video' ? <video src={a.media_url} className="h-16 rounded" /> : <img src={a.media_url} className="h-16 rounded" />
              ) : null}
              <div className="flex-1">
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">Status: {a.status} • Impressions: {a.impressions ?? 0}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => pause(a.id, a.status === 'active' ? 'paused' : 'active')}>{a.status === 'active' ? 'Pause' : 'Activate'}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
