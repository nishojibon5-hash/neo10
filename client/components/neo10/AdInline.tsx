import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ActiveAd { id: string; title: string; media_url?: string; media_type?: string; destination_url?: string; }

export default function AdInline() {
  const [ad, setAd] = useState<ActiveAd | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/ads/active").catch(() => null as any);
        if (!res || !res.ok) { if (mounted) setAd(null); return; }
        const data = await res.json().catch(() => ({ ad: null }));
        if (mounted) {
          setAd(data.ad || null);
          if (data.ad?.id) {
            fetch(`/api/ads/${data.ad.id}/impression`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ placement: "post_inline" }),
            }).catch(() => {});
          }
        }
      } catch { if (mounted) setAd(null); }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (!ad) return null;

  return (
    <div className="mx-3 mb-3 rounded-lg border bg-muted/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground border-b bg-card/60">
        <span className="font-medium">Sponsored</span>
        <span>Ad</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-0">
        <div className="p-3 text-sm">
          <h4 className="font-semibold mb-1">{ad.title}</h4>
          <div className="mt-2">
            {ad.destination_url ? (
              <a href={ad.destination_url} target="_blank" rel="noreferrer">
                <Button size="sm">Learn more</Button>
              </a>
            ) : null}
          </div>
        </div>
        {ad.media_url ? (
          ad.media_type === 'video' ? (
            <video src={ad.media_url} className="h-36 w-full object-cover" autoPlay muted loop playsInline controls={false} />
          ) : (
            <img src={ad.media_url} alt={ad.title} className="h-36 w-full object-cover" />
          )
        ) : null}
      </div>
    </div>
  );
}
