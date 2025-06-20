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
    const vetId = searchParams.get("vet_id")
    const date = searchParams.get("date")

    if (!vetId || !date) {
      return NextResponse.json({ error: "Veterinarian ID and date are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: slots, error } = await supabase
      .from("appointment_slots")
      .select("*")
      .eq("veterinarian_id", vetId)
      .eq("date", date)
      .order("start_time", { ascending: true })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch time slots" }, { status: 500 })
    }

    return NextResponse.json({ slots })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
