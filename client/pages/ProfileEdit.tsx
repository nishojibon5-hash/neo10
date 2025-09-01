import Layout from "@/components/neo10/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { getToken } from "@/lib/auth";
import { uploadAsset } from "@/lib/upload";

type Form = { name?: string; username?: string; avatar_url?: string; cover_url?: string; bio?: string };

export default function ProfileEdit() {
  const { register, handleSubmit, setValue, watch } = useForm<Form>();

  const onSubmit = async (values: Form) => {
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (res.ok) alert("Saved"); else alert(data.error || "Failed");
  };

  const avatar = watch("avatar_url");
  const cover = watch("cover_url");

  const pickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const url = await uploadAsset(f);
      setValue("avatar_url", url, { shouldDirty: true, shouldTouch: true });
    } catch (e: any) {
      alert(e?.message || "Avatar upload failed");
    }
  };
  const pickCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const url = await uploadAsset(f);
      setValue("cover_url", url, { shouldDirty: true, shouldTouch: true });
    } catch (e: any) {
      alert(e?.message || "Cover upload failed");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl rounded-xl border bg-card p-6 space-y-3">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input placeholder="Name" {...register("name")} />
          <Input placeholder="Username" {...register("username")} />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input placeholder="Avatar URL" {...register("avatar_url")} />
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="file" accept="image/*" onChange={pickAvatar} />
              </label>
            </div>
            {avatar ? <img src={avatar} alt="avatar" className="h-20 w-20 rounded-full object-cover" /> : null}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input placeholder="Cover URL" {...register("cover_url")} />
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="file" accept="image/*" onChange={pickCover} />
              </label>
            </div>
            {cover ? <img src={cover} alt="cover" className="h-24 w-full object-cover rounded" /> : null}
          </div>
          <textarea placeholder="Bio" {...register("bio")} className="min-h-24 w-full rounded-md border bg-background p-2 text-sm" />
          <Button type="submit" className="w-full">Save changes</Button>
        </form>
      </div>
    </Layout>
  );
}
