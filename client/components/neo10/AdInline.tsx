import { Button } from "@/components/ui/button";

export default function AdInline() {
  return (
    <div className="mx-3 mb-3 rounded-lg border bg-muted/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground border-b bg-card/60">
        <span className="font-medium">Sponsored</span>
        <span>Ad</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-0">
        <div className="p-3 text-sm">
          <h4 className="font-semibold mb-1">Boost your reach with NEO Ads</h4>
          <p className="text-muted-foreground">Promote your content to the right audience and monetize effectively. Create campaigns in minutes.</p>
          <div className="mt-2">
            <Button size="sm">Create Campaign</Button>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=800&auto=format&fit=crop"
          alt="NEO Ads"
          className="h-36 w-full object-cover"
        />
      </div>
    </div>
  );
}
