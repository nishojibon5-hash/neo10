import { MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReactionButton } from "./Reactions";
import AdInline from "./AdInline";
import { Link } from "react-router-dom";
import Comments from "./Comments";

export interface Post {
  id: string;
  author: { name: string; avatar: string; id?: string };
  content: string;
  mode?: "text" | "html";
  image?: string;
  video?: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  monetized?: boolean;
}

export default function PostCard({ post }: { post: Post }) {
  const share = async () => {
    const url = window.location.href.split('#')[0];
    const link = `${url}#post-${post.id}`;
    try { if ((navigator as any).share) { await (navigator as any).share({ title: 'Post', url: link }); } else { await navigator.clipboard.writeText(link); alert('Link copied'); } } catch {}
  };
  const [openComments, setOpenComments] = (window as any).useState ? (window as any).useState(false) : require('react').useState(false);
  return (
    <article id={`post-${post.id}`} className="rounded-xl border bg-card overflow-visible">
      <header className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Link to={post.author.id ? `/u/${post.author.id}` : "/profile"} className="rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="leading-tight">
            <Link to={post.author.id ? `/u/${post.author.id}` : "/profile"} className="font-semibold hover:underline">{post.author.name}</Link>
            <p className="text-xs text-muted-foreground">{post.createdAt}</p>
          </div>
        </div>
        <button className="rounded-full p-2 hover:bg-muted/60">
          <MoreHorizontal className="size-5 text-muted-foreground" />
        </button>
      </header>
      {post.mode === "html" ? (
        <div className="px-3 pb-3 text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      ) : (
        <div className="px-3 pb-3 text-sm whitespace-pre-wrap">{post.content}</div>
      )}
      {post.image && (
        <img src={post.image} alt="" className="w-full h-auto object-contain" />
      )}
      {post.video && (
        <video src={post.video} controls className="w-full h-auto" />
      )}
      {post.monetized ? <AdInline /> : null}
      <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
        <span>{post.likes} reactions</span>
        <span>{post.comments} comments</span>
        <span>{post.shares} shares</span>
      </div>
      <div className="grid grid-cols-3 divide-x border-t text-sm">
        <ReactionButton postId={post.id} initialCount={post.likes} />
        <button className="flex items-center justify-center gap-2 py-2.5 hover:bg-muted/60" onClick={() => setOpenComments((v: boolean) => !v)}>
          <MessageCircle className="size-5" /> Comment
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 hover:bg-muted/60" onClick={share}>
          <Share2 className="size-5" /> Share
        </button>
      </div>
      {openComments ? <Comments postId={post.id} /> : null}
    </article>
  );
}
