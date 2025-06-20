import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get comprehensive health data for the pet
    const [
      { data: pet },
      { data: healthRecords },
      { data: vaccinations },
      { data: healthMetrics },
      { data: healthAlerts },
      { data: behaviorLogs },
    ] = await Promise.all([
      supabase.from("pets").select("*").eq("id", params.id).eq("user_id", user.id).single(),
      supabase.from("health_records").select("*").eq("pet_id", params.id).order("date", { ascending: false }),
      supabase
        .from("vaccinations")
        .select("*")
        .eq("pet_id", params.id)
        .order("date_administered", { ascending: false }),
      supabase
        .from("health_metrics")
        .select("*")
        .eq("pet_id", params.id)
        .gte("recorded_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("recorded_at", { ascending: false }),
      supabase
        .from("health_alerts")
        .select("*")
        .eq("pet_id", params.id)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase
        .from("behavior_logs")
        .select("*")
        .eq("pet_id", params.id)
        .gte("logged_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("logged_at", { ascending: false }),
    ])

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    // Calculate health insights
    const weightMetrics = healthMetrics?.filter((m) => m.metric_type === "weight") || []
    const activityMetrics = healthMetrics?.filter((m) => m.metric_type === "activity") || []
    const eatingMetrics = healthMetrics?.filter((m) => m.metric_type === "eating") || []

    const healthInsights = {
      weightTrend: calculateTrend(weightMetrics),
      activityLevel: calculateAverage(activityMetrics),
      eatingPattern: calculateAverage(eatingMetrics),
      lastCheckup: healthRecords?.[0]?.date || null,
      upcomingVaccinations:
        vaccinations?.filter((v) => v.next_due_date && new Date(v.next_due_date) > new Date()).slice(0, 3) || [],
      activeAlerts: healthAlerts?.length || 0,
    }

    return NextResponse.json({
      pet,
      healthRecords,
      vaccinations,
      healthMetrics,
      healthAlerts,
      behaviorLogs,
      healthInsights,
    })
  } catch (error) {
    console.error("Error fetching pet health data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, data } = await request.json()
    const supabase = createServerClient()

    // Verify pet ownership
    const { data: pet } = await supabase.from("pets").select("id").eq("id", params.id).eq("user_id", user.id).single()

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    let result

    switch (type) {
      case "health_record":
        result = await supabase
          .from("health_records")
          .insert({ pet_id: params.id, ...data })
          .select()
          .single()
        break

      case "vaccination":
        result = await supabase
          .from("vaccinations")
          .insert({ pet_id: params.id, ...data })
          .select()
          .single()
        break

      case "health_metric":
        result = await supabase
          .from("health_metrics")
          .insert({ pet_id: params.id, ...data })
          .select()
          .single()

        // Trigger AI analysis for health alerts
        await analyzeHealthMetrics(params.id, data)
        break

      case "behavior_log":
        result = await supabase
          .from("behavior_logs")
          .insert({ pet_id: params.id, logged_by: user.id, ...data })
          .select()
          .single()
        break

      default:
        return NextResponse.json({ error: "Invalid data type" }, { status: 400 })
    }

    if (result.error) {
      return NextResponse.json({ error: "Failed to save data" }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error("Error saving pet health data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateTrend(metrics: any[]) {
  if (metrics.length < 2) return "stable"

  const recent = metrics.slice(0, 3)
  const older = metrics.slice(3, 6)

  const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length
  const olderAvg = older.reduce((sum, m) => sum + m.value, 0) / older.length

  const change = ((recentAvg - olderAvg) / olderAvg) * 100

  if (change > 5) return "increasing"
  if (change < -5) return "decreasing"
  return "stable"
}

function calculateAverage(metrics: any[]) {
  if (metrics.length === 0) return 0
  return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
}

async function analyzeHealthMetrics(petId: string, newMetric: any) {
  // AI-powered health analysis would go here
  // For now, implement basic rule-based alerts

  const supabase = createServerClient()

  if (newMetric.metric_type === "weight") {
    // Get recent weight measurements
    const { data: recentWeights } = await supabase
      .from("health_metrics")
      .select("value")
      .eq("pet_id", petId)
      .eq("metric_type", "weight")
      .order("recorded_at", { ascending: false })
      .limit(5)

    if (recentWeights && recentWeights.length >= 2) {
      const currentWeight = recentWeights[0].value
      const previousWeight = recentWeights[1].value
      const weightChange = ((currentWeight - previousWeight) / previousWeight) * 100

      if (Math.abs(weightChange) > 10) {
        await supabase.from("health_alerts").insert({
          pet_id: petId,
          alert_type: "weight_change",
          severity: Math.abs(weightChange) > 20 ? "high" : "medium",
          title: `Significant Weight ${weightChange > 0 ? "Gain" : "Loss"} Detected`,
          description: `Your pet's weight has ${weightChange > 0 ? "increased" : "decreased"} by ${Math.abs(weightChange).toFixed(1)}% since the last measurement.`,
          recommendations: "Consider consulting with your veterinarian about this weight change.",
          triggered_by: { metric_type: "weight", change_percentage: weightChange },
        })
      }
    }
  }
}
