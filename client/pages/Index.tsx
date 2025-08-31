import Layout from "@/components/neo10/Layout";
import Stories from "@/components/neo10/Stories";
import Composer from "@/components/neo10/Composer";
import PostCard, { type Post } from "@/components/neo10/PostCard";

const feed: Post[] = [
  {
    id: "1",
    author: { name: "Ayesha Khan", avatar: "https://i.pravatar.cc/100?img=15" },
    content: "আজকে ঢাকার আকাশটা দারুণ সুন্দর! ☁️",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
    createdAt: "1h",
    likes: 120,
    comments: 24,
    shares: 12,
  },
  {
    id: "2",
    author: { name: "Rahim Uddin", avatar: "https://i.pravatar.cc/100?img=24" },
    content: "Weekend trip with friends!",
    image: "https://images.unsplash.com/photo-1520975922284-ec47b4b66804?q=80&w=1400&auto=format&fit=crop",
    createdAt: "3h",
    likes: 89,
    comments: 17,
    shares: 9,
  },
  {
    id: "3",
    author: { name: "NEO10", avatar: "https://i.pravatar.cc/100?img=12" },
    content: "Welcome to NEO10 — a fast, modern, Facebook Lite inspired experience.",
    createdAt: "5h",
    likes: 56,
    comments: 6,
    shares: 2,
  },
];

export default function Index() {
  return (
    <Layout>
      <div className="space-y-4">
        <Stories />
        <Composer />
        {feed.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </Layout>
  );
}
