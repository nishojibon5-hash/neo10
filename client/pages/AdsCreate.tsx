import Layout from "@/components/neo10/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { getToken } from "@/lib/auth";
import { uploadAsset } from "@/lib/upload";
import { useState } from "react";

type Form = {
  title: string;
  destination_url?: string;
  media_url?: string;
  media_type?: "image" | "video";
  locations?: string;
  audience?: string;
  budget?: number;
  start_at?: string;
  end_at?: string;
  trial?: boolean;
  payment_method?: string;
  transaction_id?: string;
};

export default function AdsCreate() {
  const { register, handleSubmit, setValue, watch } = useForm<Form>({ defaultValues: { trial: true } });
  const [submitting, setSubmitting] = useState(false);
  const mediaUrl = watch("media_url");
  const mediaType = watch("media_type");
  const trial = watch("trial");
  const endAt = watch("end_at");

  const pickMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadAsset(f);
    setValue("media_url", url);
    setValue("media_type", f.type.startsWith("video") ? "video" : "image");
  };

  const onSubmit = async (values: Form) => {
    setSubmitting(true);
    const res = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) alert("Ad created. Status: " + data.status); else alert(data.error || "Failed");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6 space-y-3">
        <h1 className="text-2xl font-bold">Create Ads</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input placeholder="Ad title" {...register("title", { required: true })} />
          <Input placeholder="Destination URL (optional)" {...register("destination_url")} />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input placeholder="Media URL" {...register("media_url")} />
              <input type="file" accept="image/*,video/*" onChange={pickMedia} />
            </div>
            {mediaUrl ? (
              mediaType === "video" ? (
                <video src={mediaUrl} className="w-full h-auto rounded" controls />
              ) : (
                <img src={mediaUrl} className="w-full h-auto rounded" />
              )
            ) : null}
          </div>

          <Input placeholder="Locations (e.g. Dhaka, Chittagong)" {...register("locations")} />
          <Input placeholder="Audience (interests, keywords)" {...register("audience")} />
          <Input type="number" step="0.01" placeholder="Budget (optional)" {...register("budget", { valueAsNumber: true })} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="datetime-local" placeholder="Start at" {...register("start_at")} />
            <Input type="datetime-local" placeholder="End at" {...register("end_at")} />
          </div>

          <div className="rounded-md border p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">2-day free trial</div>
              <input type="checkbox" {...register("trial")} />
            </div>
            <p className="text-muted-foreground">If enabled, your ad goes live instantly for 2 days. To run longer than 2 days, complete payment below.</p>
            {!trial && (
              <div className="space-y-2">
                <div className="font-medium">Payment (bKash/Nagad)</div>
                <p className="text-muted-foreground">Pay to 01650074073 (personal). After payment, enter method and transaction ID to activate.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Method (bKash/Nagad)" {...register("payment_method")} />
                  <Input placeholder="Transaction ID" {...register("transaction_id")} />
                </div>
              </div>
            )}
            {trial && endAt ? (
              <p className="text-xs text-amber-600">Note: Trial serves only until 2 days from now, regardless of End at.</p>
            ) : null}
          </div>

          <Button type="submit" disabled={submitting} className="w-full">{submitting ? "Submitting..." : "Submit"}</Button>
        </form>
      </div>
    </Layout>
  );
}
