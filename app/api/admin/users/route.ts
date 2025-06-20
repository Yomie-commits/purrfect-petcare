import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const supabase = createServerClient()

    let query = supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        role,
        phone,
        address,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    // Apply filters
    if (role) query = query.eq("role", role)
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: users, error, count } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      (users || []).map(async (userData) => {
        const [petsResult, appointmentsResult, paymentsResult] = await Promise.all([
          supabase.from("pets").select("id").eq("user_id", userData.id),
          supabase.from("appointments").select("id").eq("vet_id", userData.id),
          supabase.from("payments").select("amount").eq("user_id", userData.id).eq("status", "completed"),
        ])

        return {
          ...userData,
          stats: {
            totalPets: petsResult.data?.length || 0,
            totalAppointments: appointmentsResult.data?.length || 0,
            totalSpent: paymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0,
          },
        }
      }),
    )

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
