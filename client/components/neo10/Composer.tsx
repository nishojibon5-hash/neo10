import { Image, Video, Smile, Type } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMemo, useState } from "react";

function StepHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b px-3 py-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <button onClick={onClose} className="rounded-full px-2 py-1 text-xs hover:bg-muted/60">Close</button>
    </div>
  );
}

export default function Composer() {
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<"text" | "html">("text");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [type, setType] = useState<"post" | "video" | "reel">("post");
  const [monetized, setMonetized] = useState(false);

  const canProceed = useMemo(() => {
    return (content && content.trim().length > 0) || !!image || !!video;
  }, [content, image, video]);

  const reset = () => {
    setExpanded(false);
    setStep(1);
    setMode("text");
    setContent("");
    setImage("");
    setVideo("");
    setType("post");
    setMonetized(false);
  };

  const submit = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ content, content_mode: mode, image_url: image || undefined, video_url: video || undefined, type, monetized }),
      });
      if (res.status === 401) {
        alert("Please login to post.");
        window.location.href = "/login";
        return;
      }
      if (res.ok) {
        reset();
        window.dispatchEvent(new Event("feed:refresh"));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ? JSON.stringify(data.error) : "Failed to post");
      }
    } catch {
      alert("Network error");
    }
  };

  if (!expanded) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="p-3 flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://i.pravatar.cc/100?img=68" alt="You" />
            <AvatarFallback>YOU</AvatarFallback>
          </Avatar>
          <button
            onClick={() => { setExpanded(true); setStep(1); }}
            className="flex-1 h-11 rounded-full bg-muted/60 px-4 text-left text-sm text-muted-foreground hover:bg-muted"
          >
            What's on your mind?
          </button>
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

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <StepHeader title={step === 1 ? "Create post" : "Post options"} onClose={reset} />

      {step === 1 ? (
        <div className="p-3 flex items-start gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://i.pravatar.cc/100?img=68" alt="You" />
            <AvatarFallback>YOU</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <button onClick={() => setMode("text")} className={`px-2 py-1 rounded-full ${mode === 'text' ? 'bg-primary text-primary-foreground' : 'bg-muted/60'}`}>
                <Type className="inline size-3 mr-1" />Text
              </button>
              <button onClick={() => setMode("html")} className={`px-2 py-1 rounded-full ${mode === 'html' ? 'bg-primary text-primary-foreground' : 'bg-muted/60'}`}>
                HTML
              </button>
              <div className="flex-1" />
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-xs">Type:</span>
                <button onClick={() => setType('post')} className={`px-2 py-1 rounded-full text-xs ${type==='post'?'bg-muted':'bg-muted/40'}`}>Post</button>
                <button onClick={() => setType('video')} className={`px-2 py-1 rounded-full text-xs ${type==='video'?'bg-muted':'bg-muted/40'}`}>Video</button>
                <button onClick={() => setType('reel')} className={`px-2 py-1 rounded-full text-xs ${type==='reel'?'bg-muted':'bg-muted/40'}`}>Reel</button>
              </div>
            </div>

            {mode === 'html' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write/paste HTML..."
                className="min-h-36 w-full rounded-md border bg-background p-2 text-sm"
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-36 w-full resize-y rounded-md border bg-background p-2 text-sm"
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL (optional)" className="h-9 w-full rounded-md bg-muted/60 px-3" />
              <input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="Video/Reel URL (optional)" className="h-9 w-full rounded-md bg-muted/60 px-3" />
            </div>

            {(image || video) && (
              <div className="space-y-2">
                {image ? <img src={image} alt="preview" className="max-h-64 w-full rounded-md object-cover" /> : null}
                {video ? <video src={video} controls className="max-h-64 w-full rounded-md" /> : null}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
              <Button size="sm" onClick={() => setStep(2)} disabled={!canProceed}>Next</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          <div className="rounded-md border bg-background p-3 text-sm">
            {mode === 'html' ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <div className="whitespace-pre-wrap">{content}</div>
            )}
            {image ? <img src={image} alt="preview" className="mt-2 max-h-64 w-full rounded-md object-cover" /> : null}
            {video ? <video src={video} controls className="mt-2 max-h-64 w-full rounded-md" /> : null}
          </div>

          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Monetize</div>
                <div className="text-xs text-muted-foreground">Turn on ads for this post</div>
              </div>
              <Switch checked={monetized} onCheckedChange={setMonetized} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Back</Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={reset}>Discard</Button>
              <Button size="sm" onClick={submit}>Share</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
