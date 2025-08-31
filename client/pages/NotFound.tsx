import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/neo10/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="rounded-xl border bg-card p-12 text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground mb-4">Oops! Page not found</p>
        <Link to="/" className="text-primary hover:underline">
          Return to Home
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
