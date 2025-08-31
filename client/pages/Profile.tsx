import Layout from "@/components/neo10/Layout";
import PostCard, { type Post } from "@/components/neo10/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const posts: Post[] = [
  {
    id: "p1",
    author: { name: "Md Salman", avatar: "https://i.pravatar.cc/100?img=68" },
    content: "Feeling excited to build NEO10!",
    image: "https://images.unsplash.com/photo-1529336953121-ad5a0d43d0da?q=80&w=1400&auto=format&fit=crop",
    createdAt: "2h",
    likes: 34,
    comments: 12,
    shares: 3,
  },
];

export default function Profile() {
  return (
    <Layout>
      <div className="rounded-xl border overflow-hidden">
        <div className="h-56 w-full bg-[url('https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="p-4 flex items-center gap-4">
          <Avatar className="h-24 w-24 -mt-16 border-4 border-card rounded-full">
            <AvatarImage src="https://i.pravatar.cc/100?img=68" alt="Md Salman" />
            <AvatarFallback>MS</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold leading-tight">Md Salman</h1>
            <p className="text-sm text-muted-foreground">Admin • Dhaka, Bangladesh</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Add to story</Button>
            <Button> Edit profile</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-4 mt-4">
        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold mb-2">Intro</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Works at NEO10</li>
              <li>Studied Computer Science</li>
              <li>Lives in Dhaka</li>
            </ul>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold mb-2">Friends</h3>
            <p className="text-sm text-muted-foreground">Friends list coming soon.</p>
          </div>
        </aside>
        <section className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </section>
      </div>
    </Layout>
  );
}
