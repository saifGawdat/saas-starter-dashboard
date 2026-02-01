import { auth } from "@/auth"
import { db } from "@/lib/db"
import { StatsCard } from "@/components/dashboard/stats-card"
import { AreaChart } from "@/components/dashboard/charts/area-chart"
import { LineChart } from "@/components/dashboard/charts/line-chart"
import { PieChart } from "@/components/dashboard/charts/pie-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import {
  getDashboardStats,
  getUserGrowthData,
  getSubscriptionTrends,
  getPostsByCategory,
  getPlanDistribution,
  getRecentActivity,
  getVisitorStats,
  getActiveUsers,
  getPageViewTrends,
} from "@/lib/dashboard/analytics"

export const metadata = {
  title: "Dashboard - Overview",
  description: "Dashboard overview page",
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Get user-specific stats for regular users
async function getUserStats(userId: string) {
  const [
    userPosts,
    userPublishedPosts,
    userDraftPosts,
    userMedia,
    recentUserPosts,
  ] = await Promise.all([
    db.post.count({ where: { authorId: userId } }),
    db.post.count({ where: { authorId: userId, status: "PUBLISHED" } }),
    db.post.count({ where: { authorId: userId, status: "DRAFT" } }),
    db.media.count({ where: { uploadedBy: userId } }),
    db.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        _count: { select: { tags: true } },
      },
    }),
  ])

  return {
    totalPosts: userPosts,
    publishedPosts: userPublishedPosts,
    draftPosts: userDraftPosts,
    totalMedia: userMedia,
    recentPosts: recentUserPosts,
  }
}

// Get user's recent activity
async function getUserRecentActivity(userId: string, limit = 10) {
  const activities = await db.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return activities.map((activity) => ({
    id: activity.id,
    user: { name: "You", image: undefined },
    action: activity.action,
    entity: activity.entity,
    entityName: activity.description?.split("'")[1] || activity.entityId || undefined,
    createdAt: activity.createdAt,
  }))
}

export default async function DashboardPage() {
  const session = await auth()

  // Check permissions - any role with analytics.view can see full dashboard
  const permissions = session?.user?.permissions || []
  const canViewAnalytics = permissions.includes("analytics.view")

  if (canViewAnalytics) {
    // Admin/Analytics view - full dashboard
    const [
      stats,
      userGrowth,
      subscriptionTrends,
      postsByCategory,
      planDistribution,
      recentActivities,
      visitorStats,
      activeUsers,
      pageViewTrends,
    ] = await Promise.all([
      getDashboardStats(),
      getUserGrowthData(),
      getSubscriptionTrends(),
      getPostsByCategory(),
      getPlanDistribution(),
      getRecentActivity(10),
      getVisitorStats(),
      getActiveUsers(),
      getPageViewTrends(),
    ])

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your site.
          </p>
        </div>

        {/* Stats Cards */}
        <div data-tour="dashboard-stats" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatsCard
            title="Total Users"
            value={formatNumber(stats.totalUsers)}
            icon="Users"
            trend={{
              value: Math.abs(stats.trends.users),
              isPositive: stats.trends.users >= 0,
            }}
            description="from last month"
          />
          <StatsCard
            title="Active Users"
            value={formatNumber(activeUsers.active24Hours)}
            icon="Activity"
            description={`${activeUsers.activeNow} online now`}
          />
          <StatsCard
            title="Page Views"
            value={formatNumber(visitorStats.pageViews.last30Days)}
            icon="Eye"
            description={`${formatNumber(visitorStats.uniqueVisitors.last30Days)} unique visitors`}
          />
          <StatsCard
            title="Total Posts"
            value={formatNumber(stats.totalPosts)}
            icon="FileText"
            trend={{
              value: Math.abs(stats.trends.posts),
              isPositive: stats.trends.posts >= 0,
            }}
            description="from last month"
          />
          <StatsCard
            title="Active Subscriptions"
            value={formatNumber(stats.activeSubscriptions)}
            icon="CreditCard"
            trend={{
              value: Math.abs(stats.trends.subscriptions),
              isPositive: stats.trends.subscriptions >= 0,
            }}
            description="from last month"
          />
          <StatsCard
            title="Monthly Revenue"
            value={formatCurrency(stats.mrr)}
            icon="DollarSign"
            description="recurring revenue"
          />
        </div>

        {/* Charts Row 1: User Growth & Page Views */}
        <div className="grid gap-4 lg:grid-cols-2">
          <LineChart
            title="User Growth"
            description="New and total users over time"
            data={userGrowth}
            xAxisKey="month"
            lines={[
              { dataKey: "totalUsers", color: "hsl(var(--chart-1))", name: "Total Users" },
              { dataKey: "newUsers", color: "hsl(var(--chart-2))", name: "New Users" },
            ]}
          />
          <LineChart
            title="Visitor Traffic"
            description="Page views and unique visitors over the last 14 days"
            data={pageViewTrends}
            xAxisKey="date"
            lines={[
              { dataKey: "pageViews", color: "hsl(var(--chart-3))", name: "Page Views" },
              { dataKey: "uniqueVisitors", color: "hsl(var(--chart-4))", name: "Unique Visitors" },
            ]}
          />
        </div>

        {/* Charts Row 2: Revenue */}
        <div className="grid gap-4 lg:grid-cols-1">
          <AreaChart
            title="Revenue Trend"
            description="Monthly recurring revenue"
            data={subscriptionTrends}
            dataKey="revenue"
            xAxisKey="month"
            color="hsl(var(--chart-3))"
          />
        </div>

        {/* Charts Row 3: Distribution Charts & Activity */}
        <div className="grid gap-4 lg:grid-cols-3">
          <PieChart
            title="Posts by Category"
            description="Distribution of content"
            data={postsByCategory.length > 0 ? postsByCategory : [{ name: "No posts", value: 1, color: "hsl(var(--muted))" }]}
          />
          <PieChart
            title="Subscriptions by Plan"
            description="Active subscriptions per plan"
            data={planDistribution.length > 0 ? planDistribution : [{ name: "No subscriptions", value: 1, color: "hsl(var(--muted))" }]}
          />
          <RecentActivity activities={recentActivities} />
        </div>
      </div>
    )
  }

  // Regular user view - personal dashboard
  const userId = session?.user?.id
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
      </div>
    )
  }

  const [userStats, userActivity] = await Promise.all([
    getUserStats(userId),
    getUserRecentActivity(userId, 10),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "User"}! Here&apos;s your activity overview.
        </p>
      </div>

      {/* User Stats Cards */}
      <div data-tour="dashboard-stats" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Posts"
          value={formatNumber(userStats.totalPosts)}
          icon="FileText"
          description="total posts created"
        />
        <StatsCard
          title="Published"
          value={formatNumber(userStats.publishedPosts)}
          icon="Globe"
          description="posts published"
        />
        <StatsCard
          title="Drafts"
          value={formatNumber(userStats.draftPosts)}
          icon="FileEdit"
          description="posts in draft"
        />
        <StatsCard
          title="Media Files"
          value={formatNumber(userStats.totalMedia)}
          icon="Image"
          description="files uploaded"
        />
      </div>

      {/* Recent Posts & Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Posts */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Recent Posts</h3>
          {userStats.recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet. Create your first post!</p>
          ) : (
            <div className="space-y-3">
              {userStats.recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.status.toLowerCase()} · {post._count.tags} tags
                    </p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    post.status === "PUBLISHED"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}>
                    {post.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={userActivity} />
      </div>
    </div>
  )
}
