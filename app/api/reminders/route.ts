import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get("upcoming") === "true"
    const type = searchParams.get("type")

    const supabase = createServerClient()

    let query = supabase
      .from("reminders")
      .select(`
        *,
        pets (name, breed)
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("due_date", { ascending: true })

    if (upcoming) {
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      query = query.lte("due_date", nextWeek.toISOString())
    }

    if (type) query = query.eq("type", type)

    const { data: reminders, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
    }

    return NextResponse.json({ reminders })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pet_id, type, title, description, due_date, recurring, recurring_interval } = await request.json()

    if (!pet_id || !type || !title || !due_date) {
      return NextResponse.json(
        {
          error: "Pet ID, type, title, and due date are required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    const { data: reminder, error } = await supabase
      .from("reminders")
      .insert({
        user_id: user.id,
        pet_id,
        type,
        title,
        description,
        due_date: new Date(due_date).toISOString(),
        recurring,
        recurring_interval,
      })
      .select(`
        *,
        pets (name, breed)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 })
    }

    return NextResponse.json({ reminder })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
