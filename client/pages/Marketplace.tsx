import Layout from "@/components/neo10/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

function ListingCard({ item }: { item: any }) {
  return (
    <Link to={`/marketplace/item/${item.id}`} className="block">
      <Card className="hover:shadow-md transition">
        <CardContent className="p-0">
          <img src={item.image_url || "/placeholder.svg"} alt={item.title} className="w-full h-44 object-cover rounded-t-md" />
          <div className="p-3">
            <div className="font-semibold line-clamp-1">{item.title}</div>
            {item.price != null && <div className="text-primary font-bold">৳ {Number(item.price).toLocaleString()}</div>}
            {item.location && <div className="text-xs text-muted-foreground">{item.location}</div>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Marketplace() {
  const [params, setParams] = useSearchParams();
  const qc = useQueryClient();
  const q = params.get("q") || "";
  const category = params.get("category") || "";

  const { data: cats } = useQuery({
    queryKey: ["market-categories"],
    queryFn: async () => {
      const res = await fetch("/api/market/categories");
      return (await res.json()).categories as string[];
    },
  });

  const { data } = useQuery({
    queryKey: ["market-listings", q, category],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (q) sp.set("q", q);
      if (category) sp.set("category", category);
      const res = await fetch(`/api/market/listings${sp.toString() ? `?${sp.toString()}` : ""}`);
      return await res.json();
    },
  });

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={async () => { const r = await fetch('/api/market/seed-demo', { method: 'POST' }); if (r.ok) { toast.success('Demo listings added'); qc.invalidateQueries({ queryKey: ['market-listings'] }); } else { toast.error('Failed to seed'); } }}>Load demo</Button>
            <Link to="/marketplace/create"><Button>Sell</Button></Link>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Search items"
            value={q}
            onChange={(e) => { const v = e.target.value; const p = new URLSearchParams(params); if (v) p.set("q", v); else p.delete("q"); setParams(p, { replace: true }); }}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {(cats || []).map((c) => (
            <button
              key={c}
              onClick={() => { const p = new URLSearchParams(params); if (category === c) p.delete("category"); else p.set("category", c); setParams(p, { replace: true }); }}
              className={`px-3 py-1 rounded-full border ${category === c ? "bg-primary text-primary-foreground" : "bg-card"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(data?.listings || []).map((item: any) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
