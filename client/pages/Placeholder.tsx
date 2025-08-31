import Layout from "@/components/neo10/Layout";

export default function Placeholder({ title }: { title: string }) {
  return (
    <Layout>
      <div className="rounded-xl border bg-card p-8 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">This page will be built next. Tell Fusion to generate it.</p>
      </div>
    </Layout>
  );
}
