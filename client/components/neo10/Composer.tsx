import { Image, Video, Smile, Type } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export default function Composer() {
  const [mode, setMode] = useState<"text" | "html">("text");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [type, setType] = useState<"post" | "video" | "reel">("post");
  const [monetized, setMonetized] = useState(false);

  const submit = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ content, content_mode: mode, image_url: image || undefined, video_url: video || undefined, type, monetized }),
      });
      if (res.ok) {
        setContent(""); setImage(""); setVideo(""); setMode("text"); setType("post"); setMonetized(false);
      }
    } catch {}
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-3 flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://i.pravatar.cc/100?img=68" alt="You" />
          <AvatarFallback>YOU</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <button onClick={() => setMode("text")} className={`px-2 py-1 rounded-full ${mode==='text' ? 'bg-primary text-primary-foreground' : 'bg-muted/60'}`}><Type className="inline size-3 mr-1"/>Text</button>
            <button onClick={() => setMode("html")} className={`px-2 py-1 rounded-full ${mode==='html' ? 'bg-primary text-primary-foreground' : 'bg-muted/60'}`}>HTML</button>
            <div className="flex-1" />
            <label className="inline-flex items-center gap-2 text-xs select-none cursor-pointer">
              <input type="checkbox" checked={monetized} onChange={(e)=>setMonetized(e.target.checked)} /> Monetize
            </label>
          </div>
          {mode === 'html' ? (
            <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Write/paste HTML..." className="min-h-24 w-full rounded-md border bg-background p-2 text-sm" />
          ) : (
            <input value={content} onChange={(e)=>setContent(e.target.value)} placeholder="What's on your mind?" className="h-10 w-full rounded-full bg-muted/60 px-4 outline-none focus:ring-2 focus:ring-primary/40" />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={image} onChange={(e)=>setImage(e.target.value)} placeholder="Image URL (optional)" className="h-9 w-full rounded-md bg-muted/60 px-3" />
            <input value={video} onChange={(e)=>setVideo(e.target.value)} placeholder="Video/Reel URL (optional)" className="h-9 w-full rounded-md bg-muted/60 px-3" />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label className={`px-2 py-1 rounded-full cursor-pointer ${type==='post'?'bg-primary text-primary-foreground':'bg-muted/60'}`} onClick={()=>setType('post')}>Post</label>
            <label className={`px-2 py-1 rounded-full cursor-pointer ${type==='video'?'bg-primary text-primary-foreground':'bg-muted/60'}`} onClick={()=>setType('video')}><Video className="inline size-3 mr-1"/>Video</label>
            <label className={`px-2 py-1 rounded-full cursor-pointer ${type==='reel'?'bg-primary text-primary-foreground':'bg-muted/60'}`} onClick={()=>setType('reel')}>Reel</label>
            <div className="flex-1" />
            <button onClick={submit} className="h-9 px-4 rounded-md bg-primary text-primary-foreground">Share</button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x border-t text-sm">
        <button className="flex items-center justify-center gap-2 py-2.5 hover:bg-muted/60">
          <Video className="size-5 text-red-500" /> Live video
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 hover:bg-muted/60">
          <Image className="size-5 text-green-500" /> Photo
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 hover:bg-muted/60">
          <Smile className="size-5 text-purple-500" /> Feeling
        </button>
      </div>
    </div>
  );
}
