import { MessageCircle, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReactionButton } from "./Reactions";
import AdInline from "./AdInline";
import { Link } from "react-router-dom";
import Comments from "./Comments";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getToken, getUser } from "@/lib/auth";

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

function sanitizeHtml(html: string) {
  const fix = (url?: string) => {
    const raw = String(url || "");
    if (!raw) return raw;
    const normalized = raw.startsWith("//") ? `https:${raw}` : raw;
    if (/^https:\/\//i.test(normalized)) return normalized;
    if (/^http:\/\//i.test(normalized)) return `/api/proxy?url=${encodeURIComponent(normalized)}`;
    return normalized;
  };
  // Replace src/poster URLs and proxy insecure ones
  return html.replace(/(\s(?:src|poster)\s*=\s*")([^"]*)(")/gi, (_m, p1, url, p3) => `${p1}${fix(url)}${p3}`);
}

export default function PostCard({ post }: { post: Post }) {
  const share = async () => {
    const url = window.location.href.split('#')[0];
    const link = `${url}#post-${post.id}`;
    try { if ((navigator as any).share) { await (navigator as any).share({ title: 'Post', url: link }); } else { await navigator.clipboard.writeText(link); alert('Link copied'); } } catch {}
  };
  const [openComments, setOpenComments] = useState(false);
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
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full p-2 hover:bg-muted/60">
                <MoreHorizontal className="size-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {post.author.id && getUser()?.id === post.author.id ? (
                <DropdownMenuItem className="text-red-600" onClick={async () => {
                  if (!confirm("Delete this post?")) return;
                  try {
                    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
                    if (res.ok) {
                      (document.getElementById(`post-${post.id}`) as HTMLElement)?.remove();
                      window.dispatchEvent(new Event('feed:refresh'));
                    }
                  } catch {}
                }}>
                  <Trash2 className="size-4 mr-2" /> Delete
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {post.mode === "html" ? (
        <div className="px-3 pb-3 text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
      ) : (
        <div className="px-3 pb-3 text-sm whitespace-pre-wrap">{post.content}</div>
      )}
      {post.image && (
        <img src={post.image} alt="" className="max-w-full h-auto" />
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
