import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  School,
  MessageSquare,
  AlertTriangle,
  Clock,
  Building2,
  UserCog,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

const fetchDashboardData = async () => {
  const response = await fetch("http://localhost:8080/api/admin/dashboard", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
};

export default function AdminDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      description: "Registered users across all roles",
    },
    {
      title: "Total Colleges",
      value: dashboardData?.totalColleges || 0,
      icon: School,
      description: "Active colleges in the system",
    },
    {
      title: "Total Questions",
      value: dashboardData?.totalQuestions || 0,
      icon: MessageSquare,
      description: "Questions posted by users",
    },
    {
      title: "Reported Content",
      value: dashboardData?.reportedContent || 0,
      icon: AlertTriangle,
      description: "Content flagged for review",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your platform's statistics and recent activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {dashboardData?.recentActivity?.newColleges?.map((college) => (
                    <div
                      key={college._id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <div className="mt-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          New College: {college.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created by {college.createdBy?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(college.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {dashboardData?.recentActivity?.newAdmins?.map((admin) => (
                    <div
                      key={admin._id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <div className="mt-1">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          New Admin: {admin.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {admin.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(admin.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {dashboardData?.recentActivity?.newColleges?.map((college) => (
                    <div
                      key={college._id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <div className="mt-1">
                        <Building2 className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          New College Request
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {college.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(college.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {dashboardData?.recentActivity?.newAdmins?.map((admin) => (
                    <div
                      key={admin._id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <div className="mt-1">
                        <UserCog className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          New Admin Request
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {admin.name} ({admin.email})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(admin.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 