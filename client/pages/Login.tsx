import Layout from "@/components/neo10/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { setToken, setUser } from "@/lib/auth";

type Form = { identifier: string; password: string };

export default function Login() {
  const { register, handleSubmit } = useForm<Form>();
  const navigate = useNavigate();

  const onSubmit = async (values: Form) => {
    const body: any = { password: values.password };
    if (values.identifier.includes("@")) body.email = values.identifier; else body.phone = values.identifier;
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setUser(data.user);
      navigate("/");
    } else {
      alert(data.error ? JSON.stringify(data.error) : "Login failed");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md rounded-xl border bg-card p-6">
        <h1 className="text-2xl font-bold mb-4">Login to NEO10</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input placeholder="Phone or Email" {...register("identifier", { required: true })} />
          <Input type="password" placeholder="Password" {...register("password", { required: true })} />
          <Button type="submit" className="w-full">Login</Button>
        </form>
        <p className="text-sm text-muted-foreground mt-3">No account? <Link to="/register" className="text-primary hover:underline">Register</Link></p>
      </div>
    </Layout>
  );
}
