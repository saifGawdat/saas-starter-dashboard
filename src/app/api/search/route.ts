import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/config/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ posts: [], users: [], plans: [] });
    }

    // Search based on permissions
    const [posts, users, plans] = await Promise.all([
      // Search posts if has permission
      hasPermission(session, PERMISSIONS.POSTS_VIEW)
        ? db.post.findMany({
            where: {
              OR: [
                { title: { contains: query } },
                { excerpt: { contains: query } },
              ],
            },
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              author: {
                select: { name: true },
              },
            },
            take: 5,
            orderBy: { updatedAt: "desc" },
          })
        : Promise.resolve([]),

      // Search users if has permission
      hasPermission(session, PERMISSIONS.USERS_VIEW)
        ? db.user.findMany({
            where: {
              OR: [
                { name: { contains: query } },
                { email: { contains: query } },
              ],
            },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: {
                select: { name: true },
              },
            },
            take: 5,
            orderBy: { name: "asc" },
          })
        : Promise.resolve([]),

      // Search plans if has permission
      hasPermission(session, PERMISSIONS.PLANS_VIEW)
        ? db.plan.findMany({
            where: {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
              ],
            },
            select: {
              id: true,
              name: true,
              monthlyPrice: true,
              status: true,
            },
            take: 5,
            orderBy: { sortOrder: "asc" },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({ posts, users, plans });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
