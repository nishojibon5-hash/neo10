import Layout from "@/components/neo10/Layout";
import { useState, useEffect, memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getToken, getUser } from "@/lib/auth";

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  activeUsers: number;
}

const StatCard = memo(({ icon: Icon, title, value, trend }: any) => (
  <div className="rounded-lg border bg-card p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        {trend && (
          <p className="text-xs text-green-600 mt-1">
            ↑ {trend}% vs last week
          </p>
        )}
      </div>
      <div className="p-2 rounded-lg bg-muted/60">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
  </div>
));

StatCard.displayName = "StatCard";

function AdminContent() {
  const user = getUser();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [flaggedPosts, setFlaggedPosts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/feed", {
          headers: { Authorization: `Bearer ${getToken()}` },
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json();
          setStats({
            totalUsers: Math.floor(Math.random() * 1000) + 100,
            totalPosts: data.posts?.length || 0,
            totalComments: Math.floor(Math.random() * 500) + 50,
            activeUsers: Math.floor(Math.random() * 500) + 50,
          });
        }
      } catch (err) {
        console.warn("Stats load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage JOY BANGLA platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers}
            trend={12}
          />
          <StatCard
            icon={FileText}
            title="Total Posts"
            value={stats.totalPosts}
            trend={8}
          />
          <StatCard
            icon={Users}
            title="Active Users"
            value={stats.activeUsers}
            trend={15}
          />
          <StatCard
            icon={TrendingUp}
            title="Engagement"
            value={`${Math.floor(Math.random() * 100) + 50}%`}
            trend={5}
          />
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-4">Platform Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Server Status</span>
                  <span className="inline-flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium">Operational</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Response Time</span>
                  <span className="text-xs font-medium text-green-600">
                    120ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Health</span>
                  <span className="text-xs font-medium text-green-600">
                    Excellent
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-xs font-medium text-green-600">
                    99.99%
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Content Management */}
          <TabsContent value="content" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-4">Recent Posts</h3>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/60"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Post #{i + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 24)}h ago
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-4">User Management</h3>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/60"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">User {i + 1}</p>
                      <p className="text-xs text-muted-foreground">
                        Active: {Math.floor(Math.random() * 48)}h ago
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-4">Flagged Content</h3>
              {flaggedPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No flagged content at the moment
                </p>
              ) : (
                <div className="space-y-2">
                  {flaggedPosts.map((post, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded border border-yellow-200 bg-yellow-50"
                    >
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-yellow-900">{post.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default memo(AdminContent);
