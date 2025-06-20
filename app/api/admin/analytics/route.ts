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
    const period = searchParams.get("period") || "30" // days
    const startDate = new Date(Date.now() - Number.parseInt(period) * 24 * 60 * 60 * 1000)

    const supabase = createServerClient()

    // Get user registration trends
    const { data: userRegistrations } = await supabase
      .from("users")
      .select("created_at, role")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    // Get appointment statistics
    const { data: appointments } = await supabase
      .from("appointments")
      .select("created_at, status, date")
      .gte("created_at", startDate.toISOString())

    // Get payment statistics
    const { data: payments } = await supabase
      .from("payments")
      .select("created_at, amount, status, method")
      .gte("created_at", startDate.toISOString())

    // Get pet registrations
    const { data: pets } = await supabase
      .from("pets")
      .select("created_at, breed")
      .gte("created_at", startDate.toISOString())

    // Get lost pet reports
    const { data: lostPets } = await supabase
      .from("lost_pets")
      .select("created_at, status, species")
      .gte("created_at", startDate.toISOString())

    // Get adoption listings
    const { data: adoptionListings } = await supabase
      .from("adoption_listings")
      .select("created_at, status, species")
      .gte("created_at", startDate.toISOString())

    // Calculate metrics
    const totalUsers = userRegistrations?.length || 0
    const totalRevenue = payments?.reduce((sum, p) => sum + (p.status === "completed" ? p.amount : 0), 0) || 0
    const totalAppointments = appointments?.length || 0
    const completedAppointments = appointments?.filter((a) => a.status === "completed").length || 0
    const totalPets = pets?.length || 0
    const activeLostPets = lostPets?.filter((p) => p.status === "lost").length || 0
    const availableAdoptions = adoptionListings?.filter((l) => l.status === "available").length || 0

    // Group data by date for charts
    const groupByDate = (data: any[], dateField = "created_at") => {
      const grouped: { [key: string]: number } = {}
      data?.forEach((item) => {
        const date = new Date(item[dateField]).toISOString().split("T")[0]
        grouped[date] = (grouped[date] || 0) + 1
      })
      return Object.entries(grouped).map(([date, count]) => ({ date, count }))
    }

    const userRegistrationTrend = groupByDate(userRegistrations || [])
    const appointmentTrend = groupByDate(appointments || [])
    const revenueTrend =
      payments?.reduce((acc: any[], payment) => {
        if (payment.status === "completed") {
          const date = new Date(payment.created_at).toISOString().split("T")[0]
          const existing = acc.find((item) => item.date === date)
          if (existing) {
            existing.amount += payment.amount
          } else {
            acc.push({ date, amount: payment.amount })
          }
        }
        return acc
      }, []) || []

    // Payment method breakdown
    const paymentMethods =
      payments?.reduce((acc: any, payment) => {
        if (payment.status === "completed") {
          acc[payment.method] = (acc[payment.method] || 0) + 1
        }
        return acc
      }, {}) || {}

    // Species breakdown
    const petSpecies =
      pets?.reduce((acc: any, pet) => {
        const species = pet.breed?.split(" ")[0] || "Unknown"
        acc[species] = (acc[species] || 0) + 1
        return acc
      }, {}) || {}

    return NextResponse.json({
      summary: {
        totalUsers,
        totalRevenue,
        totalAppointments,
        completedAppointments,
        totalPets,
        activeLostPets,
        availableAdoptions,
        appointmentCompletionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
      },
      trends: {
        userRegistrations: userRegistrationTrend,
        appointments: appointmentTrend,
        revenue: revenueTrend,
      },
      breakdowns: {
        paymentMethods,
        petSpecies,
        userRoles:
          userRegistrations?.reduce((acc: any, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1
            return acc
          }, {}) || {},
      },
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
