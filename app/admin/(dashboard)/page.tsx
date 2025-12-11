'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FolderOpen, ClipboardCheck, TrendingUp } from 'lucide-react';
import api from '@/lib/api/client';

interface DashboardStats {
  total_users: number;
  total_portfolios: number;
  pending_review: number;
  published_today: number;
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get<{ data: DashboardStats }>('/admin/stats');
      return response.data.data;
    },
  });

  const stats = [
    {
      title: 'Total Users',
      value: data?.total_users ?? 0,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Total Portfolios',
      value: data?.total_portfolios ?? 0,
      icon: FolderOpen,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Pending Review',
      value: data?.pending_review ?? 0,
      icon: ClipboardCheck,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Published Today',
      value: data?.published_today ?? 0,
      icon: TrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/moderation" className="block rounded-lg border p-4 transition-colors hover:bg-muted">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Review Portfolios</p>
                  <p className="text-sm text-muted-foreground">
                    {data?.pending_review ?? 0} portfolios menunggu review
                  </p>
                </div>
              </div>
            </a>
            <a href="/admin/users" className="block rounded-lg border p-4 transition-colors hover:bg-muted">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Manage Users</p>
                  <p className="text-sm text-muted-foreground">Kelola data pengguna</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <span>Grafikarsa v1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment</span>
                <span>Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Status</span>
                <span className="text-green-500">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
