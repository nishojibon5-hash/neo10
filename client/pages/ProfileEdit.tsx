import Layout from "@/components/neo10/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { getToken } from "@/lib/auth";

type Form = { name?: string; username?: string; avatar_url?: string; cover_url?: string; bio?: string };

export default function ProfileEdit() {
  const { register, handleSubmit } = useForm<Form>();

  const onSubmit = async (values: Form) => {
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (res.ok) alert("Saved"); else alert(data.error || "Failed");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl rounded-xl border bg-card p-6 space-y-3">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input placeholder="Name" {...register("name")} />
          <Input placeholder="Username" {...register("username")} />
          <Input placeholder="Avatar URL" {...register("avatar_url")} />
          <Input placeholder="Cover URL" {...register("cover_url")} />
          <textarea placeholder="Bio" {...register("bio")} className="min-h-24 w-full rounded-md border bg-background p-2 text-sm" />
          <Button type="submit" className="w-full">Save changes</Button>
        </form>
      </div>
    </Layout>
  );
}
