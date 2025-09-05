import Layout from "@/components/neo10/Layout";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function MarketplaceItem() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["market-item", id],
    queryFn: async () => {
      const res = await fetch(`/api/market/listings/${id}`);
      return await res.json();
    },
  });
  const item = data?.listing;
  return (
    <Layout>
      <div className="mx-auto max-w-4xl grid md:grid-cols-2 gap-6">
        {isLoading ? (
          <div>Loading…</div>
        ) : item ? (
          <>
            <img src={item.image_url || "/placeholder.svg"} alt={item.title} className="w-full h-auto rounded" />
            <div>
              <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
              {item.price != null && <div className="text-xl text-primary font-semibold mb-2">৳ {Number(item.price).toLocaleString()}</div>}
              {item.location && <div className="text-sm text-muted-foreground mb-2">{item.location}</div>}
              <p className="whitespace-pre-wrap leading-relaxed mb-4">{item.description}</p>
              {item.contact_phone && (
                <a href={`tel:${item.contact_phone}`} className="inline-block px-4 py-2 rounded bg-primary text-primary-foreground">Call Seller</a>
              )}
            </div>
          </>
        ) : (
          <div>Not found</div>
        )}
      </div>
    </Layout>
  );
}
