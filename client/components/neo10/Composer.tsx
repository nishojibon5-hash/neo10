import { Image, Video, Smile, Type, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMemo, useState, useCallback, memo } from "react";
import { uploadAsset } from "@/lib/upload";
import { getUser } from "@/lib/auth";

function StepHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b px-3 py-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <button onClick={onClose} className="rounded-full px-2 py-1 text-xs hover:bg-muted/60">Close</button>
    </div>
  );
}

function buildYouTubeEmbed(urlOrId: string) {
  const idMatch = urlOrId.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
  const id = idMatch ? idMatch[1] : urlOrId;
  const src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1`;
  return `<div class="rounded-lg overflow-hidden bg-black">
    <iframe src="${src}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen class="w-full aspect-video border-0"></iframe>
  </div>`;
}

function buildFacebookEmbed(url: string) {
  const enc = encodeURIComponent(url);
  const src = `https://www.facebook.com/plugins/video.php?href=${enc}&show_text=false&autoplay=true&mute=true`;
  return `<div class="rounded-lg overflow-hidden bg-black">
    <iframe src="${src}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen class="w-full aspect-video border-0"></iframe>
  </div>`;
}

function isImageUrl(s: string) {
  return /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(s.trim());
}

function isVideoUrl(s: string) {
  const v = s.trim();
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(v) || v.startsWith('/api/assets/');
}

function extractIframeSrc(html: string) {
  const m = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function parseMediaInput(input: string): { imageUrl?: string; html?: string } {
  const raw = input.trim();
  if (!raw) return {};

  // If full iframe embed provided
  const iframeSrc = raw.startsWith("<iframe") ? extractIframeSrc(raw) : null;
  const candidate = iframeSrc || raw;

  if (/youtube\.com|youtu\.be/i.test(candidate)) {
    return { html: buildYouTubeEmbed(candidate) };
  }
  if (/facebook\.com|fb\.watch/i.test(candidate)) {
    // Only embed FB when it's clearly a video link
    if (/video|videos|watch|plugins\/video\.php/i.test(candidate)) {
      return { html: buildFacebookEmbed(candidate) };
    }
    // otherwise let resolver handle below
  }
  if (isImageUrl(candidate)) {
    return { imageUrl: candidate };
  }
  // Unknown: if it's http(s) and ends with common video extensions, fallback to <video>
  if (/^https?:\/\//i.test(candidate) && /\.(mp4|webm|ogg)(\?.*)?$/i.test(candidate)) {
    const html = `<video src="${candidate}" class="w-full rounded-lg" playsinline muted autoplay loop controlslist="nodownload noplaybackrate" />`;
    return { html };
  }
  return {};
}

function ComposerContent() {
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<"text" | "html">("text");
  const [content, setContent] = useState("");
  const [mediaInput, setMediaInput] = useState("");
  const [image, setImage] = useState("");
  const [embedHtml, setEmbedHtml] = useState("");
  const [type, setType] = useState<"post" | "video" | "reel">("post");
  const [monetized, setMonetized] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canProceed = useMemo(() => {
    return (content && content.trim().length > 0) || !!mediaInput.trim() || !!image;
  }, [content, mediaInput, image]);

  const reset = useCallback(() => {
    setExpanded(false);
    setStep(1);
    setMode("text");
    setContent("");
    setMediaInput("");
    setImage("");
    setEmbedHtml("");
    setType("post");
    setMonetized(false);
    setSubmitting(false);
  }, []);

  const handleNext = useCallback(async () => {
    let parsed = parseMediaInput(mediaInput);
    // If it's an absolute HTTP(S) link, try resolving content-type
    if (!parsed.imageUrl && !parsed.html && /^https?:\/\//i.test(mediaInput.trim())) {
      try {
        const r = await fetch(`/api/resolve?url=${encodeURIComponent(mediaInput.trim())}`);
        if (r.ok) {
          const d = await r.json();
          if (d.kind === 'image') parsed = { imageUrl: d.url };
          else if (d.kind === 'video') parsed = { html: `<video src="${d.url}" class="w-full rounded-lg" controls playsinline />` };
        }
      } catch {}
    }
    // If it's a local uploaded video (/api/assets/...) or direct .mp4, show video preview
    if (!parsed.imageUrl && !parsed.html && isVideoUrl(mediaInput.trim())) {
      parsed = { html: `<video src="${mediaInput.trim()}" class="w-full rounded-lg" controls playsinline />` };
    }
    if (parsed.imageUrl) setImage(parsed.imageUrl);
    if (parsed.html) setEmbedHtml(parsed.html);
    if (parsed.html && mode !== "html") setMode("html");
    setStep(2);
  }, [mediaInput, mode]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token") || "";

      let finalContent = content;
      let finalMode: "text" | "html" = mode;
      let imageUrl: string | undefined = image || undefined;
      let videoUrl: string | undefined = undefined;
      // If user uploaded/entered a direct video link (e.g., /api/assets/.. or .mp4), publish via video_url
      if (!embedHtml && isVideoUrl(mediaInput.trim())) {
        videoUrl = mediaInput.trim();
      }

      if (embedHtml) {
        finalMode = "html";
        const textPart = content.trim() ? `<div class=\"whitespace-pre-wrap\">${content.replace(/</g, "&lt;")}</div>` : "";
        finalContent = `${textPart}${embedHtml}`;
        // When embedding via HTML, store media in content only
        imageUrl = undefined;
        videoUrl = undefined;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ content: finalContent, content_mode: finalMode, image_url: imageUrl, video_url: videoUrl, type, monetized }),
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
    } finally {
      setSubmitting(false);
    }
  }, [content, mode, image, embedHtml, mediaInput, type, monetized, reset]);

  if (!expanded) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="p-3 flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={(getUser()?.avatar_url as string) || "https://i.pravatar.cc/100?img=68"} alt={getUser()?.name || "You"} />
            <AvatarFallback>{(getUser()?.name || "YOU").slice(0,2).toUpperCase()}</AvatarFallback>
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
            <AvatarImage src={(getUser()?.avatar_url as string) || "https://i.pravatar.cc/100?img=68"} alt={getUser()?.name || "You"} />
            <AvatarFallback>{(getUser()?.name || "YOU").slice(0,2).toUpperCase()}</AvatarFallback>
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

            <textarea
              value={mediaInput}
              onChange={(e) => setMediaInput(e.target.value)}
              placeholder="Paste image URL or YouTube/Facebook link or iframe embed code"
              className="min-h-20 w-full rounded-md bg-muted/60 p-2 text-sm"
            />

            {image ? <img src={image} alt="preview" className="mt-2 rounded-md max-w-full h-auto" /> : null}
            {!image && isVideoUrl(mediaInput) ? (
              <video src={mediaInput.trim()} className="mt-2 w-full rounded-md" controls />
            ) : null}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs">
                <label className="inline-flex items-center gap-1 cursor-pointer px-2 py-1 rounded bg-muted/60">
                  <Upload className="size-3" /> Upload photo
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0]; if (!f) return; try { const url = await uploadAsset(f); setImage(url); setMediaInput(""); } catch (err:any) { alert(err?.message || 'Upload failed'); }
                  }} />
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer px-2 py-1 rounded bg-muted/60">
                  <Upload className="size-3" /> Upload video
                  <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0]; if (!f) return; try { const url = await uploadAsset(f); setEmbedHtml(""); setImage(""); setMediaInput(url); setMode('text'); } catch (err:any) { alert(err?.message || 'Upload failed'); }
                  }} />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
                <Button size="sm" onClick={handleNext} disabled={!canProceed}>Next</Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          <div className="rounded-md border bg-background p-3 text-sm">
            {mode === 'html' ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: embedHtml ? `${content.trim() ? `<div class=\"whitespace-pre-wrap\">${content.replace(/</g, "&lt;")}</div>` : ''}${embedHtml}` : content }} />
            ) : (
              <div className="whitespace-pre-wrap">{content}</div>
            )}
            {image ? <img src={image} alt="preview" className="mt-2 rounded-md max-w-full h-auto" /> : null}
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
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} disabled={submitting}>Back</Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={reset} disabled={submitting}>Discard</Button>
              <Button size="sm" onClick={submit} disabled={submitting}>
                {submitting ? "Sharing..." : "Share"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ComposerContent);
