import { Image, Video, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Composer() {
  return (
    <div className="rounded-xl border bg-card">
      <div className="p-3 flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://i.pravatar.cc/100?img=68" alt="You" />
          <AvatarFallback>YOU</AvatarFallback>
        </Avatar>
        <input
          placeholder="What's on your mind?"
          className="h-10 w-full rounded-full bg-muted/60 px-4 outline-none focus:ring-2 focus:ring-primary/40"
        />
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
