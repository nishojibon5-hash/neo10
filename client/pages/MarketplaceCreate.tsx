import Layout from "@/components/neo10/Layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { uploadAsset } from "@/lib/upload";
import { useNavigate } from "react-router-dom";

interface Form {
  title: string;
  price?: number;
  description: string;
  location?: string;
  category?: string;
  contact_phone?: string;
  image?: FileList;
}

export default function MarketplaceCreate() {
  const { register, handleSubmit, setValue, watch } = useForm<Form>();
  const navigate = useNavigate();
  const imageFile = watch("image");

  const onSubmit = async (values: Form) => {
    let image_url: string | undefined;
    if (values.image && values.image[0]) {
      image_url = await uploadAsset(values.image[0]);
    }
    const payload: any = {
      title: values.title,
      description: values.description,
      price: values.price ? Number(values.price) : undefined,
      image_url,
      location: values.location,
      category: values.category,
      contact_phone: values.contact_phone,
    };
    const token = localStorage.getItem("token") || "";
    const res = await fetch("/api/market/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(payload),
    });
    if (res.ok) navigate("/marketplace");
    else alert("Failed to create listing");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Create Listing</h1>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Input placeholder="Title" {...register("title", { required: true })} />
          <Input type="number" step="1" placeholder="Price (optional)" {...register("price")} />
          <Input placeholder="Location" {...register("location")} />
          <Input placeholder="Category" {...register("category")} />
          <Input placeholder="Contact phone" {...register("contact_phone")} />
          <Textarea rows={5} placeholder="Description" {...register("description", { required: true })} />
          <div>
            <input type="file" accept="image/*" onChange={(e) => setValue("image", e.target.files as any)} />
            {imageFile && imageFile[0] && (
              <img src={URL.createObjectURL(imageFile[0])} alt="preview" className="mt-2 h-32 object-cover rounded" />
            )}
          </div>
          <Button type="submit">Publish</Button>
        </form>
      </div>
    </Layout>
  );
}
