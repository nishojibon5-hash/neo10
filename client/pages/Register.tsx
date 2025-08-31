import Layout from "@/components/neo10/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { setToken, setUser } from "@/lib/auth";

type Form = { name: string; email?: string; phone?: string; password: string; avatar_url?: string };

export default function Register() {
  const { register, handleSubmit } = useForm<Form>();
  const navigate = useNavigate();

  const onSubmit = async (values: Form) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setUser(data.user);
      navigate("/");
    } else {
      alert(data.error ? JSON.stringify(data.error) : "Registration failed");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md rounded-xl border bg-card p-6">
        <h1 className="text-2xl font-bold mb-4">Create your NEO10 account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input placeholder="Full name" {...register("name", { required: true })} />
          <Input placeholder="Email (optional)" {...register("email")} />
          <Input placeholder="Phone (optional)" {...register("phone")} />
          <Input placeholder="Avatar URL (optional)" {...register("avatar_url")} />
          <Input type="password" placeholder="Password" {...register("password", { required: true })} />
          <Button type="submit" className="w-full">Register</Button>
        </form>
        <p className="text-sm text-muted-foreground mt-3">Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link></p>
      </div>
    </Layout>
  );
}
