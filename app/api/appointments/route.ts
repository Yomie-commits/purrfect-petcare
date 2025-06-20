import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    let query = supabase
      .from("appointments")
      .select(`
        *,
        pets (name, breed),
        users!appointments_vet_id_fkey (name, email)
      `)
      .order("date", { ascending: true })

    // Filter based on user role
    if (user.role === "pet_owner") {
      query = query.eq("pets.user_id", user.id)
    } else if (user.role === "vet") {
      query = query.eq("vet_id", user.id)
    }

    const { data: appointments, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    return NextResponse.json({ appointments })
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

    const { pet_id, vet_id, date, service_type, notes } = await request.json()

    if (!pet_id || !vet_id || !date) {
      return NextResponse.json(
        {
          error: "Pet ID, vet ID, and date are required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        pet_id,
        vet_id,
        date,
        service_type,
        notes,
      })
      .select(`
        *,
        pets (name, breed),
        users!appointments_vet_id_fkey (name, email)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
