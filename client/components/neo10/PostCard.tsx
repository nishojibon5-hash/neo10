import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Post {
  id: string;
  author: { name: string; avatar: string };
  content: string;
  image?: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-xl border bg-card overflow-hidden">
      <header className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="font-semibold">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">{post.createdAt}</p>
          </div>
        </div>
        <button className="rounded-full p-2 hover:bg-muted/60">
          <MoreHorizontal className="size-5 text-muted-foreground" />
        </button>
      </header>
      <div className="px-3 pb-3 text-sm whitespace-pre-wrap">{post.content}</div>
      {post.image && (
        <img src={post.image} alt="" className="max-h-[520px] w-full object-cover" />
      )}
      <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
        <span>{post.likes} likes</span>
        <span>{post.comments} comments</span>
        <span>{post.shares} shares</span>
      </div>
      <div className="grid grid-cols-3 divide-x border-t text-sm">
        <button className="flex items-center justify-center gap-2 py-2.5 hover:bg-muted/60">
          <Heart className="size-5" /> Like
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 hover:bg-muted/60">
          <MessageCircle className="size-5" /> Comment
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 hover:bg-muted/60">
          <Share2 className="size-5" /> Share
        </button>
      </div>
    </article>
  );
}
